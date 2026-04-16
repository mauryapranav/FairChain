import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';

import { connectDB } from './lib/db';
import { authRouter }       from './routes/auth';
import { contractsRouter }  from './routes/contracts';
import { escrowRouter }     from './routes/escrow';
import { participantsRouter }from './routes/participants';
import { statsRouter }      from './routes/stats';
import { usersRouter }      from './routes/users';
import { paymentsRouter }   from './routes/payments';
import { ipfsRouter }       from './routes/ipfs';
import { kycRouter }        from './routes/kyc';
import { reputationRouter } from './routes/reputation';
import { disputesRouter }   from './routes/disputes';
import { chatRouter }       from './routes/chat';
import { errorHandler }     from './middleware/errorHandler';

export const app: Express = express();

// ── Connect DB ────────────────────────────────────────────────────────────────
connectDB().catch((err: Error) => {
  const isProd = process.env['NODE_ENV'] === 'production';
  const shouldExit = isProd && !process.env['BYPASS_DB_CHECK'];
  
  if (shouldExit) {
    console.error('Fatal: could not connect to MongoDB in production', err);
    process.exit(1);
  }
  console.warn('⚠️  Running without MongoDB — API endpoints requiring DB will return 503');
  console.info('Tip: Use "pnpm run seed" to test with mock data if a DB is available.');
});



// ── Security & parsing ────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin:      process.env['CORS_ORIGIN'] ?? 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser());

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'fairchain-api', timestamp: new Date().toISOString() });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',        authRouter);
app.use('/api/users',       usersRouter);
app.use('/api/contracts',   contractsRouter);
app.use('/api/participants', participantsRouter);
app.use('/api/escrow',      escrowRouter);
app.use('/api/payments',    paymentsRouter);
app.use('/api/ipfs',        ipfsRouter);
app.use('/api/kyc',         kycRouter);
app.use('/api/reputation',  reputationRouter);
app.use('/api/disputes',    disputesRouter);
app.use('/api/chat',        chatRouter);
app.use('/api/stats',       statsRouter);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// ── Error handler (must be last) ──────────────────────────────────────────────
app.use(errorHandler);
