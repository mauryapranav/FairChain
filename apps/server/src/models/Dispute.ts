import { v4 as uuidv4 } from 'uuid';
import { db, type StoredDispute } from '../lib/store';

const DisputeModel = {
  async findOne(filter: Partial<StoredDispute> & Record<string, unknown>): Promise<StoredDispute | null> {
    for (const d of db.disputes.values()) {
      const match = Object.entries(filter).every(([k, v]) => {
        const val = (d as Record<string, unknown>)[k];
        if (v && typeof v === 'object' && '$in' in (v as object)) {
          return ((v as { $in: unknown[] }).$in).includes(val);
        }
        return val === v;
      });
      if (match) return d;
    }
    return null;
  },
  async create(data: Omit<StoredDispute, '_id' | 'createdAt' | 'updatedAt'>): Promise<StoredDispute> {
    const id = uuidv4();
    const d: StoredDispute = { ...data, _id: id, createdAt: new Date(), updatedAt: new Date() };
    db.disputes.set(id, d);
    return d;
  },
  async save(dispute: StoredDispute): Promise<void> {
    dispute.updatedAt = new Date();
    db.disputes.set(dispute._id, dispute);
  },
};

export default DisputeModel;
