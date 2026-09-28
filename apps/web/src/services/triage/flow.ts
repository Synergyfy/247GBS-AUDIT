"use client";

import { API_BASE_URL } from "@/lib/api";
import type { PublicTriageForm, TriagePublicQuestion } from "./types";

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.message || `Request failed (${res.status})`);
  }

  return res.json() as Promise<T>;
}

export async function fetchTriageStart(): Promise<TriagePublicQuestion> {
  return request<TriagePublicQuestion>("/triage/questions/start");
}

export async function fetchTriageQuestion(id: string): Promise<TriagePublicQuestion> {
  return request<TriagePublicQuestion>(`/triage/questions/${encodeURIComponent(id)}`);
}

export async function fetchTriageForm(slug: string): Promise<PublicTriageForm> {
  return request<PublicTriageForm>(`/triage/form/${encodeURIComponent(slug)}`);
}