import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type PageBanner = Tables<"page_banners">;

const pages = [
  { key: "home", label: "Home Page" },
  { key: "about", label: "About Page" },
  { key: "festivals", label: "Festivals Page" },
  { key: "gallery", label: "Gallery Page" },
  { key: "videos", label: "Videos Page" },
  { key: "donation", label: "Donation Page" },
  { key: "ramnavami", label: "Ramnavami Page" },
  { key: "sports", label: "Sports Page" },
];

export default function ManageBanners() {
  const { isAdmin } = useAuth();
  const [banners, setBanners] = useState<PageBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PageBanner | null>(null);
  const [form, setForm] = useState({
    page_key: "about",
    title: "",
    subtitle: "",
    is_active: true,
    imageFile: null as File | null,
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("page_banners").select("*").order("created_at", { ascending: false });
    setBanners((data as PageBanner[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm({ page_key: "about", title: "", subtitle: "", is_active: true, imageFile: null });
    setEditing(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    setSaving(true);

    let bgImage = editing?.bg_image ?? null;
    if (form.imageFile) {
      const uploaded = await uploadFile(form.imageFile, "banners");
      if (uploaded) bgImage = uploaded;
    }

    const payload = {
      page_key: form.page_key,
      title: form.title,
      subtitle: form.subtitle || null,
      bg_image: bgImage,
      is_active: form.is_active,
    };

    if (editing) {
      const { error } = await supabase.from("page_banners").update(payload).eq("id", editing.id);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Banner updated!" });
    } else {
      const { error } = await supabase.from("page_banners").insert(payload);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Banner added!" });
    }

    setSaving(false);
    resetForm();
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    const { error } = await supabase.from("page_banners").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Banner deleted" });
      load();
    }
  };

  const startEdit = (banner: PageBanner) => {
    setEditing(banner);
    setForm({
      page_key: banner.page_key,
      title: banner.title,
      subtitle: banner.subtitle ?? "",
      is_active: banner.is_active,
      imageFile: null,
    });
    setShowForm(true);
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-bold text-foreground">Page Banners</h2>
        {isAdmin && (
          <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90">
            <Plus className="w-4 h-4" /> Add Banner
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-card rounded-xl p-6 ring-1 ring-border mb-6 space-y-4">
          <select value={form.page_key} onChange={(e) => setForm({ ...form, page_key: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-background border border-input text-foreground text-sm">
            {pages.map((page) => <option key={page.key} value={page.key}>{page.label}</option>)}
          </select>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Banner title" className="w-full px-4 py-3 rounded-xl bg-background border border-input text-foreground text-sm" />
          <textarea value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} placeholder="Banner subtitle" rows={3} className="w-full px-4 py-3 rounded-xl bg-background border border-input text-foreground text-sm" />
          <input type="file" accept="image/*" onChange={(e) => setForm({ ...form, imageFile: e.target.files?.[0] ?? null })} className="text-sm" />
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            Active
          </label>
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground px-6 py-2 rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50">
              {saving ? "Saving..." : editing ? "Update" : "Add"}
            </button>
            <button onClick={resetForm} className="px-6 py-2 rounded-xl text-sm border border-input hover:bg-secondary">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {banners.map((banner) => (
          <div key={banner.id} className="bg-card rounded-xl p-4 ring-1 ring-border flex gap-4">
            {banner.bg_image && <img src={banner.bg_image} alt={banner.title} className="w-24 h-24 object-cover rounded-lg flex-shrink-0" />}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground">{banner.title}</h3>
              <p className="text-xs text-muted-foreground">{banner.page_key} • {banner.is_active ? "Active" : "Inactive"}</p>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{banner.subtitle}</p>
            </div>
            {isAdmin && (
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => startEdit(banner)} className="p-2 rounded-lg hover:bg-secondary"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(banner.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="w-4 h-4" /></button>
              </div>
            )}
          </div>
        ))}
      </div>
      {banners.length === 0 && <p className="text-muted-foreground text-center py-8">No banners configured yet.</p>}
    </div>
  );
}
