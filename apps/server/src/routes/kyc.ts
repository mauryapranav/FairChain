import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { getKycStatus, initiateKyc, kycCallback } from '../controllers/kycController';

export const kycRouter = Router();

kycRouter.get('/status',    requireAuth, getKycStatus);
kycRouter.post('/initiate', requireAuth, initiateKyc);
kycRouter.post('/callback', kycCallback);   // webhook from KYC provider (no auth)
