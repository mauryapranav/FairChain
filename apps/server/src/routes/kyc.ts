import { Router, type IRouter } from 'express';
import { initiateKyc, kycCallback, getKycStatus } from '../controllers/kycController';
import { verifyToken } from '../middleware/auth';

export const kycRouter: IRouter = Router();

kycRouter.get('/status',    verifyToken, getKycStatus as never);
kycRouter.post('/initiate', verifyToken, initiateKyc as never);
kycRouter.post('/callback', verifyToken, kycCallback as never);
