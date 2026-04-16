// ─── Shared types across FairChain monorepo ──────────────────────────────────

export type KycStatus = 'none' | 'pending' | 'verified' | 'failed';

export type Role = 'Artisan' | 'Middleman' | 'Seller';

export interface User {
  _id: string;
  walletAddress: string;
  name: string;
  email?: string;
  role: Role;
  kycStatus: KycStatus;
  createdAt: string;
  updatedAt: string;
}

export type ContractStatus = 'pending' | 'locked' | 'active' | 'completed' | 'disputed';
export type EscrowStatus = 'unfunded' | 'funded' | 'milestone_released' | 'fully_released' | 'refunded' | 'disputed';

export interface Participant {
  userId: string;
  walletAddress: string;
  role: string;
  paymentSplit: number;
}

export interface Milestone {
  index: number;
  description: string;
  amount: number;
  releasedAt?: string | null;
}

export interface Contract {
  _id: string;
  contractId: string;
  productName: string;
  description: string;
  category: string;
  participants: Participant[];
  terms: string;
  milestonesEnabled: boolean;
  milestones: Milestone[];
  totalAmount?: number;
  imageCid?: string;
  status: ContractStatus;
  createdBy: string;
  ipfsCid?: string;
  proofTxHash?: string;
  txHash?: string;
  lockedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Escrow {
  _id: string;
  contractId: string;
  totalAmount: number;
  currency: string;
  status: EscrowStatus;
  milestones: Milestone[];
  txHash?: string;
  createdAt: string;
  updatedAt: string;
}
