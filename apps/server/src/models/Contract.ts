import { v4 as uuidv4 } from 'uuid';
import { db, type StoredContract } from '../lib/store';

const ContractModel = {
  async find(filter: Record<string, unknown>): Promise<StoredContract[]> {
    return [...db.contracts.values()].filter(c =>
      Object.entries(filter).every(([k, v]) => (c as Record<string, unknown>)[k] === v),
    );
  },
  async findOne(filter: Partial<StoredContract>): Promise<StoredContract | null> {
    for (const c of db.contracts.values()) {
      if (Object.entries(filter).every(([k, v]) => (c as Record<string, unknown>)[k] === v)) return c;
    }
    return null;
  },
  async findById(id: string): Promise<StoredContract | null> {
    return db.contracts.get(id) ?? null;
  },
  async countDocuments(filter: Record<string, unknown>): Promise<number> {
    return (await ContractModel.find(filter)).length;
  },
  async create(data: Omit<StoredContract, '_id' | 'createdAt' | 'updatedAt'>): Promise<StoredContract> {
    const id = uuidv4();
    const c: StoredContract = { ...data, _id: id, createdAt: new Date(), updatedAt: new Date() };
    db.contracts.set(id, c);
    return c;
  },
  async updateOne(filter: Partial<StoredContract>, update: Partial<StoredContract>): Promise<void> {
    const c = await ContractModel.findOne(filter);
    if (c) { Object.assign(c, update, { updatedAt: new Date() }); db.contracts.set(c._id, c); }
  },
};

export default ContractModel;
