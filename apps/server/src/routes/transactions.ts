import { Router } from 'express';
import { db } from '../lib/store';

export const transactionsRouter = Router();

export type TransactionType = 'CONTRACT_INITIATED' | 'CONTRACT_LOCKED' | 'MILESTONE_RELEASED';

export interface TransactionRecord {
  id: string;
  type: TransactionType;
  contractId: string;
  txHash?: string;
  timestamp: Date;
  metadata: {
    productName?: string;
    amount?: number;
    description?: string;
  };
}

// GET /api/transactions — global ledger of on-chain operations
transactionsRouter.get('/', (_req, res) => {
  const transactions: TransactionRecord[] = [];

  // 1. Gather Contract Actions
  for (const contract of db.contracts.values()) {
    // Initiation
    transactions.push({
      id: `ctx-init-${contract.contractId}`,
      type: 'CONTRACT_INITIATED',
      contractId: contract.contractId,
      timestamp: contract.createdAt,
      metadata: {
        productName: contract.productName,
      },
    });

    // Locked
    if (contract.proofTxHash && contract.lockedAt) {
      transactions.push({
        id: `ctx-lock-${contract.contractId}`,
        type: 'CONTRACT_LOCKED',
        contractId: contract.contractId,
        txHash: contract.proofTxHash,
        timestamp: contract.lockedAt,
        metadata: {
          productName: contract.productName,
        },
      });
    }
  }

  // 2. Gather Milestone Releases
  for (const escrow of db.escrows.values()) {
    for (const m of escrow.milestones) {
      if (m.releasedAt && m.txHash) {
        transactions.push({
          id: `escrow-${escrow.contractId}-m${m.index}`,
          type: 'MILESTONE_RELEASED',
          contractId: escrow.contractId,
          txHash: m.txHash,
          timestamp: m.releasedAt,
          metadata: {
            amount: m.amount,
            description: m.description,
          },
        });
      }
    }
  }

  // Sort strictly descending by timestamp
  transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  res.json({ data: transactions, total: transactions.length });
});
