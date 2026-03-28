import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { uploadVideoFile, deleteFile } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toEmbedUrl } from "@/lib/video-embed";
import { PAGE_VIDEO_OPTIONS } from "@/lib/page-video-routes";
import { Tables } from "@/integrations/supabase/types";

type VideoRow = Tables<"videos">;
type Placement = VideoRow["placement"];
type FilterKey = "all" | Placement;

interface BlogOption {
  id: string;
  title: string;
}

function rowPlacementSummary(v: VideoRow): string {
  switch (v.placement) {
    case "home":
      return "Home page";
    case "global":
      return "All pages";
    case "page":
      return `Page: ${v.page_key ?? "?"}`;
    case "site":
      return "Website /videos";
    case "ramnavami":
      return "Ram Navami";
    case "blog":
      return "Blog";
    default:
      return v.placement;
  }
}

export default function ManageVideos() {
  const { isAdmin } = useAuth();
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [blogs, setBlogs] = useState<BlogOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<VideoRow | null>(null);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [form, setForm] = useState({
    title: "",
    description: "",
    embedUrlRaw: "",
    videoFile: null as File | null,
    placement: "site" as Placement,
    pageKey: "",
    blogId: "",
    sortOrder: 0,
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data: v } = await supabase.from("videos").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: false });
    setVideos((v as VideoRow[]) ?? []);
    const { data: b } = await supabase.from("blogs").select("id,title").order("created_at", { ascending: false });
    setBlogs((b as BlogOption[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      embedUrlRaw: "",
      videoFile: null,
      placement: "site",
      pageKey: "",
      blogId: "",
      sortOrder: 0,
    });
    setEditing(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (form.placement === "blog" && !form.blogId) {
      toast({ title: "Select a blog post", variant: "destructive" });
      return;
    }
    if (form.placement === "page" && !form.pageKey.trim()) {
      toast({ title: "Select which page", variant: "destructive" });
      return;
    }
    const title = form.title.trim() || "Video";
    setSaving(true);

    let embedOut: string | null = null;
    let fileOut: string | null = null;

    try {
      if (form.videoFile) {
        const uploaded = await uploadVideoFile(form.videoFile, "videos");
        if (!uploaded) {
          toast({ title: "Upload failed", variant: "destructive" });
          setSaving(false);
          return;
        }
        if (editing?.file_url) await deleteFile(editing.file_url);
        fileOut = uploaded;
        embedOut = null;
      } else {
        const parsed = toEmbedUrl(form.embedUrlRaw);
        if (parsed) {
          embedOut = parsed;
          fileOut = null;
          if (editing?.file_url) await deleteFile(editing.file_url);
        } else if (editing) {
          embedOut = editing.embed_url ?? null;
          fileOut = editing.file_url ?? null;
        }
      }

      if (!embedOut && !fileOut) {
        toast({
          title: "Video required",
          description: "Upload an MP4 / WebM / MOV file, or paste a YouTube or Vimeo link.",
          variant: "destructive",
        });
        setSaving(false);
        return;
      }

      const payload = {
        title,
        description: form.description.trim() || null,
        embed_url: embedOut,
        file_url: fileOut,
        placement: form.placement,
        page_key: form.placement === "page" ? form.pageKey.trim() : null,
        blog_id: form.placement === "blog" ? form.blogId : null,
        sort_order: form.sortOrder,
      };

      if (editing) {
        const { error } = await supabase.from("videos").update(payload).eq("id", editing.id);
        if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
        else toast({ title: "Video updated" });
      } else {
        const { error } = await supabase.from("videos").insert(payload);
        if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
        else toast({ title: "Video added" });
      }
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Something went wrong",
        variant: "destructive",
      });
    }

    setSaving(false);
    resetForm();
    load();
  };

  const handleDelete = async (v: VideoRow) => {
    if (!confirm("Delete this video?")) return;
    if (v.file_url) await deleteFile(v.file_url);
    const { error } = await supabase.from("videos").delete().eq("id", v.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Deleted" });
      load();
    }
  };

  const startEdit = (v: VideoRow) => {
    setEditing(v);
    setForm({
      title: v.title,
      description: v.description ?? "",
      embedUrlRaw: v.embed_url ?? "",
      videoFile: null,
      placement: v.placement,
      pageKey: v.page_key ?? "",
      blogId: v.blog_id ?? "",
      sortOrder: v.sort_order,
    });
    setShowForm(true);
  };

  const filtered = videos.filter((v) => (filter === "all" ? true : v.placement === filter));

  const filterButtons: { key: FilterKey; label: string }[] = [
    { key: "all", label: "All" },
    { key: "home", label: "Home" },
    { key: "global", label: "All pages" },
    { key: "page", label: "By page" },
    { key: "site", label: "/videos" },
    { key: "ramnavami", label: "Ram Navami" },
    { key: "blog", label: "Blog" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="font-display text-xl font-bold text-foreground">Videos</h2>
        <div className="flex flex-wrap items-center gap-2">
          {filterButtons.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f.key ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {f.label}
            </button>
          ))}
          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setForm({
                  title: "",
                  description: "",
                  embedUrlRaw: "",
                  videoFile: null,
                  placement: "site",
                  pageKey: "",
                  blogId: "",
                  sortOrder: 0,
                });
                setShowForm(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> Add video
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="mb-6 mt-6 space-y-4 rounded-xl bg-card p-6 ring-1 ring-border">
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Title"
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground"
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Description (optional)"
            rows={2}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground"
          />
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Video file</label>
            <p className="text-xs text-muted-foreground">MP4, WebM, or MOV — up to 100 MB.</p>
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
              onChange={(e) =>
                setForm({
                  ...form,
                  videoFile: e.target.files?.[0] ?? null,
                  embedUrlRaw: e.target.files?.[0] ? "" : form.embedUrlRaw,
                })
              }
              className="text-sm"
            />
            {form.videoFile && (
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs text-muted-foreground">Selected: {form.videoFile.name}</p>
                <button
                  type="button"
                  className="text-xs font-medium text-primary hover:underline"
                  onClick={() =>
                    setForm({
                      ...form,
                      videoFile: null,
                      embedUrlRaw: editing?.embed_url ?? form.embedUrlRaw,
                    })
                  }
                >
                  Remove file
                </button>
              </div>
            )}
            {editing?.file_url && !form.videoFile && <p className="text-xs text-muted-foreground">Current: uploaded file</p>}
          </div>
          <div className="relative py-2 text-center text-xs text-muted-foreground before:absolute before:inset-x-0 before:top-1/2 before:border-t before:border-border">
            <span className="relative bg-card px-2">or YouTube / Vimeo URL</span>
          </div>
          <input
            value={form.embedUrlRaw}
            onChange={(e) =>
              setForm({
                ...form,
                embedUrlRaw: e.target.value,
                videoFile: e.target.value.trim() ? null : form.videoFile,
              })
            }
            disabled={Boolean(form.videoFile)}
            placeholder="https://www.youtube.com/watch?v=…"
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground disabled:opacity-50"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Where it appears</label>
              <select
                value={form.placement}
                onChange={(e) => {
                  const p = e.target.value as Placement;
                  setForm({
                    ...form,
                    placement: p,
                    blogId: p === "blog" ? form.blogId : "",
                    pageKey: p === "page" ? form.pageKey : "",
                  });
                }}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground"
              >
                <option value="home">Home page only</option>
                <option value="global">All pages (footer block)</option>
                <option value="page">One public page (choose below)</option>
                <option value="site">Videos library (/videos)</option>
                <option value="ramnavami">Ram Navami page (extra block)</option>
                <option value="blog">Single blog / festival post</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Sort order</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) || 0 })}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground"
              />
            </div>
          </div>
          {form.placement === "page" && (
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Page</label>
              <select
                value={form.pageKey}
                onChange={(e) => setForm({ ...form, pageKey: e.target.value })}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground"
              >
                <option value="">Select page…</option>
                {PAGE_VIDEO_OPTIONS.map((o) => (
                  <option key={o.key} value={o.key}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          {form.placement === "blog" && (
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Blog post</label>
              <select
                value={form.blogId}
                onChange={(e) => setForm({ ...form, blogId: e.target.value })}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground"
              >
                <option value="">Select post…</option>
                {blogs.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving…" : editing ? "Update" : "Add"}
            </button>
            <button type="button" onClick={resetForm} className="rounded-xl border border-input px-6 py-2 text-sm hover:bg-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {filtered.map((v) => (
          <div key={v.id} className="flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-border sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-foreground">{v.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {v.file_url ? `File: …${v.file_url.slice(-40)}` : v.embed_url ?? "—"}
              </p>
              <p className="mt-1 text-xs uppercase tracking-wide text-accent">
                {rowPlacementSummary(v)} · {v.file_url ? "File" : "Embed"}
              </p>
            </div>
            {isAdmin && (
              <div className="flex gap-1">
                <button type="button" onClick={() => startEdit(v)} className="rounded-lg p-2 hover:bg-secondary">
                  <Pencil className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => handleDelete(v)} className="rounded-lg p-2 text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      {filtered.length === 0 && <p className="py-8 text-center text-muted-foreground">No videos in this filter.</p>}
    </div>
  );
}
