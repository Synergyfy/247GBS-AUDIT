"use client";

import { API_BASE_URL } from "@/lib/api";

export interface SendOtpResult {
  success: boolean;
  message: string;
}

export interface VerifyOtpResult {
  verified: boolean;
  message: string;
}

export async function sendPreAuditOtp(email: string): Promise<SendOtpResult> {
  const res = await fetch(`${API_BASE_URL}/pre-audit/otp/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Failed to send verification code. Please try again.");
  }

  return data as SendOtpResult;
}

export async function verifyPreAuditOtp(email: string, code: string): Promise<VerifyOtpResult> {
  const res = await fetch(`${API_BASE_URL}/pre-audit/otp/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      code: code.trim(),
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Invalid verification code. Please check and try again.");
  }

  return data as VerifyOtpResult;
}
