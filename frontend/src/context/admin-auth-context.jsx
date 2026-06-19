"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import {
  clearAdminToken,
  getAdminToken,
  setAdminToken,
} from "@/lib/auth";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshAdmin = useCallback(async () => {
    const token = getAdminToken();
    if (!token) {
      setAdmin(null);
      return null;
    }

    try {
      const res = await adminApi.getMe();
      setAdmin(res.data);
      return res.data;
    } catch {
      clearAdminToken();
      setAdmin(null);
      return null;
    }
  }, []);

  useEffect(() => {
    refreshAdmin().finally(() => setLoading(false));
  }, [refreshAdmin]);

  const login = async (credentials) => {
    const res = await adminApi.login(credentials);
    setAdminToken(res.data.token);
    setAdmin(res.data.admin);
    return res.data.admin;
  };

  const signout = () => {
    clearAdminToken();
    setAdmin(null);
  };

  const updateAdmin = (updated, token) => {
    if (token) setAdminToken(token);
    setAdmin(updated);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        loading,
        isAuthenticated: !!admin,
        login,
        signout,
        refreshAdmin,
        updateAdmin,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return ctx;
}
