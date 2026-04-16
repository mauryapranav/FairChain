import axios, { AxiosError } from "axios";

// In dev, Vite proxy forwards /api → http://localhost:4000
// In production, set VITE_API_URL to the deployed backend URL
const baseURL = import.meta.env.VITE_API_URL || "";

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
  withCredentials: true,
});

// Attach Bearer token from localStorage on every request
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("fc_token");
  if (token && token !== "null") {
    cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});

// Global error extractor
export function apiError(e: unknown): string {
  const err = e as AxiosError<{ message?: string; error?: string }>;
  return (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    "Something went wrong"
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type User = {
  id: string;
  name?: string;
  email?: string;
  walletAddress?: string;
  role?: string;
  kycStatus?: string;
  reputationScore?: number;
  bio?: string;
  location?: string;
  speciality?: string;
  avatarUrl?: string;
};

export type Participant = {
  userId: string;
  walletAddress: string;
  role: string;
  paymentSplit: number;
};

export type Milestone = {
  index: number;
  description: string;
  amount: number;
  releasedAt?: string;
};

export type Contract = {
  _id?: string;
  contractId: string;
  productName: string;
  description: string;
  category: string;
  terms: string;
  participants: Participant[];
  status: string;
  createdBy: string;
  totalAmount?: number;
  milestonesEnabled?: boolean;
  milestones?: Milestone[];
  imageCid?: string;
  ipfsCid?: string;
  proofTxHash?: string;
  txHash?: string;
  lockedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Escrow = {
  _id?: string;
  contractId: string;
  status: string;
  milestones: Milestone[];
  totalAmount?: number;
};

export type Dispute = {
  _id?: string;
  contractId: string;
  status: string;
  reason?: string;
  filedBy?: string;
  resolution?: string;
  createdAt?: string;
};

export type ChatMessage = {
  _id?: string;
  contractId: string;
  sender: string;
  message: string;
  createdAt: string;
};

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const AuthAPI = {
  login: (email: string, password: string) =>
    api.post<{ token: string; user: User }>("/api/auth/login", {
      email,
      password,
    }),

  register: (data: {
    walletAddress?: string;
    name: string;
    role?: string;
    email?: string;
    password?: string;
  }) => api.post<{ token: string; user: User }>("/api/auth/register", data),

  me: () => api.get<{ user: User }>("/api/auth/me"),

  logout: () => api.post("/api/auth/logout"),
};

// ─── Contracts API ────────────────────────────────────────────────────────────

export const ContractsAPI = {
  list: (params?: {
    status?: string;
    createdBy?: string;
    limit?: number;
    skip?: number;
  }) => api.get<{ data: Contract[]; total: number }>("/api/contracts", { params }),

  get: (id: string) =>
    api.get<{ data: Contract; escrow: Escrow | null; dispute: Dispute | null }>(
      `/api/contracts/${id}`
    ),

  create: (body: {
    productName: string;
    description: string;
    category: string;
    terms: string;
    participants: Participant[];
    totalAmount?: number;
    milestonesEnabled?: boolean;
    milestones?: { index: number; description: string; amount: number }[];
    imageCid?: string;
  }) => api.post<{ data: Contract }>("/api/contracts", body),

  lock: (id: string) =>
    api.patch<{
      data: Contract;
      ipfsCid: string;
      ipfsUrl: string;
      proofTxHash: string;
    }>(`/api/contracts/${id}/lock`),
};

// ─── Escrow API ───────────────────────────────────────────────────────────────

export const EscrowAPI = {
  get: (contractId: string) =>
    api.get<{ data: Escrow | null }>(`/api/escrow/${contractId}`),

  releaseMilestone: (
    contractId: string,
    milestoneIndex: number,
    signature?: string
  ) =>
    api.post<{ success: boolean; txHash: string; escrow: Escrow }>(
      `/api/escrow/${contractId}/release/${milestoneIndex}`,
      { signature }
    ),

  releaseAll: (contractId: string) =>
    api.post<{ success: boolean; txHash: string; escrow: Escrow }>(
      `/api/escrow/${contractId}/release-all`
    ),

  refund: (contractId: string) =>
    api.post<{ success: boolean; txHash: string; escrow: Escrow }>(
      `/api/escrow/${contractId}/refund`
    ),
};

// ─── Users API ────────────────────────────────────────────────────────────────

export const UsersAPI = {
  list: (params?: { role?: string; sortBy?: string; limit?: number }) =>
    api.get<{ data: User[] }>("/api/users", { params }),

  get: (id: string) => api.get<{ data: User }>(`/api/users/${id}`),

  update: (id: string, data: Partial<User>) =>
    api.patch<{ data: User }>(`/api/users/${id}`, data),
};

// ─── KYC API ──────────────────────────────────────────────────────────────────

export const KycAPI = {
  getStatus: () =>
    api.get<{ kycStatus: string; name: string; role: string }>(
      "/api/kyc/status"
    ),

  initiate: () =>
    api.post<{ status: string; message: string; redirectUrl: string | null }>(
      "/api/kyc/initiate"
    ),
};

// ─── Stats API ────────────────────────────────────────────────────────────────

export const StatsAPI = {
  dashboard: () => api.get<{ data: Record<string, unknown> }>("/api/stats"),
};

// ─── Disputes API ─────────────────────────────────────────────────────────────

export const DisputesAPI = {
  list: () => api.get<{ data: Dispute[] }>("/api/disputes"),

  create: (body: { contractId: string; reason: string }) =>
    api.post<{ data: Dispute }>("/api/disputes", body),

  get: (id: string) => api.get<{ data: Dispute }>(`/api/disputes/${id}`),
};

// ─── Chat API ─────────────────────────────────────────────────────────────────

export const ChatAPI = {
  getMessages: (contractId: string) =>
    api.get<{ data: ChatMessage[] }>(`/api/chat/${contractId}`),

  send: (contractId: string, message: string) =>
    api.post<{ data: ChatMessage }>(`/api/chat/${contractId}`, { message }),
};

// ─── IPFS API ─────────────────────────────────────────────────────────────────

export const IpfsAPI = {
  uploadImage: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post<{ cid: string }>("/api/ipfs/upload-image", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
