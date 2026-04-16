import { v4 as uuidv4 } from 'uuid';
import { db, type StoredUser } from '../lib/store';

const UserModel = {
  async findById(id: string): Promise<StoredUser | null> {
    for (const u of db.users.values()) {
      if (u._id === id) return u;
    }
    return null;
  },
  async find(filter: Partial<StoredUser>): Promise<StoredUser[]> {
    return [...db.users.values()].filter(u =>
      Object.entries(filter).every(([k, v]) => (u as Record<string, unknown>)[k] === v),
    );
  },
  async findOne(filter: Partial<StoredUser>): Promise<StoredUser | null> {
    for (const u of db.users.values()) {
      if (Object.entries(filter).every(([k, v]) => (u as Record<string, unknown>)[k] === v)) return u;
    }
    return null;
  },
  async findByIdAndUpdate(id: string, update: Partial<StoredUser>): Promise<StoredUser | null> {
    const u = await UserModel.findById(id);
    if (!u) return null;
    Object.assign(u, update, { updatedAt: new Date() });
    db.users.set(id, u);
    return u;
  },
  async create(data: Omit<StoredUser, '_id' | 'createdAt' | 'updatedAt'>): Promise<StoredUser> {
    const id = uuidv4();
    const u: StoredUser = { ...data, _id: id, createdAt: new Date(), updatedAt: new Date() };
    db.users.set(id, u);
    return u;
  },
};

export default UserModel;
