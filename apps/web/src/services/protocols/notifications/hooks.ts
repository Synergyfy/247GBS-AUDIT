"use client";

import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import { refreshAccessToken } from "@/lib/auth";
import type { NotificationSetting } from "../types";

export function useNotifications() {
  const [data, setData] = useState<NotificationSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("247gbs_token") : null;
      const headers: Record<string, string> = { Accept: "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      let res = await fetch(`${API_BASE_URL}/protocols/notifications`, { method: "GET", headers, signal });

      if (res.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          headers["Authorization"] = `Bearer ${newToken}`;
          res = await fetch(`${API_BASE_URL}/protocols/notifications`, { method: "GET", headers, signal });
        }
      }

      if (!res.ok) throw new Error(`Notifications fetch failed: ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      setError(err?.message ?? "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleNotification = async (title: string, active: boolean) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("247gbs_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/protocols/notifications`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ title, active }),
      });

      if (!res.ok) throw new Error("Failed to update notification");
      const updated = await res.json();
      setData(updated);
      return true;
    } catch (err: any) {
      console.error(err);
      return false;
    }
  };

  useEffect(() => {
    const ac = new AbortController();
    fetchNotifications(ac.signal);
    return () => ac.abort();
  }, [fetchNotifications]);

  return { data, loading, error, refresh: fetchNotifications, toggleNotification } as const;
}

export default useNotifications;
