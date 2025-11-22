// src/context/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  phantomWallet?: string;
  balance?: number;
  role?: string;
} | null;

type AuthContextType = {
  user: User;
  loading: boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const logout = () => {
    fetch("/api/auth/logout", { method: "POST" }).finally(() => {
      setUser(null);
      router.replace("/");
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
