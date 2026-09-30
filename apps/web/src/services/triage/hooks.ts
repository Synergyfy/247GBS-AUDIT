"use client";

import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import { refreshAccessToken, handleSessionExpired } from "@/lib/auth";
import type {
  AdminTriageQuestion,
  AdminTriageResponse,
  PublishTriageFormResult,
  PublishValidationResult,
  QuestionConfig,
  QuestionType,
  TriageAuditType,
  TriageDestinationType,
  TriageForm,
  TriageFormSettings,
  TriageResponseDetail,
  TriageResponsesOverview,
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

  let res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers, credentials: "include" });

  if (res.status === 401 && !retried) {
    const newToken = await refreshAccessToken();
    if (newToken === false) {
      handleSessionExpired();
      throw new Error("Session expired. Please sign in again.");
    }
    if (newToken) {
      headers["Authorization"] = `Bearer ${newToken}`;
      res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers, credentials: "include" });
    }
  }

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    const err: any = new Error(errJson.message || `Request failed (${res.status})`);
    err.status = res.status;
    if (Array.isArray(errJson.issues)) err.issues = errJson.issues;
    if (Array.isArray(errJson.warnings)) err.warnings = errJson.warnings;
    throw err;
  }

  if (res.status === 204) return null;
  return res.json();
}

export function useAdminTriageQuestions(formId?: string) {
  const [data, setData] = useState<AdminTriageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const url = formId
        ? `/admin/triage/questions?formId=${encodeURIComponent(formId)}`
        : "/admin/triage/questions";
      const json = (await authFetch(url, { method: "GET", signal })) as AdminTriageResponse;
      setData(json);
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      setError(err?.message ?? "Failed to load triage questions");
    } finally {
      setLoading(false);
    }
  }, [formId]);

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
  formId?: string | null;
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
  internalValue?: string | null;
  tag?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

/** Error surfaced by authFetch on a failed request (e.g. publish validation). */
export interface FormApiError extends Error {
  status?: number;
  issues?: string[];
  warnings?: string[];
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

export interface UpdateFormPayload {
  title?: string;
  description?: string | null;
  isDefault?: boolean;
  settings?: Partial<TriageFormSettings>;
}

export const formApi = {
  listForms: async (): Promise<TriageForm[]> => {
    const res = await authFetch("/admin/triage/forms", { method: "GET" });
    return res as unknown as TriageForm[];
  },

  createForm: async (payload: { title: string; description?: string | null; isDefault?: boolean; settings?: Partial<TriageFormSettings> }): Promise<TriageForm> => {
    const res = await authFetch("/admin/triage/forms", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res as unknown as TriageForm;
  },

  getForm: async (id?: string): Promise<TriageForm> => {
    const url = id ? `/admin/triage/forms/${id}` : "/admin/triage/form";
    const res = await authFetch(url, { method: "GET" });
    return res as unknown as TriageForm;
  },

  updateForm: (payload: UpdateFormPayload, id?: string) => {
    const url = id ? `/admin/triage/forms/${id}` : "/admin/triage/form";
    return authFetch(url, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  setDefault: (id: string): Promise<TriageForm> =>
    authFetch(`/admin/triage/forms/${id}/default`, {
      method: "POST",
    }),

  deleteForm: (id: string): Promise<{ message: string }> =>
    authFetch(`/admin/triage/forms/${id}`, {
      method: "DELETE",
    }),

  publish: async (id?: string): Promise<PublishTriageFormResult> => {
    const url = id ? `/admin/triage/forms/${id}/publish` : "/admin/triage/publish";
    const res = await authFetch(url, { method: "POST" });
    return res as unknown as PublishTriageFormResult;
  },

  unpublish: async (id?: string): Promise<PublishTriageFormResult> => {
    const url = id ? `/admin/triage/forms/${id}/unpublish` : "/admin/triage/unpublish";
    const res = await authFetch(url, { method: "POST" });
    return res as unknown as PublishTriageFormResult;
  },

  /** Publish-gate payload: errors carry the validation `issues`/`warnings` arrays. */
  getValidationErrors: async (err: unknown): Promise<PublishValidationResult> => {
    const e = err as FormApiError;
    return {
      ok: false,
      issues: (e?.issues ?? []).map((issue) => ({ message: issue })),
      warnings: (e?.warnings ?? []).map((warning) => ({ message: warning })),
    };
  },
};

export const responsesApi = {
  list: async (): Promise<TriageResponsesOverview> => {
    const res = await authFetch("/admin/triage/responses", { method: "GET" });
    return res as unknown as TriageResponsesOverview;
  },

  get: async (id: string): Promise<TriageResponseDetail> => {
    const res = await authFetch(`/admin/triage/responses/${id}`, { method: "GET" });
    return res as unknown as TriageResponseDetail;
  },
};