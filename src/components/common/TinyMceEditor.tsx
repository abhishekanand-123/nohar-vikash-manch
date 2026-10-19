import { useEffect, useMemo } from "react";
import { Editor } from "@tinymce/tinymce-react";

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

  useEffect(() => {
    const keepTinyDialogsFocusable = (event: FocusEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest(".tox-tinymce-aux, .tox-dialog, .tox-menu")) {
        event.stopImmediatePropagation();
      }
    };
    document.addEventListener("focusin", keepTinyDialogsFocusable, true);
    return () => document.removeEventListener("focusin", keepTinyDialogsFocusable, true);
  }, []);

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
        "undo redo | blocks | bold italic underline strikethrough | alignleft aligncenter alignright | bullist numlist outdent indent | link image media table | removeformat | code fullscreen",
      toolbar_mode: "sliding" as const,
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
      {label && (
        <div className="mb-1.5 flex items-center justify-between px-0.5">
          <span className="text-xs font-semibold text-foreground">{label}</span>
          <span className="text-[11px] text-muted-foreground">TinyMCE editor</span>
        </div>
      )}
      <Editor
        licenseKey="gpl"
        value={value || ""}
        onEditorChange={(html) => onChange(normalizeHtml(html))}
        init={init}
      />
    </div>
  );
}
