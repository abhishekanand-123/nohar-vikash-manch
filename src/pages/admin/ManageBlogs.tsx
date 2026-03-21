import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus } from "lucide-react";

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

const categories = ["Diwali", "Holi", "Ramnavami", "Kali Puja", "Chhath Puja", "General"];
const tagOptions = ["Tradition", "Community", "Music", "Food", "Temple", "Culture", "Parade", "Youth"];

export default function ManageBlogs() {
  const { isAdmin, user } = useAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Blog | null>(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "General",
    imageFile: null as File | null,
    galleryImageFiles: [] as File[],
    tags: [] as string[],
    customTags: "",
    highlightsText: "",
    location: "",
    festivalDate: "",
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("blogs").select("*").order("created_at", { ascending: false });
    setBlogs((data as Blog[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({
      title: "",
      content: "",
      category: "General",
      imageFile: null,
      galleryImageFiles: [],
      tags: [],
      customTags: "",
      highlightsText: "",
      location: "",
      festivalDate: "",
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
    if (!form.title.trim()) { toast({ title: "Title is required", variant: "destructive" }); return; }
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
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Blog updated!" });
    } else {
      const { error } = await supabase.from("blogs").insert({
        title: form.title,
        content: form.content,
        category: form.category,
        image: imageUrl,
        gallery_images: galleryImages,
        tags,
        highlights,
        location: form.location || null,
        festival_date: form.festivalDate || null,
        created_by: user?.id,
      });
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Blog added!" });
    }
    setSaving(false);
    resetForm();
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this blog?")) return;
    const { error } = await supabase.from("blogs").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Blog deleted" }); load(); }
  };

  const startEdit = (b: Blog) => {
    setEditing(b);
    setForm({
      title: b.title,
      content: b.content ?? "",
      category: b.category ?? "General",
      imageFile: null,
      galleryImageFiles: [],
      tags: b.tags ?? [],
      customTags: "",
      highlightsText: (b.highlights ?? []).join("\n"),
      location: b.location ?? "",
      festivalDate: b.festival_date ?? "",
    });
    setShowForm(true);
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-bold text-foreground">Blog Posts</h2>
        {isAdmin && (
          <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90">
            <Plus className="w-4 h-4" /> Add Blog
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-card rounded-xl p-6 ring-1 ring-border mb-6 space-y-4">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className="w-full px-4 py-3 rounded-xl bg-background border border-input text-foreground text-sm" />
          <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Content" rows={5} className="w-full px-4 py-3 rounded-xl bg-background border border-input text-foreground text-sm" />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-background border border-input text-foreground text-sm">
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Festival location (optional)" className="w-full px-4 py-3 rounded-xl bg-background border border-input text-foreground text-sm" />
          <input value={form.festivalDate} onChange={(e) => setForm({ ...form, festivalDate: e.target.value })} placeholder="Festival date / range (optional)" className="w-full px-4 py-3 rounded-xl bg-background border border-input text-foreground text-sm" />

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Tags (multi-select)</p>
            <div className="flex flex-wrap gap-2">
              {tagOptions.map((tag) => {
                const checked = form.tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setForm({
                      ...form,
                      tags: checked ? form.tags.filter((t) => t !== tag) : [...form.tags, tag],
                    })}
                    className={`px-3 py-1 rounded-full text-xs ring-1 transition-colors ${
                      checked ? "bg-primary text-primary-foreground ring-primary" : "bg-background text-muted-foreground ring-border hover:bg-secondary"
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
              placeholder="Add custom tags (comma separated)"
              className="w-full px-4 py-3 rounded-xl bg-background border border-input text-foreground text-sm"
            />
          </div>

          <textarea
            value={form.highlightsText}
            onChange={(e) => setForm({ ...form, highlightsText: e.target.value })}
            placeholder="Highlights (one point per line)"
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-background border border-input text-foreground text-sm"
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Cover image</label>
            <input type="file" accept="image/*" onChange={(e) => setForm({ ...form, imageFile: e.target.files?.[0] ?? null })} className="text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Gallery images (multi-select)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setForm({ ...form, galleryImageFiles: Array.from(e.target.files ?? []) })}
              className="text-sm"
            />
            {editing && (editing.gallery_images?.length ?? 0) > 0 && form.galleryImageFiles.length === 0 && (
              <p className="text-xs text-muted-foreground">Using {editing.gallery_images?.length} existing gallery image(s). Select files to replace them.</p>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground px-6 py-2 rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50">
              {saving ? "Saving..." : editing ? "Update" : "Add"}
            </button>
            <button onClick={resetForm} className="px-6 py-2 rounded-xl text-sm border border-input hover:bg-secondary">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {blogs.map((b) => (
          <div key={b.id} className="bg-card rounded-xl p-4 ring-1 ring-border flex gap-4">
            {b.image && <img src={b.image} alt={b.title} className="w-24 h-24 object-cover rounded-lg flex-shrink-0" />}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">{b.title}</h3>
              <p className="text-xs text-muted-foreground">{b.category} • {new Date(b.created_at).toLocaleDateString()}</p>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{b.content}</p>
              {b.tags && b.tags.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">Tags: {b.tags.join(", ")}</p>
              )}
            </div>
            {isAdmin && (
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => startEdit(b)} className="p-2 rounded-lg hover:bg-secondary"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(b.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="w-4 h-4" /></button>
              </div>
            )}
          </div>
        ))}
      </div>
      {blogs.length === 0 && <p className="text-muted-foreground text-center py-8">No blog posts yet.</p>}
    </div>
  );
}
