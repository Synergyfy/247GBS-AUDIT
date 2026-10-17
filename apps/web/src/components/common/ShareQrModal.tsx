"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, ExternalLink, QrCode, Download, Sparkles } from "lucide-react";

interface ShareQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  url: string;
  badge?: string;
}

export function ShareQrModal({
  isOpen,
  onClose,
  title,
  subtitle,
  url,
  badge = "Public Access Link",
}: ShareQrModalProps) {
  const [copied, setCopied] = useState(false);

  const fullUrl =
    typeof window !== "undefined"
      ? url.startsWith("http")
        ? url
        : `${window.location.origin}${url}`
      : url;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=12&format=svg&data=${encodeURIComponent(
    fullUrl
  )}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownloadQr = async () => {
    try {
      const response = await fetch(
        `https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=20&format=png&data=${encodeURIComponent(
          fullUrl
        )}`
      );
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-qr.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(qrImageUrl, "_blank");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100 p-6 sm:p-7"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-bold text-orange-600 uppercase tracking-wider">
                <QrCode size={12} />
                {badge}
              </span>
              <h3 className="mt-2 text-lg font-bold text-slate-900 leading-snug">{title}</h3>
              {subtitle && <p className="mt-0.5 text-xs text-slate-500 font-medium">{subtitle}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* QR Code Container */}
          <div className="mt-5 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-slate-50 to-orange-50/30 p-6 border border-slate-100">
            <div className="relative rounded-2xl bg-white p-3 shadow-md border border-slate-100/80">
              <img
                src={qrImageUrl}
                alt="QR Code"
                width={200}
                height={200}
                className="h-48 w-48 rounded-xl object-contain"
              />
              <div className="absolute inset-x-0 -bottom-2 flex justify-center">
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-bold text-white shadow">
                  <Sparkles size={10} className="text-orange-400" /> Scan with mobile
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadQr}
              className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-orange-600 transition-colors"
            >
              <Download size={13} />
              Download High-Res QR (PNG)
            </button>
          </div>

          {/* Public Link Box */}
          <div className="mt-5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Shareable Direct Link
            </label>
            <div className="mt-1.5 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-1.5 pl-3">
              <input
                type="text"
                readOnly
                value={fullUrl}
                className="w-full bg-transparent text-xs font-medium text-slate-700 outline-none truncate"
              />
              <button
                type="button"
                onClick={handleCopy}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all shadow-sm ${
                  copied
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-900 text-white hover:bg-orange-500 active:scale-95"
                }`}
              >
                {copied ? (
                  <>
                    <Check size={13} /> Copied!
                  </>
                ) : (
                  <>
                    <Copy size={13} /> Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
            <a
              href={fullUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors"
            >
              Open public page <ExternalLink size={13} />
            </a>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
