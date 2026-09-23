"use client";

import { API_BASE_URL } from "@/lib/api";
import { refreshAccessToken, handleSessionExpired } from "@/lib/auth";

export interface PlatformSettings {
  id: string;
  platformName: string;
  supportEmail: string | null;
  landingTitle: string | null;
  landingSubtitle: string | null;
  landingCtaLabel: string | null;
  landingCtaHref: string | null;
  landingShowPreAudit: boolean;
  updatedAt?: string;
}

export interface HelpResource {
  id: string;
  title: string;
  description: string | null;
  category: string;
  href: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type HelpResourceDraft = {
  title: string;
  description?: string;
  category?: string;
  href?: string;
  sortOrder?: number;
};

function getToken(): string | null {
  return typeof window !== "undefined" ? localStorage.getItem("247gbs_token") : null;
}

/** Admin-authenticated fetch with a single 401 refresh retry. */
async function authFetch<T>(path: string, init: RequestInit = {}, retried = false): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });

  if (res.status === 401 && !retried) {
    const newToken = await refreshAccessToken();
    if (newToken === false) {
      handleSessionExpired();
      throw new Error("Session expired. Please sign in again.");
    }
    if (newToken) {
      headers["Authorization"] = `Bearer ${newToken}`;
      res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Request failed (${res.status})`);
  }
  if (res.status === 204) return null as T;
  return res.json() as Promise<T>;
}

// --- Settings ---

export function fetchAdminSettings(): Promise<PlatformSettings> {
  return authFetch<PlatformSettings>("/admin/settings");
}

export function saveAdminSettings(patch: Partial<PlatformSettings>): Promise<PlatformSettings> {
  return authFetch<PlatformSettings>("/admin/settings", {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

// --- Help resources ---

export function fetchAdminHelpResources(): Promise<HelpResource[]> {
  return authFetch<HelpResource[]>("/admin/help-resources");
}

export function createHelpResource(draft: HelpResourceDraft): Promise<HelpResource> {
  return authFetch<HelpResource>("/admin/help-resources", {
    method: "POST",
    body: JSON.stringify(draft),
  });
}

export function updateHelpResource(id: string, patch: Partial<HelpResource>): Promise<HelpResource> {
  return authFetch<HelpResource>(`/admin/help-resources/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export function deleteHelpResource(id: string): Promise<null> {
  return authFetch<null>(`/admin/help-resources/${id}`, { method: "DELETE" });
}