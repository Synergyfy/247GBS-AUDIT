/**
 * Rich-text helpers for the Business Triage builder + public responder.
 *
 * Question text can carry a small, sanitised HTML representation (`config.contentHtml`).
 * It is authored in a lightweight contentEditable and never trusted as-is: this module
 * strips anything outside of the tiny allow-list used by the editor before it is stored
 * or rendered.
 */

const KEEP_TAGS = new Set(["P", "BR", "B", "STRONG", "I", "EM", "U", "A", "IMG", "SPAN", "DIV"]);

/** Block elements are removed entirely (with their content), not unwrapped. */
const DROP_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "IFRAME",
  "OBJECT",
  "EMBED",
  "SVG",
  "MATH",
  "FORM",
  "BUTTON",
  "INPUT",
  "SELECT",
  "TEXTAREA",
  "LINK",
  "META",
  "BASE",
]);

/** Only these attributes survive, keyed by tag. */
const ALLOWED_ATTRS: Record<string, string[]> = {
  A: ["href", "target", "rel", "title"],
  IMG: ["src", "alt", "title"],
};

const HTTP_SAFE = /^(https?:|mailto:|tel:|#|\/|\.\/|\.\.\/)/i;
const IMG_SAFE = /^(data:image\/(png|jpe?g|gif|webp|bmp|svg\+xml))/i;

/** Escape the characters DOM serialisation also escapes (&, <, >). */
export function escapeHtml(text: string): string {
  return text.replace(/[&<>]/g, (ch) => (ch === "&" ? "&amp;" : ch === "<" ? "&lt;" : "&gt;"));
}

function isServer(): boolean {
  return typeof window === "undefined" || typeof DOMParser === "undefined";
}

/**
 * Reduce arbitrary HTML to the allow-list above. Safe to call at render time;
 * returns a bare, escaped string when a DOM is not available.
 */
export function sanitizeRichHtml(html: string): string {
  if (!html) return "";
  if (isServer()) return escapeHtml(html);
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");
  const body = doc.body;

  const elements: Element[] = [];
  const walker = doc.createTreeWalker(body, NodeFilter.SHOW_ELEMENT);
  while (walker.nextNode()) elements.push(walker.currentNode as Element);

  for (const el of elements) {
    const tag = el.tagName.toUpperCase();
    if (DROP_TAGS.has(tag)) {
      el.parentNode?.removeChild(el);
      continue;
    }
    if (!KEEP_TAGS.has(tag)) {
      const parent = el.parentNode;
      while (el.firstChild) parent?.insertBefore(el.firstChild, el);
      parent?.removeChild(el);
      continue;
    }
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      const allowed = ALLOWED_ATTRS[tag] ?? [];
      if (name.startsWith("on") || !allowed.includes(name)) {
        el.removeAttribute(attr.name);
        continue;
      }
      if (tag === "A" && name === "href") {
        if (attr.value.toLowerCase().startsWith("javascript:")) el.removeAttribute("href");
        else if (!HTTP_SAFE.test(attr.value.trim())) attr.value = "#";
        el.setAttribute("rel", "noopener noreferrer");
        if (!el.getAttribute("target")) el.setAttribute("target", "_blank");
      }
      if (tag === "IMG" && name === "src" && !IMG_SAFE.test(attr.value.trim()) && !HTTP_SAFE.test(attr.value.trim())) {
        el.removeAttribute("src");
      }
    }
  }
  return body.innerHTML;
}

/** True when the html contains actual formatting and is worth persisting. */
export function isFormattedHtml(html: string, plainText: string): boolean {
  const trimmed = html.trim();
  if (!trimmed) return false;
  if (trimmed === plainText) return false;
  if (trimmed === escapeHtml(plainText)) return false;
  return true;
}

/** Best-effort plain text of stored HTML (used only for fallback display). */
export function htmlToPlainText(html: string): string {
  if (!html) return "";
  if (isServer()) return html.replace(/<[^>]*>/g, "");
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");
  return (doc.body.textContent ?? "").trim();
}