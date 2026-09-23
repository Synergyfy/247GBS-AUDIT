"use client";

import { API_BASE_URL } from "@/lib/api";
import type { TriagePublicQuestion } from "./types";

async function request(path: string): Promise<TriagePublicQuestion> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.message || `Failed to load triage question (${res.status})`);
  }

  return (await res.json()) as TriagePublicQuestion;
}

export async function fetchTriageStart(): Promise<TriagePublicQuestion> {
  return request("/triage/questions/start");
}

export async function fetchTriageQuestion(id: string): Promise<TriagePublicQuestion> {
  return request(`/triage/questions/${encodeURIComponent(id)}`);
}