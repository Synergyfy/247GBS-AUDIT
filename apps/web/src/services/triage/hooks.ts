"use client";

import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import { refreshAccessToken, handleSessionExpired } from "@/lib/auth";
import type {
  AdminTriageQuestion,
  AdminTriageResponse,
  QuestionConfig,
  QuestionType,
  TriageAuditType,
  TriageDestinationType,
} from "./types";

function getToken(): string | null {
  return typeof window !== "undefined" ? localStorage.getItem("247gbs_token") : null;
}

async function authFetch(path: string, init: RequestInit, retried = false): Promise<any> {
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
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.message || `Request failed (${res.status})`);
  }

  if (res.status === 204) return null;
  return res.json();
}

export function useAdminTriageQuestions() {
  const [data, setData] = useState<AdminTriageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const json = (await authFetch("/admin/triage/questions", { method: "GET", signal })) as AdminTriageResponse;
      setData(json);
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      setError(err?.message ?? "Failed to load triage questions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    fetchData(ac.signal);

    const onFocus = () => fetchData();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "247gbs_token") fetchData();
    };

    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onStorage);

    return () => {
      ac.abort();
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
    };
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData } as const;
}

export function useAdminTriageQuestionById(id: string | null) {
  const [data, setData] = useState<AdminTriageQuestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const list = (await authFetch("/admin/triage/questions", { method: "GET" })) as AdminTriageResponse;
      const found = list.find((q) => q.id === id) ?? null;
      if (!found) throw new Error("Triage question not found");
      setData(found);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load triage question");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData } as const;
}

export interface QuestionPayload {
  text: string;
  type?: QuestionType;
  description?: string | null;
  hint?: string | null;
  icon?: string | null;
  required?: boolean;
  config?: QuestionConfig;
  defaultNextQuestionId?: string | null;
  defaultAuditType?: TriageAuditType | null;
  defaultDestinationType?: TriageDestinationType | null;
  defaultDestinationTarget?: string | null;
  order?: number;
  isActive?: boolean;
}

export interface AnswerPayload {
  text: string;
  nextQuestionId?: string | null;
  auditType?: TriageAuditType | null;
  destinationType?: TriageDestinationType | null;
  destinationTarget?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export const triageApi = {
  createQuestion: (payload: QuestionPayload) =>
    authFetch("/admin/triage/questions", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateQuestion: (id: string, payload: Partial<QuestionPayload>) =>
    authFetch(`/admin/triage/questions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  deleteQuestion: (id: string) =>
    authFetch(`/admin/triage/questions/${id}`, { method: "DELETE" }),

  createAnswer: (questionId: string, payload: AnswerPayload) =>
    authFetch(`/admin/triage/questions/${questionId}/answers`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateAnswer: (id: string, payload: Partial<AnswerPayload>) =>
    authFetch(`/admin/triage/answers/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  deleteAnswer: (id: string) =>
    authFetch(`/admin/triage/answers/${id}`, { method: "DELETE" }),
};