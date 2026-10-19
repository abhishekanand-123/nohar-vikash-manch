import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Unlink,
  RemoveFormatting,
  Code,
  Eye,
  ExternalLink,
  Check,
  X,
  Pencil,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
  label?: string;
}

// Helper to decode HTML entities if previously saved encoded
function decodeEntitiesIfPresent(str: string): string {
  if (!str) return "";
  if (str.includes("&lt;") && str.includes("&gt;")) {
    return str
      .replace(/&amp;lt;/g, "&lt;")
      .replace(/&amp;gt;/g, "&gt;")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ");
  }
  return str;
}

// Helper to determine if a string is already HTML or plain text
function isHtml(str: string): boolean {
  if (!str) return false;
  const decoded = decodeEntitiesIfPresent(str);
  return /<\/?(p|div|h[1-6]|ul|ol|li|blockquote|table|tr|td|th|a|img|span|b|strong|i|em|u|br|code|pre)\b[^>]*>/i.test(decoded);
}

// Convert plain text to safe HTML preserving line breaks
function plainTextToHtml(text: string): string {
  if (!text) return "";
  const cleaned = text
    .replace(/\uFFFD/g, "")
    .replace(/[\u200B\u200C\u200D\u2060\uFEFF]/g, "");
  const decoded = decodeEntitiesIfPresent(cleaned);
  if (isHtml(decoded)) return decoded;
  return cleaned
    .split(/\r?\n/)
    .map((line) => {
      const trimmed = line.trim();
      return trimmed.length > 0 ? `<p>${escapeHtml(line)}</p>` : "<p><br></p>";
    })
    .join("");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "यहाँ विस्तृत विवरण लिखें...",
  minHeight = "180px",
  className = "",
  label,
}: RichTextEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const editingAnchorRef = useRef<HTMLAnchorElement | null>(null);
  const [isCodeMode, setIsCodeMode] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [openInNewTab, setOpenInNewTab] = useState(true);
  const savedSelectionRef = useRef<Range | null>(null);
  const [selectedLinkInfo, setSelectedLinkInfo] = useState<{
    anchor: HTMLAnchorElement;
    url: string;
    text: string;
    top: number;
    left: number;
  } | null>(null);

  // Sync value from props to editor content when value changes externally
  useEffect(() => {
    if (!editorRef.current) return;
    const currentHtml = editorRef.current.innerHTML;
    const initialHtml = isHtml(value) ? decodeEntitiesIfPresent(value) : plainTextToHtml(value);

    // Only update if different to avoid cursor jumping
    if (currentHtml !== initialHtml && document.activeElement !== editorRef.current) {
      editorRef.current.innerHTML = initialHtml || "";
    }
  }, [value]);

  const handleInput = useCallback(() => {
    if (!editorRef.current) return;
    let html = editorRef.current.innerHTML;
    // Clean weird unicode artifacts
    html = html
      .replace(/\uFFFD/g, "")
      .replace(/[\u200B\u200C\u200D\u2060\uFEFF]/g, "");

    // If empty or only a br, pass empty string
    if (html === "<br>" || html === "<p><br></p>" || html.trim() === "") {
      onChange("");
    } else {
      onChange(html);
    }
  }, [onChange]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle smart paste: if user pastes a raw URL or text with HTML tags
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    const text = e.clipboardData.getData("text/plain");

    // If user pastes a URL directly, auto-convert it into a clickable link
    if (/^https?:\/\/[^\s]+$/i.test(text.trim())) {
      e.preventDefault();
      const url = text.trim();
      const linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer" title="Click to open link in new tab" class="text-primary hover:text-accent dark:text-emerald-400 dark:hover:text-amber-400 font-semibold underline underline-offset-4 decoration-primary/60 hover:decoration-accent hover:decoration-2 hover:underline-offset-2 break-all transition-all duration-200 cursor-pointer">${url}</a>&nbsp;`;
      if (document.queryCommandSupported("insertHTML")) {
        document.execCommand("insertHTML", false, linkHtml);
      } else {
        const temp = document.createElement("span");
        temp.innerHTML = linkHtml;
        editorRef.current?.appendChild(temp);
      }
      handleInput();
      return;
    }

    if (isHtml(text)) {
      e.preventDefault();
      const cleaned = text
        .replace(/\uFFFD/g, "")
        .replace(/[\u200B\u200C\u200D\u2060\uFEFF]/g, "");
      const decoded = decodeEntitiesIfPresent(cleaned);
      document.execCommand("insertHTML", false, decoded);
      handleInput();
    }
  }, [handleInput]);

  const execCmd = (cmd: string, val: string | undefined = undefined) => {
    if (isCodeMode) return;
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(cmd, false, val);
    handleInput();
  };

  const saveCurrentSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
        savedSelectionRef.current = range.cloneRange();
        const selectedStr = sel.toString();
        if (selectedStr) {
          setLinkText(selectedStr);
        }
        return;
      }
    }
    savedSelectionRef.current = null;
  };

  const unlinkAnchorElement = useCallback((anchor: HTMLAnchorElement) => {
    const parent = anchor.parentNode;
    if (!parent) return;

    // Move all child nodes out of anchor cleanly
    const frag = document.createDocumentFragment();
    while (anchor.firstChild) {
      frag.appendChild(anchor.firstChild);
    }
    parent.replaceChild(frag, anchor);

    setSelectedLinkInfo(null);
    handleInput();

    toast({
      title: "🔗❌ लिंक हटा दिया गया (Unlinked)",
      description: "लिंक को सफलतापूर्वक हटाकर सामान्य टेक्स्ट में बदल दिया गया है।",
      duration: 2500,
    });
  }, [handleInput]);

  const handleEditorDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest("a");
    if (anchor && editorRef.current?.contains(anchor)) {
      e.preventDefault();
      e.stopPropagation();
      unlinkAnchorElement(anchor as HTMLAnchorElement);
    }
  };

  const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest("a");
    if (anchor && editorRef.current?.contains(anchor)) {
      e.preventDefault();
      e.stopPropagation();

      const anchorRect = anchor.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (containerRect) {
        const top = Math.max(35, anchorRect.bottom - containerRect.top + 6);
        const left = Math.max(8, Math.min(anchorRect.left - containerRect.left, containerRect.width - 290));
        setSelectedLinkInfo({
          anchor: anchor as HTMLAnchorElement,
          url: anchor.getAttribute("href") || anchor.href,
          text: anchor.textContent || "",
          top,
          left,
        });
      }
      return;
    }

    // Dismiss floating link actions when clicking anywhere else
    if (selectedLinkInfo) {
      setSelectedLinkInfo(null);
    }
  };

  const handleEditExistingLink = (anchor: HTMLAnchorElement) => {
    editingAnchorRef.current = anchor;
    setLinkUrl(anchor.getAttribute("href") || anchor.href);
    setLinkText(anchor.textContent || "");
    setOpenInNewTab(anchor.getAttribute("target") === "_blank");
    setSelectedLinkInfo(null);
    setShowLinkModal(true);
  };

  const handleRemoveLink = () => {
    if (isCodeMode) return;
    if (selectedLinkInfo?.anchor) {
      unlinkAnchorElement(selectedLinkInfo.anchor);
      return;
    }
    // Inspect selection / cursor
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      let node: Node | null = sel.anchorNode;
      while (node && node !== editorRef.current) {
        if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).tagName === "A") {
          unlinkAnchorElement(node as HTMLAnchorElement);
          return;
        }
        node = node.parentNode;
      }
    }
    execCmd("unlink");
    setSelectedLinkInfo(null);
  };

  const handleOpenLinkModal = () => {
    editingAnchorRef.current = null;
    saveCurrentSelection();
    setLinkUrl("");
    setLinkText(savedSelectionRef.current?.toString() || "");
    setShowLinkModal(true);
  };

  const handleApplyLink = () => {
    if (!linkUrl.trim()) {
      setShowLinkModal(false);
      return;
    }

    let validUrl = linkUrl.trim();
    if (!/^https?:\/\//i.test(validUrl) && !/^mailto:/i.test(validUrl) && !/^tel:/i.test(validUrl)) {
      validUrl = "https://" + validUrl;
    }

    const displayText = linkText.trim() || validUrl;
    const targetAttr = openInNewTab ? ' target="_blank" rel="noopener noreferrer"' : "";

    // If editing an existing link
    if (editingAnchorRef.current && editorRef.current?.contains(editingAnchorRef.current)) {
      const anchor = editingAnchorRef.current;
      anchor.setAttribute("href", validUrl);
      anchor.textContent = displayText;
      if (openInNewTab) {
        anchor.setAttribute("target", "_blank");
        anchor.setAttribute("rel", "noopener noreferrer");
      } else {
        anchor.removeAttribute("target");
        anchor.removeAttribute("rel");
      }
      editingAnchorRef.current = null;
      handleInput();
      setShowLinkModal(false);
      setLinkUrl("");
      setLinkText("");
      toast({
        title: "लिंक अपडेट हो गया (Link Updated)",
        description: "लिंक की नई जानकारी सहेज ली गई है।",
        duration: 2500,
      });
      return;
    }

    const linkHtml = `<a href="${validUrl}"${targetAttr} title="Click to open link in new tab" class="text-primary hover:text-accent dark:text-emerald-400 dark:hover:text-amber-400 font-semibold underline underline-offset-4 decoration-primary/60 hover:decoration-accent hover:decoration-2 hover:underline-offset-2 break-all transition-all duration-200 cursor-pointer">${displayText}</a>&nbsp;`;

    // Code mode insertion
    if (isCodeMode && textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const before = value.substring(0, start);
      const after = value.substring(end);
      const updated = `${before}${linkHtml}${after}`;
      onChange(updated);
      setShowLinkModal(false);
      setLinkUrl("");
      setLinkText("");
      return;
    }

    // Visual mode insertion
    if (editorRef.current) {
      editorRef.current.focus();

      let inserted = false;
      const sel = window.getSelection();

      if (savedSelectionRef.current && sel) {
        try {
          sel.removeAllRanges();
          sel.addRange(savedSelectionRef.current);
          const range = savedSelectionRef.current;
          range.deleteContents();
          const temp = document.createElement("span");
          temp.innerHTML = linkHtml;
          const frag = document.createDocumentFragment();
          let child;
          while ((child = temp.firstChild)) {
            frag.appendChild(child);
          }
          range.insertNode(frag);
          inserted = true;
        } catch (e) {
          console.warn("DOM Range insert failed, trying execCommand:", e);
        }
      }

      if (!inserted && document.queryCommandSupported("insertHTML")) {
        try {
          inserted = document.execCommand("insertHTML", false, linkHtml);
        } catch (e) {
          console.warn("execCommand insertHTML failed:", e);
        }
      }

      // Fallback: append inside editor
      if (!inserted && editorRef.current) {
        const temp = document.createElement("span");
        temp.innerHTML = ` ${linkHtml} `;
        while (temp.firstChild) {
          editorRef.current.appendChild(temp.firstChild);
        }
      }

      handleInput();
    }

    setShowLinkModal(false);
    setLinkUrl("");
    setLinkText("");
    savedSelectionRef.current = null;
  };

  return (
    <div
      ref={containerRef}
      className={`rich-text-editor-container relative rounded-xl border border-input bg-card shadow-sm overflow-visible ${className}`}
    >
      {/* Editor Header / Label (optional) */}
      {label && (
        <div className="px-3.5 py-2 border-b border-border bg-muted/30 flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">{label}</span>
          <span className="text-[11px] text-muted-foreground">Rich Text & Link Editor</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-1.5 border-b border-border bg-muted/40 text-xs">
        {/* Bold */}
        <button
          type="button"
          onClick={() => execCmd("bold")}
          title="Bold (गाढ़ा)"
          className="p-1.5 rounded-lg hover:bg-secondary text-foreground hover:text-primary transition-colors"
        >
          <Bold className="w-4 h-4" />
        </button>

        {/* Italic */}
        <button
          type="button"
          onClick={() => execCmd("italic")}
          title="Italic (तिरछा)"
          className="p-1.5 rounded-lg hover:bg-secondary text-foreground hover:text-primary transition-colors"
        >
          <Italic className="w-4 h-4" />
        </button>

        {/* Underline */}
        <button
          type="button"
          onClick={() => execCmd("underline")}
          title="Underline (रेखांकित)"
          className="p-1.5 rounded-lg hover:bg-secondary text-foreground hover:text-primary transition-colors"
        >
          <Underline className="w-4 h-4" />
        </button>

        <span className="w-px h-4 bg-border mx-0.5" />

        {/* Heading 2 */}
        <button
          type="button"
          onClick={() => execCmd("formatBlock", "h2")}
          title="Heading 2 (मुख्य शीर्षक)"
          className="p-1.5 rounded-lg hover:bg-secondary text-foreground hover:text-primary transition-colors"
        >
          <Heading2 className="w-4 h-4" />
        </button>

        {/* Heading 3 */}
        <button
          type="button"
          onClick={() => execCmd("formatBlock", "h3")}
          title="Heading 3 (उप-शीर्षक)"
          className="p-1.5 rounded-lg hover:bg-secondary text-foreground hover:text-primary transition-colors"
        >
          <Heading3 className="w-4 h-4" />
        </button>

        {/* Paragraph / Normal */}
        <button
          type="button"
          onClick={() => execCmd("formatBlock", "p")}
          title="Normal Text (सामान्य पैराग्राफ)"
          className="px-2 py-1 rounded-lg hover:bg-secondary text-foreground text-[11px] font-medium transition-colors"
        >
          ¶ Text
        </button>

        <span className="w-px h-4 bg-border mx-0.5" />

        {/* Bullet List */}
        <button
          type="button"
          onClick={() => execCmd("insertUnorderedList")}
          title="Bullet List (बिंदु सूची)"
          className="p-1.5 rounded-lg hover:bg-secondary text-foreground hover:text-primary transition-colors"
        >
          <List className="w-4 h-4" />
        </button>

        {/* Ordered List */}
        <button
          type="button"
          onClick={() => execCmd("insertOrderedList")}
          title="Numbered List (क्रमांक सूची)"
          className="p-1.5 rounded-lg hover:bg-secondary text-foreground hover:text-primary transition-colors"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <span className="w-px h-4 bg-border mx-0.5" />

        {/* Link Button */}
        <button
          type="button"
          onClick={handleOpenLinkModal}
          title="Add Link (लिंक जोड़ें)"
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold transition-colors"
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>Link</span>
        </button>

        {/* Remove Link */}
        <button
          type="button"
          onClick={handleRemoveLink}
          title="Remove Link (लिंक हटाएँ)"
          className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-destructive transition-colors"
        >
          <Unlink className="w-4 h-4" />
        </button>

        {/* Clear Format */}
        <button
          type="button"
          onClick={() => execCmd("removeFormat")}
          title="Clear Formatting (फॉर्मेटिंग साफ़ करें)"
          className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
        >
          <RemoveFormatting className="w-4 h-4" />
        </button>

        {/* Switch Visual / Code */}
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsCodeMode(!isCodeMode)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              isCodeMode
                ? "bg-accent text-accent-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
            title={isCodeMode ? "Switch to Visual Editor" : "Switch to Raw HTML / Source"}
          >
            {isCodeMode ? (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Visual Editor</span>
              </>
            ) : (
              <>
                <Code className="w-3.5 h-3.5" />
                <span>HTML / Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      {isCodeMode ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter raw text or HTML here..."
          style={{ minHeight }}
          className="w-full p-4 bg-background text-foreground font-mono text-xs focus:outline-none resize-y leading-relaxed border-0"
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onBlur={handleInput}
          onPaste={handlePaste}
          onClick={handleEditorClick}
          onDoubleClick={handleEditorDoubleClick}
          data-placeholder={placeholder}
          style={{ minHeight }}
          className="rich-text-content w-full p-4 bg-background text-foreground text-sm focus:outline-none resize-y overflow-y-auto leading-relaxed prose prose-sm dark:prose-invert max-w-none empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/60 empty:before:pointer-events-none"
        />
      )}

      {/* Floating Link Action Bar (appears when clicking on a link in editor) */}
      {selectedLinkInfo && (
        <div
          style={{ top: `${selectedLinkInfo.top}px`, left: `${selectedLinkInfo.left}px` }}
          className="absolute z-30 bg-popover text-popover-foreground border border-border shadow-xl rounded-xl p-2 flex flex-col gap-1.5 animate-in fade-in zoom-in-95 duration-150 max-w-[320px] ring-1 ring-black/10 select-none"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1.5 text-xs">
            <span
              className="font-medium truncate max-w-[120px] text-muted-foreground flex items-center gap-1"
              title={selectedLinkInfo.url}
            >
              <LinkIcon className="w-3 h-3 text-primary shrink-0" />
              <span className="truncate">{selectedLinkInfo.url}</span>
            </span>
            <a
              href={selectedLinkInfo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary flex items-center gap-1 text-[11px] font-semibold transition-colors"
              title="नये टैब में खोलें (Open link)"
            >
              <ExternalLink className="w-3 h-3" />
              <span>खोलें</span>
            </a>
            <button
              type="button"
              onClick={() => handleEditExistingLink(selectedLinkInfo.anchor)}
              className="p-1.5 rounded-lg hover:bg-secondary text-foreground hover:text-primary flex items-center gap-0.5 text-[11px] font-medium transition-colors"
              title="लिंक बदलें (Edit link)"
            >
              <Pencil className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => unlinkAnchorElement(selectedLinkInfo.anchor)}
              className="px-2 py-1 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive flex items-center gap-1 text-[11px] font-semibold transition-colors"
              title="लिंक हटाएँ (Unlink)"
            >
              <Unlink className="w-3 h-3" />
              <span>हटाएँ</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedLinkInfo(null)}
              className="p-1 rounded-lg hover:bg-secondary text-muted-foreground ml-auto"
              title="Close"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="text-[10px] text-muted-foreground/80 border-t border-border/50 pt-1 flex items-center justify-between">
            <span>💡 लिंक पर <b>2 बार क्लिक (Double Click)</b> करके भी हटा सकते हैं</span>
          </div>
        </div>
      )}

      {/* Link Dialog Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-primary" />
                लिंक जोड़ें (Insert Link)
              </h4>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="p-1 rounded-lg hover:bg-secondary text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-foreground block mb-1">
                  वेबसाइट / लिंक URL *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://csbc.bihar.gov.in या https://example.com"
                    autoFocus
                    className="w-full px-3 py-2 rounded-xl bg-background border border-input text-foreground text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">
                  दिखने वाला नाम (Link Text / Display Text)
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="उदा. यहाँ क्लिक करें / CSBC Official Website"
                  className="w-full px-3 py-2 rounded-xl bg-background border border-input text-foreground text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="newTabCheck"
                  checked={openInNewTab}
                  onChange={(e) => setOpenInNewTab(e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary"
                />
                <label htmlFor="newTabCheck" className="text-xs text-foreground cursor-pointer font-medium">
                  नये टैब में खोलें (Open link in new tab)
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground"
              >
                रद्द करें (Cancel)
              </button>
              <button
                type="button"
                onClick={handleApplyLink}
                disabled={!linkUrl.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                लिंक लागू करें (Insert)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
