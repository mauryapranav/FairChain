/**
 * In-memory store used by all models.
 * Replace with Supabase queries in the DB integration phase.
 */

export interface StoredUser {
  _id: string;
  walletAddress: string;
  name: string;
  email?: string;
  role: 'Artisan' | 'Middleman' | 'Seller';
  kycStatus: 'none' | 'pending' | 'verified' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export interface StoredContract {
  _id: string;
  contractId: string;
  productName: string;
  description: string;
  category: string;
  participants: Array<{ userId: string; walletAddress: string; role: string; paymentSplit: number }>;
  terms: string;
  milestonesEnabled: boolean;
  milestones: Array<{ index: number; description: string; amount: number; releasedAt?: Date }>;
  totalAmount?: number;
  imageCid?: string;
  status: string;
  createdBy: string;
  ipfsCid?: string;
  proofTxHash?: string;
  txHash?: string;
  lockedAt?: Date;
  acceptedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoredEscrow {
  _id: string;
  contractId: string;
  totalAmount: number;
  currency: string;
  status: string;
  milestones: Array<{ index: number; description: string; amount: number; releasedAt?: Date; txHash?: string }>;
  txHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoredDispute {
  _id: string;
  contractId: string;
  raisedBy: string;
  reason: string;
  status: 'open' | 'under_review' | 'resolved' | 'closed';
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const db = {
  users:     new Map<string, StoredUser>(),
  contracts: new Map<string, StoredContract>(),
  escrows:   new Map<string, StoredEscrow>(),
  disputes:  new Map<string, StoredDispute>(),
  nonces:    new Map<string, string>(),   // walletAddress → nonce message
};
