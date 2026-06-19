"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authApi } from "@/lib/api";
import {
  clearUserToken,
  getUserToken,
  setUserToken,
} from "@/lib/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = getUserToken();
    if (!token) {
      setUser(null);
      return null;
    }

    try {
      const res = await authApi.getMe();
      setUser(res.data);
      return res.data;
    } catch {
      clearUserToken();
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  const signin = async (credentials) => {
    const res = await authApi.signin(credentials);
    setUserToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const signup = async (data) => {
    const res = await authApi.signup(data);
    setUserToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const signout = () => {
    clearUserToken();
    setUser(null);
  };

  const updateUser = (updated) => {
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        signin,
        signup,
        signout,
        refreshUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
