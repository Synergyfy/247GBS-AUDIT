"use client";

import { useCallback, useEffect, useState } from "react";
import type { DashboardResponse } from "./types";
import { API_BASE_URL } from "@/lib/api";
import { refreshAccessToken } from "@/lib/auth";

export function useDashboard() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("247gbs_token") : null;
      const headers: Record<string, string> = {
        Accept: "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      let res = await fetch(`${API_BASE_URL}/dashboard`, { method: "GET", headers, signal });

      // If unauthorized, attempt refresh once and retry
      if (res.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          headers["Authorization"] = `Bearer ${newToken}`;
          res = await fetch(`${API_BASE_URL}/dashboard`, { method: "GET", headers, signal });
        }
      }

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(`Unexpected response: ${text.substring(0, 200)}`);
      }

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `Request failed ${res.status}`);
      }

      const json = (await res.json()) as DashboardResponse;
      setData(json);
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      setError(err?.message ?? "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    fetchData(ac.signal);
    // Re-fetch when the window gains focus (useful after sign-in redirects)
    const onFocus = () => fetchData();
    const onStorage = (e: StorageEvent) => {
      if (e.key === '247gbs_token') fetchData();
    };

    window.addEventListener('focus', onFocus);
    window.addEventListener('storage', onStorage);

    return () => {
      ac.abort();
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('storage', onStorage);
    };
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData } as const;
}

export default useDashboard;
