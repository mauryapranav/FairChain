import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env['JWT_SECRET'] ?? 'dev-secret-changeme';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { sub: string; walletAddress: string; role: string };
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  // Check Authorization header first, then cookie
  const authHeader = req.headers['authorization'];
  const token =
    (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null) ??
    (req.cookies as Record<string, string>)['fc_token'];

  if (!token) {
    res.status(401).json({ error: 'No auth token' });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      sub: string;
      walletAddress: string;
      role: string;
    };
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
