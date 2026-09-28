"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Bold, Eraser, Image as ImageIcon, Italic, Link2, Underline } from "lucide-react";
import { escapeHtml, sanitizeRichHtml } from "@/lib/richText";

const MAX_INLINE_IMAGE_BYTES = 1_000_000;
const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];

/** Normalise a link URL, rejecting dangerous schemes and adding https by default. */
function normalizeLink(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^(javascript:|data:|vbscript:)/i.test(trimmed)) return "";
  if (/^(https?:\/\/|mailto:|tel:|\/)/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/**
 * Google Forms-style question text editor: a compact contentEditable with a
 * small formatting toolbar. Formatting is committed on blur as sanitised HTML;
 * plain text is kept alongside so the rest of the app keeps reading `text`.
 */
export function QuestionTextEditor({
  initialHtml,
  onCommit,
}: {
  initialHtml: string;
  /** Return true to accept the blur value, false to reset to `initialHtml`. */
  onCommit: (html: string, plain: string) => boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const [htmlState, setHtmlState] = useState(initialHtml);
  const [active, setActive] = useState({ bold: false, italic: false, underline: false });

  // Push external changes into the DOM only while the user is not editing,
  // otherwise the caret jumps on every keystroke.
  useEffect(() => {
    const el = rootRef.current;
    if (el && !focused && el.innerHTML !== htmlState) el.innerHTML = htmlState;
  }, [htmlState, focused]);

  const refreshActive = useCallback(() => {
    setActive({
      bold: document.queryCommandState?.("bold") ?? false,
      italic: document.queryCommandState?.("italic") ?? false,
      underline: document.queryCommandState?.("underline") ?? false,
    });
  }, []);

  const sync = useCallback(() => {
    const el = rootRef.current;
    if (!el) return;
    setHtmlState(el.innerHTML);
    refreshActive();
  }, [refreshActive]);

  useEffect(() => {
    if (!focused) return;
    document.addEventListener("selectionchange", sync);
    return () => document.removeEventListener("selectionchange", sync);
  }, [focused, sync]);

  const run = useCallback(
    (command: string, value = "") => {
      const el = rootRef.current;
      if (!el) return;
      el.focus();
      try {
        document.execCommand(command, false, value);
      } catch {
        /* legacy API can throw in odd states — just sync */
      }
      sync();
    },
    [sync]
  );

  const handleLink = useCallback(() => {
    const el = rootRef.current;
    if (!el) return;
    el.focus();
    let existing = "";
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const container = selection.getRangeAt(0).commonAncestorContainer;
      const element = (container.nodeType === Node.ELEMENT_NODE ? container : container.parentElement) as
        | HTMLElement
        | null;
      existing = element?.closest?.("a")?.getAttribute("href") ?? "";
    }
    const raw = window.prompt("Link URL (https://…)", existing);
    if (raw === null) return;
    const url = normalizeLink(raw);
    if (!url) {
      window.alert("That link is not allowed. Use http(s), mailto, tel or a relative path.");
      return;
    }
    run("createLink", url);
  }, [run]);

  const handleImage = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        window.alert("Please choose a PNG, JPEG, GIF or WebP image.");
        if (fileRef.current) fileRef.current.value = "";
        return;
      }
      if (file.size > MAX_INLINE_IMAGE_BYTES) {
        window.alert("That image is larger than 1 MB. Please choose a smaller image.");
        if (fileRef.current) fileRef.current.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        run("insertImage", typeof reader.result === "string" ? reader.result : "");
        if (fileRef.current) fileRef.current.value = "";
      };
      reader.readAsDataURL(file);
    },
    [run]
  );

  const handleBlur = useCallback(() => {
    requestAnimationFrame(() => {
      setFocused(false);
      const el = rootRef.current;
      if (!el) return;
      const html = sanitizeRichHtml(el.innerHTML);
      const plain = (el.innerText || el.textContent || "").trim();
      const accepted = onCommit(html, plain);
      if (accepted) {
        setHtmlState(html);
      } else {
        el.innerHTML = initialHtml;
        setHtmlState(initialHtml);
      }
    });
  }, [onCommit, initialHtml]);

  const requestImage = useCallback(() => {
    fileRef.current?.click();
  }, []);

  return (
    <div className="rounded-xl border-2 border-slate-200 bg-white transition-all focus-within:border-orange-400">
      <div
        ref={rootRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label="Question text"
        data-placeholder="Question text"
        spellCheck
        className="question-editor min-h-[46px] w-full px-4 py-3 text-sm font-semibold text-slate-900 outline-none"
        onFocus={() => setFocused(true)}
        onBlur={handleBlur}
        onInput={sync}
      />

      {focused && (
        <div
          className="flex flex-wrap items-center gap-0.5 border-t border-slate-100 px-2 py-1.5"
          onMouseDown={(e) => e.preventDefault()}
        >
          <button
            type="button"
            aria-label="Bold"
            title="Bold"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => run("bold")}
            className={`inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-orange-600 ${
              active.bold ? "bg-orange-50 text-orange-600" : ""
            }`}
          >
            <Bold size={14} />
          </button>
          <button
            type="button"
            aria-label="Italic"
            title="Italic"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => run("italic")}
            className={`inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-orange-600 ${
              active.italic ? "bg-orange-50 text-orange-600" : ""
            }`}
          >
            <Italic size={14} />
          </button>
          <button
            type="button"
            aria-label="Underline"
            title="Underline"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => run("underline")}
            className={`inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-orange-600 ${
              active.underline ? "bg-orange-50 text-orange-600" : ""
            }`}
          >
            <Underline size={14} />
          </button>
          <button
            type="button"
            aria-label="Insert link"
            title="Insert link"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleLink}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-orange-600"
          >
            <Link2 size={14} />
          </button>
          <button
            type="button"
            aria-label="Remove formatting"
            title="Remove formatting"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => run("removeFormat")}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-orange-600"
          >
            <Eraser size={14} />
          </button>
          <button
            type="button"
            aria-label="Insert inline image"
            title="Insert inline image"
            onMouseDown={(e) => e.preventDefault()}
            onClick={requestImage}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-orange-600"
          >
            <ImageIcon size={14} />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(",")}
            className="hidden"
            onChange={(e) => handleImage(e.target.files?.[0])}
          />
        </div>
      )}
    </div>
  );
}

/** Initial HTML for the editor: a stored rich version, else escaped plain text. */
export function editorHtmlOf(plainText: string, contentHtml?: string | null): string {
  if (contentHtml && contentHtml.trim() && contentHtml !== plainText) return contentHtml;
  return escapeHtml(plainText);
}