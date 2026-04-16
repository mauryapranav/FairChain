import { v4 as uuidv4 } from 'uuid';
import { db, type StoredEscrow } from '../lib/store';

const EscrowModel = {
  async findOne(filter: Partial<StoredEscrow>): Promise<StoredEscrow | null> {
    for (const e of db.escrows.values()) {
      if (Object.entries(filter).every(([k, v]) => (e as Record<string, unknown>)[k] === v)) return e;
    }
    return null;
  },
  async create(data: Omit<StoredEscrow, '_id' | 'createdAt' | 'updatedAt'>): Promise<StoredEscrow> {
    const id = uuidv4();
    const e: StoredEscrow = { ...data, _id: id, createdAt: new Date(), updatedAt: new Date() };
    db.escrows.set(id, e);
    return e;
  },
  async save(escrow: StoredEscrow): Promise<void> {
    escrow.updatedAt = new Date();
    db.escrows.set(escrow._id, escrow);
  },
};

export default EscrowModel;
