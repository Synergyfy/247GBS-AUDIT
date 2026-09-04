"use client";

import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import { refreshAccessToken } from "@/lib/auth";
import type { Specialist, SpecialistStats } from "./types";

export function useSpecialists() {
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [stats, setStats] = useState<SpecialistStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("247gbs_token") : null;
      const headers: Record<string, string> = { Accept: "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      // Fetch Specialists
      let res = await fetch(`${API_BASE_URL}/specialists`, { method: "GET", headers, signal });
      if (res.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          headers["Authorization"] = `Bearer ${newToken}`;
          res = await fetch(`${API_BASE_URL}/specialists`, { method: "GET", headers, signal });
        }
      }

      if (!res.ok) throw new Error(`Specialists fetch failed: ${res.status}`);
      const specialistsData = await res.json();
      setSpecialists(specialistsData);

      // Fetch Stats
      const statsRes = await fetch(`${API_BASE_URL}/specialists/stats`, { method: "GET", headers, signal });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

    } catch (err: any) {
      if (err?.name === "AbortError") return;
      setError(err?.message ?? "Failed to load specialist network");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    fetchData(ac.signal);
    return () => ac.abort();
  }, [fetchData]);

  return { specialists, stats, loading, error, refresh: fetchData } as const;
}

export default useSpecialists;
