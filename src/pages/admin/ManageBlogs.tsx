import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus, Calendar, Tag, Image as ImageIcon } from "lucide-react";
import { parseVideoUrlLines } from "@/lib/video-embed";

interface Blog {
  id: string;
  title: string;
  content: string | null;
  image: string | null;
  gallery_images: string[] | null;
  category: string | null;
  tags: string[] | null;
  highlights: string[] | null;
  location: string | null;
  festival_date: string | null;
  created_at: string;
}

const categories = ["Diwali", "Chhath Puja", "Holi", "Kali Puja", "Ramnavami", "General"];
const tagOptions = ["Tradition", "Community", "Music", "Food", "Temple", "Culture", "Parade", "Youth"];

async function replaceBlogVideosFromForm(blogId: string, urlsText: string) {
  const urls = parseVideoUrlLines(urlsText);
  await supabase.from("videos").delete().eq("blog_id", blogId);
  if (urls.length === 0) return;
  const { error } = await supabase.from("videos").insert(
    urls.map((embed_url, i) => ({
      title: `Video ${i + 1}`,
      embed_url,
      file_url: null,
      page_key: null,
      placement: "blog" as const,
      blog_id: blogId,
      sort_order: i,
    }))
  );
  if (error) throw error;
}

function getPostYear(post: Blog): string {
  if (post.festival_date) {
    const yearMatch = post.festival_date.match(/\b(20\d{2})\b/);
    if (yearMatch) return yearMatch[1];
  }
  return new Date(post.created_at).getFullYear().toString();
}

export default function ManageBlogs() {
  const { isAdmin, isEditor, user } = useAuth();
  const canManageContent = isAdmin || isEditor;

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Blog | null>(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "Diwali",
    imageFile: null as File | null,
    galleryImageFiles: [] as File[],
    tags: [] as string[],
    customTags: "",
    highlightsText: "",
    location: "",
    festivalDate: "",
    videoUrlsText: "",
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("blogs").select("*").order("created_at", { ascending: false });
    setBlogs((data as Blog[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm({
      title: "",
      content: "",
      category: "Diwali",
      imageFile: null,
      galleryImageFiles: [],
      tags: [],
      customTags: "",
      highlightsText: "",
      location: "",
      festivalDate: "",
      videoUrlsText: "",
    });
    setEditing(null);
    setShowForm(false);
  };

  const normalizeTags = (selected: string[], customTagInput: string) => {
    const custom = customTagInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    return Array.from(new Set([...selected, ...custom]));
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    setSaving(true);

    let imageUrl = editing?.image ?? null;
    let galleryImages = editing?.gallery_images ?? [];
    if (form.imageFile) {
      const url = await uploadFile(form.imageFile, "blogs");
      if (url) imageUrl = url;
    }
    if (form.galleryImageFiles.length > 0) {
      const uploaded = await Promise.all(form.galleryImageFiles.map((file) => uploadFile(file, "blogs")));
      galleryImages = uploaded.filter((url): url is string => Boolean(url));
    }

    const tags = normalizeTags(form.tags, form.customTags);
    const highlights = form.highlightsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const rawVideoLines = form.videoUrlsText
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    const parsedVideos = parseVideoUrlLines(form.videoUrlsText);
    if (rawVideoLines.length > 0 && parsedVideos.length === 0) {
      toast({
        title: "Invalid video URLs",
        description: "Use one YouTube or Vimeo link per line, or leave blank.",
        variant: "destructive",
      });
      setSaving(false);
      return;
    }

    if (editing) {
      const { error } = await supabase
        .from("blogs")
        .update({
          title: form.title,
          content: form.content,
          category: form.category,
          image: imageUrl,
          gallery_images: galleryImages,
          tags,
          highlights,
          location: form.location || null,
          festival_date: form.festivalDate || null,
        })
        .eq("id", editing.id);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        try {
          await replaceBlogVideosFromForm(editing.id, form.videoUrlsText);
          toast({ title: "Blog updated successfully!" });
        } catch (e) {
          toast({
            title: "Blog saved; video sync failed",
            description: e instanceof Error ? e.message : "Try again or use Videos in admin.",
            variant: "destructive",
          });
        }
      }
    } else {
      const validUserId =
        user?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id)
          ? user.id
          : null;

      const { data: inserted, error } = await supabase
        .from("blogs")
        .insert({
          title: form.title,
          content: form.content,
          category: form.category,
          image: imageUrl,
          gallery_images: galleryImages,
          tags,
          highlights,
          location: form.location || null,
          festival_date: form.festivalDate || null,
          created_by: validUserId,
        })
        .select("id")
        .single();
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else if (inserted?.id) {
        try {
          await replaceBlogVideosFromForm(inserted.id, form.videoUrlsText);
          toast({ title: "New Blog added successfully!" });
        } catch (e) {
          toast({
            title: "Blog added; video sync failed",
            description: e instanceof Error ? e.message : undefined,
            variant: "destructive",
          });
        }
      }
    }
    setSaving(false);
    resetForm();
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this blog post?")) return;
    const { error } = await supabase.from("blogs").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Blog deleted successfully!" });
      load();
    }
  };

  const startEdit = async (b: Blog) => {
    const { data: vids } = await supabase
      .from("videos")
      .select("embed_url")
      .eq("blog_id", b.id)
      .eq("placement", "blog")
      .order("sort_order", { ascending: true });
    setEditing(b);
    setForm({
      title: b.title,
      content: b.content ?? "",
      category: b.category ?? "Diwali",
      imageFile: null,
      galleryImageFiles: [],
      tags: b.tags ?? [],
      customTags: "",
      highlightsText: (b.highlights ?? []).join("\n"),
      location: b.location ?? "",
      festivalDate: b.festival_date ?? "",
      videoUrlsText: (vids ?? []).map((v) => v.embed_url).filter(Boolean).join("\n"),
    });
    setShowForm(true);
  };

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Blog Posts & Festivals</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage festival posts, celebrations, and year archives (Newest shows first)
          </p>
        </div>
        {canManageContent && (
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Blog / Festival Post
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-card rounded-2xl p-6 ring-1 ring-border mb-8 shadow-sm space-y-5">
          <div className="border-b border-border pb-3">
            <h3 className="font-semibold text-foreground text-base">
              {editing ? "Edit Festival Post" : "Add New Festival Post (2026 / 2025)"}
            </h3>
            <p className="text-xs text-muted-foreground">
              Fill in the festival details. Newly added posts will show first on the home page.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Post Title (शीर्षक) *
              </label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. नोहर गाँव की दीपावली 2026 (Diwali 2026)"
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-input text-foreground text-sm focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Content & Story (विवरण)
              </label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Write detailed festival description, memories, rituals..."
                rows={5}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-input text-foreground text-sm focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Category (त्यौहार की श्रेणी)
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-background border border-input text-foreground text-sm"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Festival Date / Year (तिथि / वर्ष)
                </label>
                <input
                  value={form.festivalDate}
                  onChange={(e) => setForm({ ...form, festivalDate: e.target.value })}
                  placeholder="e.g. 2026-11-01 or Diwali 2026"
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-input text-foreground text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Location (स्थान - optional)
                </label>
                <input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Nohar Village Mandir"
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-input text-foreground text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground block">
                Tags (चुनें या नया जोड़ें)
              </label>
              <div className="flex flex-wrap gap-2">
                {tagOptions.map((tag) => {
                  const checked = form.tags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          tags: checked ? form.tags.filter((t) => t !== tag) : [...form.tags, tag],
                        })
                      }
                      className={`px-3 py-1 rounded-full text-xs font-medium ring-1 transition-colors ${
                        checked
                          ? "bg-primary text-primary-foreground ring-primary"
                          : "bg-background text-muted-foreground ring-border hover:bg-secondary"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
              <input
                value={form.customTags}
                onChange={(e) => setForm({ ...form, customTags: e.target.value })}
                placeholder="Custom tags (comma separated, e.g. 2026, Grand Celebration)"
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-input text-foreground text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Highlights (प्रमुख बिंदु - एक पंक्ति प्रति बिंदु)
              </label>
              <textarea
                value={form.highlightsText}
                onChange={(e) => setForm({ ...form, highlightsText: e.target.value })}
                placeholder="Highlight 1&#10;Highlight 2"
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-input text-foreground text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Video URLs (YouTube / Vimeo - optional)
              </label>
              <textarea
                value={form.videoUrlsText}
                onChange={(e) => setForm({ ...form, videoUrlsText: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
                rows={2}
                className="w-full px-4 py-2 rounded-xl bg-background border border-input text-foreground text-xs font-mono"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Main Cover Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setForm({ ...form, imageFile: e.target.files?.[0] ?? null })}
                  className="text-xs w-full"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Additional Gallery Images
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) =>
                    setForm({ ...form, galleryImageFiles: Array.from(e.target.files ?? []) })
                  }
                  className="text-xs w-full"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-3 border-t border-border">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 shadow-sm"
            >
              {saving ? "Saving Post..." : editing ? "Update Post" : "Publish Post (पोस्ट जोड़ें)"}
            </button>
            <button
              onClick={resetForm}
              className="px-6 py-2.5 rounded-xl text-sm font-medium border border-input hover:bg-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Blog list */}
      <div className="space-y-4">
        {blogs.map((b) => {
          const year = getPostYear(b);
          return (
            <div
              key={b.id}
              className="bg-card rounded-2xl p-4 ring-1 ring-border flex flex-col sm:flex-row gap-4 shadow-sm hover:shadow-md transition-shadow"
            >
              {b.image && (
                <img
                  src={b.image}
                  alt={b.title}
                  className="w-full sm:w-28 h-28 object-cover rounded-xl flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary uppercase">
                    {b.category || "General"}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-accent/20 text-accent flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {year}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(b.created_at).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                <h3 className="font-semibold text-foreground text-base">{b.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{b.content}</p>

                {b.tags && b.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {b.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {canManageContent && (
                <div className="flex sm:flex-col justify-end gap-1 flex-shrink-0">
                  <button
                    onClick={() => startEdit(b)}
                    className="p-2.5 rounded-xl hover:bg-secondary text-foreground"
                    title="Edit post"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="p-2.5 rounded-xl hover:bg-destructive/10 text-destructive"
                      title="Delete post"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {blogs.length === 0 && (
        <div className="text-center py-12 bg-card rounded-2xl border border-dashed border-border">
          <p className="text-muted-foreground text-sm">No festival or blog posts added yet.</p>
        </div>
      )}
    </div>
  );
}
