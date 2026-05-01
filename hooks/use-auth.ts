"use client";

import { useCallback, useEffect, useState } from "react";

import { parseApiResponse } from "@/lib/utils";
import type { SafeUser } from "@/types";

export function useAuth() {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await parseApiResponse<{ user: SafeUser }>(
        await fetch("/api/auth/me", { credentials: "include" })
      );
      setUser(data.user);
    } catch (err) {
      setUser(null);
      setError(err instanceof Error ? err.message : "Failed to load user.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void refreshUser();
    });
  }, [refreshUser]);

  const logout = useCallback(async () => {
    await parseApiResponse<{ loggedOut: boolean }>(
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" })
    );
    setUser(null);
  }, []);

  return {
    user,
    isLoading,
    error,
    refreshUser,
    logout,
    isAdmin: user?.role === "admin",
  };
}
