import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { AuthAPI, apiError, type User } from "@/lib/api";

type AuthCtx = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email?: string;
    password?: string;
    role?: string;
    walletAddress?: string;
  }) => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem("fc_token");
    if (!token || token === "null") {
      setLoading(false);
      return;
    }
    AuthAPI.me()
      .then((r) => setUser(r.data.user))
      .catch(() => {
        if (import.meta.env.DEV && token === "fake-dev-token") {
          setUser({ id: "demo-user", name: "Demo User", email: "demo@fairchain.com", role: "admin", walletAddress: "0x123..." });
          return;
        }
        localStorage.removeItem("fc_token");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { data } = await AuthAPI.login(email, password);
      localStorage.setItem("fc_token", data.token);
      setUser(data.user);
    } catch (e) {
      if (import.meta.env.DEV) {
        localStorage.setItem("fc_token", "fake-dev-token");
        setUser({ id: "demo-user", name: "Demo User", email, role: "admin", walletAddress: "0x123..." });
        return;
      }
      throw new Error(apiError(e));
    }
  }, []);

  const register = useCallback(
    async (regData: {
      name: string;
      email?: string;
      password?: string;
      role?: string;
      walletAddress?: string;
    }) => {
      try {
        const { data } = await AuthAPI.register(regData);
        localStorage.setItem("fc_token", data.token);
        setUser(data.user);
      } catch (e) {
        if (import.meta.env.DEV) {
          localStorage.setItem("fc_token", "fake-dev-token");
          setUser({ id: "demo-user", name: regData.name, email: regData.email, role: regData.role, walletAddress: regData.walletAddress });
          return;
        }
        throw new Error(apiError(e));
      }
    },
    []
  );

  const logout = useCallback(() => {
    AuthAPI.logout().catch(() => {});
    localStorage.removeItem("fc_token");
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
