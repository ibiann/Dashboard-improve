"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type AuthUser = {
  name: string;
  role: AppRole;
};

export type AppRole = "CEO" | "CTO" | "PM" | "Engineer";

type LoginInput = {
  username: string;
  password: string;
  role: AppRole;
};

type AuthContextValue = {
  ready: boolean;
  isAuthenticated: boolean;
  user: AuthUser | null;
  role: AppRole | null;
  login: (input: LoginInput) => Promise<void>;
  logout: () => void;
};

const AUTH_TOKEN_KEY = "auth_token";
const AUTH_NAME_KEY = "auth_name";
const AUTH_ROLE_KEY = "auth_role";

const AuthContext = createContext<AuthContextValue>({
  ready: false,
  isAuthenticated: false,
  user: null,
  role: null,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  login: async (_input: LoginInput) => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);

  useEffect(() => {
    // Client-only auth check (demo): localStorage-based.
    const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
    const name = window.localStorage.getItem(AUTH_NAME_KEY);
    const storedRole = window.localStorage.getItem(AUTH_ROLE_KEY) as AppRole | null;
    if (token) {
      setIsAuthenticated(true);
      const safeRole: AppRole = storedRole ?? "CTO";
      setRole(safeRole);
      setUser({ name: name || "User", role: safeRole });
    }
    setReady(true);
  }, []);

  const login = useCallback(async ({ username, password, role }: LoginInput) => {
    if (!username.trim()) throw new Error("Vui lòng nhập tên đăng nhập.");
    if (!password) throw new Error("Vui lòng nhập mật khẩu.");

    // Demo-only: no backend call. Replace with real API integration later.
    window.localStorage.setItem(AUTH_TOKEN_KEY, "demo");
    window.localStorage.setItem(AUTH_NAME_KEY, username.trim());
    window.localStorage.setItem(AUTH_ROLE_KEY, role);

    setIsAuthenticated(true);
    setRole(role);
    setUser({ name: username.trim(), role });
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    window.localStorage.removeItem(AUTH_NAME_KEY);
    window.localStorage.removeItem(AUTH_ROLE_KEY);
    setIsAuthenticated(false);
    setUser(null);
    setRole(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      isAuthenticated,
      user,
      role,
      login,
      logout,
    }),
    [ready, isAuthenticated, user, role, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

