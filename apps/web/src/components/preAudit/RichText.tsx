"use client";

import React from "react";
import { htmlToPlainText, sanitizeRichHtml } from "@/lib/richText";

/**
 * Renders question text. Prefers the sanitised rich-text representation
 * (`contentHtml`) so formatting authored in the builder survives to the public
 * form; falls back to the plain `text`.
 */
export function RichText({
  text,
  html,
  className,
}: {
  text: string;
  html?: string | null;
  className?: string;
}) {
  const rich = html && html.trim() ? sanitizeRichHtml(html) : "";
  const plain = rich ? htmlToPlainText(rich) : text;

  return (
    <div className={`rich-text ${className ?? ""}`}>
      {rich ? (
        // Rich text is authored by the admin in a allow-list editor and sanitised
        // again here before it reaches the DOM.
        <span dangerouslySetInnerHTML={{ __html: rich }} />
      ) : (
        text
      )}
      {!plain && "\u00a0"}
    </div>
  );
}