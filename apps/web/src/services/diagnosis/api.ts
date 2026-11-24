"use client";

import { API_BASE_URL } from "@/lib/api";
import { refreshAccessToken, handleSessionExpired } from "@/lib/auth";
import type { DiagnosisConfig, DiagnosisResult, McomService } from "./types";

function getToken(): string | null {
  return typeof window !== "undefined" ? localStorage.getItem("247gbs_token") : null;
}

async function authFetch(path: string, init: RequestInit = {}, retried = false) {
  const token = getToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  if (res.status === 401 && !retried) {
    const newToken = await refreshAccessToken();
    if (newToken === false) {
      handleSessionExpired();
      throw new Error("Session expired. Please sign in again.");
    }
    if (newToken) {
      headers.Authorization = `Bearer ${newToken}`;
      res = await fetch(`${API_BASE_URL}${path}`, {
        ...init,
        headers,
        credentials: "include",
      });
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err: any = new Error(body?.message || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }

  if (res.status === 204) return null;
  return res.json();
}

export async function fetchMcomServices(): Promise<McomService[]> {
  const res = await fetch(`${API_BASE_URL}/diagnosis/services`, { cache: "no-store" });
  if (!res.ok) return [];
  return (await res.json()) as McomService[];
}

export async function fetchDefaultDiagnosisConfig(): Promise<DiagnosisConfig> {
  const res = await fetch(`${API_BASE_URL}/diagnosis/default-config`, { cache: "no-store" });
  if (!res.ok) throw new Error("Could not load the default diagnosis model");
  return (await res.json()) as DiagnosisConfig;
}

export function diagnoseAudit(
  sessionId: string,
  formId?: string | null,
): Promise<DiagnosisResult> {
  return authFetch(`/audit/${sessionId}/diagnose`, {
    method: "POST",
    body: JSON.stringify({ formId: formId ?? null }),
  }) as Promise<DiagnosisResult>;
}

export function getAuditDiagnosis(sessionId: string): Promise<DiagnosisResult> {
  return authFetch(`/audit/${sessionId}/diagnosis`, { method: "GET" }) as Promise<DiagnosisResult>;
}
