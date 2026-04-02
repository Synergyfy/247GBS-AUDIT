"use client";

import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import { refreshAccessToken } from "@/lib/auth";
import type { SecurityStatus } from "../types";

export function useSecurity() {
  const [data, setData] = useState<SecurityStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSecurity = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("247gbs_token") : null;
      const headers: Record<string, string> = { Accept: "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      let res = await fetch(`${API_BASE_URL}/protocols/security`, { method: "GET", headers, signal });

      if (res.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          headers["Authorization"] = `Bearer ${newToken}`;
          res = await fetch(`${API_BASE_URL}/protocols/security`, { method: "GET", headers, signal });
        }
      }

      if (!res.ok) throw new Error(`Security fetch failed: ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      setError(err?.message ?? "Failed to load security status");
    } finally {
      setLoading(false);
    }
  }, []);

  const rotateKey = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("247gbs_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/protocols/security/rotate-key`, {
        method: "POST",
        headers,
      });

      if (!res.ok) throw new Error("Failed to rotate master key");
      await fetchSecurity();
      return true;
    } catch (err: any) {
      console.error(err);
      return false;
    }
  };

  useEffect(() => {
    const ac = new AbortController();
    fetchSecurity(ac.signal);
    return () => ac.abort();
  }, [fetchSecurity]);

  return { data, loading, error, refresh: fetchSecurity, rotateKey } as const;
}

export default useSecurity;
