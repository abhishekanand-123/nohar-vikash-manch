import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { uploadPdfFile } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { BookOpen, Upload, FileText, ExternalLink, Trash2, CheckCircle2, AlertCircle, Save, Globe } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type PageBanner = Tables<"page_banners">;

export default function ManageDocuments() {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [docBanner, setDocBanner] = useState<PageBanner | null>(null);

  // Form states
  const [title, setTitle] = useState("स्तोत्र रत्नावली");
  const [pdfUrl, setPdfUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [urlMode, setUrlMode] = useState<"file" | "url">("file");

  const loadDoc = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("page_banners")
        .select("*")
        .eq("page_key", "stotra_ratnavali")
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error loading document:", error);
      }

      if (data) {
        setDocBanner(data as PageBanner);
        setTitle(data.title || "स्तोत्र रत्नावली");
        setPdfUrl(data.bg_image || "");
        setIsActive(data.is_active ?? true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoc();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isAdmin) {
      toast.error("You need admin privileges to save changes.");
      return;
    }

    setSaving(true);
    let finalUrl = pdfUrl;

    try {
      if (selectedFile) {
        toast.info("Uploading PDF file, please wait...");
        const uploaded = await uploadPdfFile(selectedFile, "documents");
        if (uploaded) {
          finalUrl = uploaded;
          setPdfUrl(uploaded);
        } else {
          toast.error("Failed to upload PDF file to storage.");
          setSaving(false);
          return;
        }
      }

      const payload = {
        page_key: "stotra_ratnavali",
        title: title.trim() || "स्तोत्र रत्नावली",
        bg_image: finalUrl.trim() || null,
        subtitle: "Stotra Ratnavali PDF Document",
        is_active: isActive,
        updated_at: new Date().toISOString(),
      };

      if (docBanner?.id) {
        const { error } = await supabase
          .from("page_banners")
          .update(payload)
          .eq("id", docBanner.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("page_banners")
          .insert(payload);

        if (error) throw error;
      }

      toast.success("स्तोत्र रत्नावली PDF settings saved successfully!");
      setSelectedFile(null);
      await loadDoc();
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error(err.message || "An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemovePdf = async () => {
    if (!confirm("Are you sure you want to remove the current PDF? The button will revert to '#' until a new PDF is added.")) return;
    setSaving(true);
    try {
      if (docBanner?.id) {
        await supabase
          .from("page_banners")
          .update({ bg_image: null, updated_at: new Date().toISOString() })
          .eq("id", docBanner.id);
      }
      setPdfUrl("");
      setSelectedFile(null);
      toast.success("PDF removed successfully.");
      await loadDoc();
    } catch (err: any) {
      toast.error(err.message || "Failed to remove PDF.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
          <BookOpen className="w-7 h-7 text-primary" />
          Manage Documents & PDFs
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload and manage religious texts, stotra booklets, and community PDF documents displayed across the website.
        </p>
      </div>

      {/* Stotra Ratnavali Card */}
      <div className="bg-card rounded-2xl p-6 sm:p-8 shadow-card ring-1 ring-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-foreground">स्तोत्र रत्नावली (Stotra Ratnavali)</h2>
                {pdfUrl ? (
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" /> PDF Live
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20">
                    <AlertCircle className="w-3.5 h-3.5" /> No PDF (Defaults to #)
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                This document is linked to the 3rd button in the Homepage Hero section.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary h-4 w-4"
              />
              Active on Site
            </label>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6 pt-6">
          {/* Button Display Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Button Display Text (बटन का नाम)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="स्तोत्र रत्नावली"
              className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {/* Current Active PDF Status / Preview */}
          {pdfUrl && (
            <div className="p-4 rounded-xl bg-secondary/50 border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 overflow-hidden">
                <FileText className="w-5 h-5 text-primary shrink-0" />
                <div className="truncate">
                  <p className="text-xs font-semibold text-foreground truncate">Current PDF Document</p>
                  <p className="text-xs text-muted-foreground font-mono truncate max-w-md">{pdfUrl}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium rounded-lg transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open PDF</span>
                </a>
                <button
                  type="button"
                  onClick={handleRemovePdf}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs font-medium rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          )}

          {/* Upload Method Tabs */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-border pb-2">
              <button
                type="button"
                onClick={() => setUrlMode("file")}
                className={`flex items-center gap-2 text-xs font-medium pb-2 -mb-2 border-b-2 transition-colors ${
                  urlMode === "file"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Upload className="w-3.5 h-3.5" /> Upload File (.pdf)
              </button>
              <button
                type="button"
                onClick={() => setUrlMode("url")}
                className={`flex items-center gap-2 text-xs font-medium pb-2 -mb-2 border-b-2 transition-colors ${
                  urlMode === "url"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Globe className="w-3.5 h-3.5" /> External PDF URL / Google Drive
              </button>
            </div>

            {urlMode === "file" ? (
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors bg-secondary/20">
                <input
                  type="file"
                  id="pdf-upload"
                  accept="application/pdf,.pdf"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label
                  htmlFor="pdf-upload"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    {selectedFile ? (
                      <p className="text-sm font-semibold text-primary">{selectedFile.name}</p>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-foreground">
                          Click to select a PDF file (Max: 25MB)
                        </p>
                        <p className="text-xs text-muted-foreground">Supports .pdf documents</p>
                      </>
                    )}
                  </div>
                </label>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Direct PDF URL or Google Drive Public Link
                </label>
                <input
                  type="url"
                  value={pdfUrl}
                  onChange={(e) => setPdfUrl(e.target.value)}
                  placeholder="https://example.com/stotra-ratnavali.pdf"
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving Changes..." : "Save PDF Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
