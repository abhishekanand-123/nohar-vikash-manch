import { useEffect, useMemo, useState, useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { Code, Copy, Check, Eye } from "lucide-react";
import { toast } from "sonner";

import "tinymce/tinymce";
import "tinymce/icons/default";
import "tinymce/themes/silver";
import "tinymce/models/dom";
import "tinymce/skins/ui/oxide/skin.min.css";
import "tinymce/plugins/advlist";
import "tinymce/plugins/anchor";
import "tinymce/plugins/autolink";
import "tinymce/plugins/charmap";
import "tinymce/plugins/code";
import "tinymce/plugins/fullscreen";
import "tinymce/plugins/image";
import "tinymce/plugins/insertdatetime";
import "tinymce/plugins/link";
import "tinymce/plugins/lists";
import "tinymce/plugins/media";
import "tinymce/plugins/preview";
import "tinymce/plugins/searchreplace";
import "tinymce/plugins/table";
import "tinymce/plugins/visualblocks";
import "tinymce/plugins/wordcount";

import "./tinymce-editor.css";

export interface TinyMceEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
  label?: string;
  menubar?: boolean;
}

function parseMinHeight(minHeight: string | undefined): number {
  if (!minHeight) return 280;
  const parsed = Number.parseInt(minHeight, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 280;
}

function normalizeHtml(html: string): string {
  const cleaned = html
    .replace(/\uFFFD/g, "")
    .replace(/[\u200B\u200C\u200D\u2060\uFEFF]/g, "")
    .trim();
  if (
    !cleaned ||
    cleaned === "<br>" ||
    cleaned === "<p></p>" ||
    cleaned === "<p><br></p>" ||
    cleaned === "<p><br data-mce-bogus=\"1\"></p>"
  ) {
    return "";
  }
  return html.replace(/\uFFFD/g, "").replace(/[\u200B\u200C\u200D\u2060\uFEFF]/g, "");
}

export default function TinyMceEditor({
  value,
  onChange,
  placeholder = "यहाँ विस्तृत विवरण लिखें...",
  minHeight = "180px",
  className = "",
  label,
  menubar = true,
}: TinyMceEditorProps) {
  const height = parseMinHeight(minHeight);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const editorRef = useRef<any>(null);

  // Prevent Radix Dialog / parent modal from stealing focus or blocking copy/selection in TinyMCE dialogs
  useEffect(() => {
    const allowTinyAuxEvents = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (
        target?.closest(
          ".tox-tinymce-aux, .tox-dialog, .tox-dialog-wrap, .tox-menu, .tox-collection, textarea.tox-textarea, .tox-control-wrap"
        )
      ) {
        event.stopImmediatePropagation();
      }
    };
    const events = ["focusin", "focus", "pointerdown", "mousedown", "touchstart", "copy", "selectstart"];
    events.forEach((evt) => {
      document.addEventListener(evt, allowTinyAuxEvents, true);
    });
    return () => {
      events.forEach((evt) => {
        document.removeEventListener(evt, allowTinyAuxEvents, true);
      });
    };
  }, []);

  const handleCopyHtml = async () => {
    try {
      const currentHtml = isSourceMode
        ? value || ""
        : editorRef.current
        ? editorRef.current.getContent()
        : value || "";
      await navigator.clipboard.writeText(currentHtml);
      setCopied(true);
      toast.success("HTML सोर्स कोड कॉपी हो गया!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("कॉपी करने में विफल");
    }
  };

  const init = useMemo(
    () => ({
      height,
      menubar,
      branding: false,
      promotion: false,
      skin: false,
      content_css: false,
      placeholder,
      plugins:
        "advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table wordcount",
      toolbar:
        "undo redo | code | blocks | bold italic underline strikethrough | link image media table | bullist numlist | alignleft aligncenter alignright | removeformat | fullscreen",
      toolbar_mode: "wrap" as const,
      contextmenu: "link image table",
      relative_urls: false,
      convert_urls: false,
      link_default_target: "_blank",
      link_assume_external_targets: true,
      default_link_target: "_blank",
      image_title: true,
      automatic_uploads: false,
      content_style: `
        body {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 14px;
          line-height: 1.7;
          color: #0f172a;
          padding: 8px 12px;
        }
        a { color: #169a4a; font-weight: 600; }
        img { max-width: 100%; height: auto; }
      `,
    }),
    [height, placeholder, menubar],
  );

  return (
    <div className={`tinymce-editor-shell ${className}`}>
      {/* Editor Top Bar with Label, HTML Source Code Toggle, and One-Click Copy */}
      <div className="mb-2 flex items-center justify-between gap-2 flex-wrap">
        {label ? (
          <span className="text-xs font-semibold text-foreground">{label}</span>
        ) : (
          <span className="text-[11px] text-muted-foreground font-medium">Editor Toolbar</span>
        )}

        <div className="flex items-center gap-1.5 ml-auto">
          {/* Quick Copy HTML */}
          <button
            type="button"
            onClick={handleCopyHtml}
            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all border border-border bg-secondary hover:bg-secondary/80 text-secondary-foreground shadow-xs active:scale-95"
            title="पूरा HTML सोर्स कोड क्लिपबोर्ड पर कॉपी करें"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy HTML"}</span>
          </button>

          {/* Mode toggle: Visual View / HTML Source Code */}
          <button
            type="button"
            onClick={() => setIsSourceMode(!isSourceMode)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all border shadow-xs active:scale-95 ${
              isSourceMode
                ? "bg-accent text-accent-foreground border-accent shadow-sm"
                : "bg-secondary hover:bg-secondary/80 text-secondary-foreground border-border"
            }`}
            title={isSourceMode ? "विजुअल एडिटर (Visual View) पर जाएँ" : "HTML सोर्स कोड देखें व संपादित करें"}
          >
            {isSourceMode ? <Eye className="w-3.5 h-3.5" /> : <Code className="w-3.5 h-3.5" />}
            <span>{isSourceMode ? "Visual View" : "Source Code (<>)"}</span>
          </button>
        </div>
      </div>

      {/* Editor Content Area: Source Code Mode vs TinyMCE Visual Mode */}
      {isSourceMode ? (
        <div className="border border-border rounded-xl overflow-hidden bg-slate-900 text-slate-100 flex flex-col shadow-sm">
          <div className="flex items-center justify-between px-3 py-2 bg-slate-800/90 border-b border-slate-700 text-xs">
            <span className="font-mono text-emerald-400 flex items-center gap-1.5 text-xs font-semibold">
              <Code className="w-3.5 h-3.5" /> HTML Source Code View
            </span>
            <span className="text-[10px] text-slate-400">
              सीधे HTML कोड संपादित या कॉपी करें
            </span>
          </div>
          <textarea
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-slate-950 font-mono text-xs text-slate-100 p-3.5 focus:outline-none resize-y leading-relaxed border-none"
            style={{ minHeight: `${height}px` }}
            placeholder="<p>यहाँ HTML कोड लिखें या पेस्ट करें...</p>"
            spellCheck={false}
          />
        </div>
      ) : (
        <Editor
          licenseKey="gpl"
          onInit={(_evt, editor) => {
            editorRef.current = editor;
          }}
          value={value || ""}
          onEditorChange={(html) => onChange(normalizeHtml(html))}
          init={init}
        />
      )}
    </div>
  );
}
