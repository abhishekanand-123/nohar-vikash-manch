import React, { useMemo } from "react";

interface RichContentViewProps {
  content: string | null | undefined;
  className?: string;
  compact?: boolean;
}

// Regex to detect standard HTML tags
const HTML_TAG_REGEX = /<\/?(p|div|h[1-6]|ul|ol|li|blockquote|table|tr|td|th|a|img|span|b|strong|i|em|u|br|code|pre)\b[^>]*>/i;

// Regex to detect HTML entities for tags (e.g. &lt;p&gt;, &lt;a )
const ENCODED_TAG_REGEX = /&lt;\/?(p|div|h[1-6]|ul|ol|li|blockquote|table|tr|td|th|a|img|span|b|strong|i|em|u|br|code|pre)\b[^&]*&gt;/i;

// URL detection regex for plain text
const URL_REGEX = /(https?:\/\/[^\s<>"')]+)/gi;

/**
 * Clean invisible unicode artifacts (replacement char \uFFFD, zero-width spaces)
 * and safely decode HTML entities if content was stored entity-encoded.
 */
function normalizeContent(raw: string): string {
  if (!raw) return "";

  // 1. Remove unicode replacement chars (the black diamond with question mark) and invisible zero-width chars
  let text = raw
    .replace(/\uFFFD/g, "")
    .replace(/[\u200B\u200C\u200D\u2060\uFEFF]/g, "");

  // 2. If content has encoded tags like &lt;p&gt; or &lt;a href=..., decode entities
  if (ENCODED_TAG_REGEX.test(text) || (text.includes("&lt;") && text.includes("&gt;"))) {
    text = text
      .replace(/&amp;lt;/g, "&lt;")
      .replace(/&amp;gt;/g, "&gt;")
      .replace(/&amp;quot;/g, "&quot;")
      .replace(/&amp;amp;/g, "&amp;")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ");
  }

  return text;
}

/**
 * Strips HTML tags, entities, and markdown/unicode artifacts to provide clean human-readable text
 * suitable for preview cards, snippets, and SEO meta descriptions.
 */
export function stripHtmlToPlainText(content: string | null | undefined): string {
  if (!content) return "";
  const normalized = normalizeContent(content);
  return normalized
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&[a-z0-9#]+;/gi, " ")
    .replace(/[#*_~`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Utility to convert plain text containing URLs into React elements with clickable links.
 * Works seamlessly with emojis, Hindi text, parentheses, etc.
 */
export function formatAutoLinks(text: string | null | undefined): React.ReactNode {
  if (!text) return null;

  const normalized = normalizeContent(text);
  // Split lines to preserve line breaks
  const lines = normalized.split(/\r?\n/);

  return lines.map((line, lineIndex) => {
    // If line has URLs, split by URL regex
    const parts = line.split(URL_REGEX);

    return (
      <React.Fragment key={lineIndex}>
        {parts.map((part, partIndex) => {
          if (part.match(URL_REGEX)) {
            let displayUrl = part;
            // Clean trailing punctuation if accidentally matched
            let cleanUrl = part;
            const trailingMatch = cleanUrl.match(/[.,!?;:)]+$/);
            let trailing = "";
            if (trailingMatch) {
              trailing = trailingMatch[0];
              cleanUrl = cleanUrl.slice(0, -trailing.length);
              displayUrl = cleanUrl;
            }

            return (
              <React.Fragment key={partIndex}>
                <a
                  href={cleanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-primary hover:text-accent dark:text-emerald-400 dark:hover:text-amber-400 font-semibold underline underline-offset-4 decoration-primary/60 hover:decoration-accent hover:decoration-2 hover:underline-offset-2 break-all transition-all duration-200 inline-flex items-center gap-0.5 cursor-pointer"
                >
                  {displayUrl}
                </a>
                {trailing}
              </React.Fragment>
            );
          }
          return <span key={partIndex}>{part}</span>;
        })}
        {lineIndex < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
}

/**
 * Sanitizes and prepares HTML content:
 * 1. Ensures all links match site theme (primary green), interactive hover (accent saffron), and open in new tab
 * 2. Constrains images so they never overflow, overlap, or get cut off on mobile screens
 */
function prepareHtmlContent(rawHtml: string): string {
  if (!rawHtml) return "";
  let html = rawHtml;

  // Ensure target="_blank" and rel="noopener noreferrer" and site-themed link styling with hover effect
  html = html.replace(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"([^>]*)>/gi, (match, href, rest) => {
    let cleanRest = rest
      .replace(/target="[^"]*"/gi, "")
      .replace(/rel="[^"]*"/gi, "")
      .replace(/onclick="[^"]*"/gi, "")
      .replace(/class="[^"]*"/gi, "");
    return `<a href="${href}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()" class="text-primary hover:text-accent dark:text-emerald-400 dark:hover:text-amber-400 font-semibold underline underline-offset-4 decoration-primary/60 hover:decoration-accent hover:decoration-2 hover:underline-offset-2 break-all transition-all duration-200 cursor-pointer" ${cleanRest}>`;
  });

  // Ensure any images in content are responsive, lazy-loaded, object-contain, and never cut off on mobile
  html = html.replace(/<img\s+(?!.*?class=)/gi, '<img class="max-w-full h-auto object-contain rounded-2xl my-4 mx-auto block shadow-sm border border-border" loading="lazy" decoding="async" ');

  return html;
}

/**
 * Universal content viewer that supports:
 * 1. Rich HTML content from the editor (with entity auto-decode)
 * 2. Legacy plain text content with automatic clickable linkification
 * 3. Compact mode for card snippets and preview summaries
 */
export default function RichContentView({ content, className = "", compact = false }: RichContentViewProps) {
  if (!content) return null;

  const normalized = useMemo(() => normalizeContent(content), [content]);
  const isHtml = useMemo(() => HTML_TAG_REGEX.test(normalized), [normalized]);

  const preparedHtml = useMemo(() => {
    if (!isHtml) return "";
    return prepareHtmlContent(normalized);
  }, [normalized, isHtml]);

  if (isHtml) {
    const defaultClasses = compact
      ? "text-muted-foreground leading-relaxed break-words text-xs sm:text-sm [&_p]:inline [&_p]:mr-1.5 [&_h1]:inline [&_h2]:inline [&_h3]:inline [&_h4]:inline [&_br]:hidden [&_img]:hidden"
      : "prose prose-slate dark:prose-invert max-w-none text-foreground leading-relaxed break-words";

    return (
      <div
        className={`rich-rendered-content ${defaultClasses} ${className}`}
        dangerouslySetInnerHTML={{ __html: preparedHtml }}
      />
    );
  }

  // Fallback for plain text: preserves line breaks and auto-linkifies URLs
  const plainDefaultClasses = compact
    ? "text-muted-foreground leading-relaxed break-words text-xs sm:text-sm"
    : "text-foreground leading-relaxed whitespace-pre-line break-words";

  return (
    <div className={`rich-plain-content ${plainDefaultClasses} ${className}`}>
      {formatAutoLinks(normalized)}
    </div>
  );
}
