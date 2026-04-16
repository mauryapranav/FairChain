import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  listContracts,
  getContract,
  createContract,
  lockContract,
  acceptContract,
  rejectContract,
} from '../controllers/contractsController';

export const contractsRouter = Router();

contractsRouter.get('/',     requireAuth, listContracts);
contractsRouter.post('/',    requireAuth, createContract);
contractsRouter.get('/:id',  getContract);           // public — used by QR verify
contractsRouter.patch('/:id/lock', requireAuth, lockContract);
contractsRouter.patch('/:id/accept', requireAuth, acceptContract);
contractsRouter.patch('/:id/reject', requireAuth, rejectContract);
