"use client";

import { API_BASE_URL } from "@/lib/api";
import type { HelpResource, PlatformSettings } from "@/services/admin/settings";

export interface PublicSettings {
  platformName: string;
  supportEmail: string | null;
  landingTitle: string | null;
  landingSubtitle: string | null;
  landingCtaLabel: string | null;
  landingCtaHref: string | null;
  landingShowPreAudit: boolean;
}

const DEFAULT_SETTINGS: PublicSettings = {
  platformName: "247GBS Audit",
  supportEmail: null,
  landingTitle: null,
  landingSubtitle: null,
  landingCtaLabel: "Start your business audit",
  landingCtaHref: "/audit/pre-audit/flow",
  landingShowPreAudit: true,
};

/** Admin-configured landing/support content; falls back to defaults. */
export async function fetchPublicSettings(): Promise<PublicSettings> {
  try {
    const res = await fetch(`${API_BASE_URL}/public/settings`, { headers: { Accept: "application/json" } });
    if (!res.ok) return DEFAULT_SETTINGS;
    return (await res.json()) as PublicSettings;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/** Active help resources from the API; falls back to an empty list. */
export async function fetchHelpResources(category?: string): Promise<HelpResource[]> {
  try {
    const query = category ? `?category=${encodeURIComponent(category)}` : "";
    const res = await fetch(`${API_BASE_URL}/public/help-resources${query}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    return (await res.json()) as HelpResource[];
  } catch {
    return [];
  }
}

export type { PlatformSettings, HelpResource };