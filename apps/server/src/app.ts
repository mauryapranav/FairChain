import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';

import { authRouter }        from './routes/auth';
import { contractsRouter }   from './routes/contracts';
import { escrowRouter }      from './routes/escrow';
import { participantsRouter } from './routes/participants';
import { statsRouter }       from './routes/stats';
import { usersRouter }       from './routes/users';
import { paymentsRouter }    from './routes/payments';
import { ipfsRouter }        from './routes/ipfs';
import { kycRouter }         from './routes/kyc';
import { reputationRouter }  from './routes/reputation';
import { disputesRouter }    from './routes/disputes';
import { chatRouter }        from './routes/chat';
import { transactionsRouter } from './routes/transactions';
import { errorHandler }      from './middleware/errorHandler';

export const app: Express = express();

// ── Security & parsing ───────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin:      process.env['CORS_ORIGIN'] ?? 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser());

// ── Health ───────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'fairchain-api', timestamp: new Date().toISOString() });
});

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',         authRouter);
app.use('/api/users',        usersRouter);
app.use('/api/contracts',    contractsRouter);
app.use('/api/participants', participantsRouter);
app.use('/api/escrow',       escrowRouter);
app.use('/api/payments',     paymentsRouter);
app.use('/api/ipfs',         ipfsRouter);
app.use('/api/kyc',          kycRouter);
app.use('/api/reputation',   reputationRouter);
app.use('/api/disputes',     disputesRouter);
app.use('/api/chat',         chatRouter);
app.use('/api/stats',        statsRouter);
app.use('/api/transactions', transactionsRouter);

// ── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// ── Error handler (must be last) ──────────────────────────────────────────────
app.use(errorHandler);
