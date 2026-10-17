"use client";

import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import { refreshAccessToken, handleSessionExpired } from "@/lib/auth";
import type {
  AuditForm,
  AuditFormType,
  CreateAuditFormPayload,
  UpdateAuditFormPayload,
  CreateAuditQuestionPayload,
  CreateAuditAnswerPayload,
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
    throw err;
  }

  if (res.status === 204) return null;
  return res.json();
}

export function useAdminAuditForms(type?: AuditFormType) {
  const [data, setData] = useState<AuditForm[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const url = type
        ? `/admin/audits/forms?type=${encodeURIComponent(type)}`
        : "/admin/audits/forms";
      const json = (await authFetch(url, { method: "GET", signal })) as AuditForm[];
      setData(json);
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      setError(err?.message ?? "Failed to load audit forms");
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    const ac = new AbortController();
    fetchData(ac.signal);

    const onFocus = () => fetchData();
    window.addEventListener("focus", onFocus);
    return () => {
      ac.abort();
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData } as const;
}

export function useAdminAuditForm(id: string | null) {
  const [data, setData] = useState<AuditForm | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) {
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const json = (await authFetch(`/admin/audits/forms/${id}`, { method: "GET" })) as AuditForm;
      setData(json);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load audit form");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData } as const;
}

export const auditFormsApi = {
  listForms: (type?: AuditFormType): Promise<AuditForm[]> => {
    const url = type ? `/admin/audits/forms?type=${encodeURIComponent(type)}` : "/admin/audits/forms";
    return authFetch(url, { method: "GET" });
  },

  getForm: (id: string): Promise<AuditForm> =>
    authFetch(`/admin/audits/forms/${id}`, { method: "GET" }),

  createForm: (payload: CreateAuditFormPayload): Promise<AuditForm> =>
    authFetch("/admin/audits/forms", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateForm: (id: string, payload: UpdateAuditFormPayload): Promise<AuditForm> =>
    authFetch(`/admin/audits/forms/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  setDefault: (id: string): Promise<AuditForm> =>
    authFetch(`/admin/audits/forms/${id}/default`, {
      method: "POST",
    }),

  deleteForm: (id: string): Promise<{ message: string }> =>
    authFetch(`/admin/audits/forms/${id}`, {
      method: "DELETE",
    }),

  createQuestion: (formId: string, payload: CreateAuditQuestionPayload) =>
    authFetch(`/admin/audits/forms/${formId}/questions`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateQuestion: (qid: string, payload: Partial<CreateAuditQuestionPayload>) =>
    authFetch(`/admin/audits/forms/questions/${qid}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  deleteQuestion: (qid: string) =>
    authFetch(`/admin/audits/forms/questions/${qid}`, { method: "DELETE" }),

  createAnswer: (qid: string, payload: CreateAuditAnswerPayload) =>
    authFetch(`/admin/audits/forms/questions/${qid}/answers`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateAnswer: (aid: string, payload: Partial<CreateAuditAnswerPayload>) =>
    authFetch(`/admin/audits/forms/answers/${aid}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  deleteAnswer: (aid: string) =>
    authFetch(`/admin/audits/forms/answers/${aid}`, { method: "DELETE" }),
};
