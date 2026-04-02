"use client";

import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import { refreshAccessToken } from "@/lib/auth";
import type { UserProfile } from "./types";

export function useProfile() {
  const [data, setData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("247gbs_token") : null;
      const headers: Record<string, string> = { Accept: "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      let res = await fetch(`${API_BASE_URL}/users/profile`, { method: "GET", headers, signal, credentials: 'include' });

      if (res.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          headers["Authorization"] = `Bearer ${newToken}`;
          res = await fetch(`${API_BASE_URL}/users/profile`, { method: "GET", headers, signal, credentials: 'include' });
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

      const json = (await res.json()) as UserProfile;
      setData(json);
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      setError(err?.message ?? "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    fetchProfile(ac.signal);

    const onFocus = () => fetchProfile();
    const onStorage = (e: StorageEvent) => {
      if (e.key === '247gbs_token') fetchProfile();
    };

    window.addEventListener('focus', onFocus);
    window.addEventListener('storage', onStorage);

    return () => {
      ac.abort();
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('storage', onStorage);
    };
  }, [fetchProfile]);

  const updateProfile = useCallback(async (updateData: Partial<UserProfile>) => {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("247gbs_token") : null;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/users/profile`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(updateData),
        credentials: 'include'
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `Update failed ${res.status}`);
      }

      const json = (await res.json()) as UserProfile;
      setData(json);
      return json;
    } catch (err: any) {
      setError(err?.message ?? "Failed to update profile");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, refresh: fetchProfile, updateProfile } as const;
}

export default useProfile;
