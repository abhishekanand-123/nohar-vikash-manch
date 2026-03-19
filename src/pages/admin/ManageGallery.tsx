import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile, deleteFile } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Trash2, Plus } from "lucide-react";

interface GalleryItem {
  id: string;
  image: string;
  title: string | null;
  category: string | null;
}

const categories = ["festival", "sports", "village"];

export default function ManageGallery() {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", category: "village", imageFile: null as File | null });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("gallery").select("*").order("created_at", { ascending: false });
    setItems((data as GalleryItem[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async () => {
    if (!form.imageFile) { toast({ title: "Select an image", variant: "destructive" }); return; }
    setSaving(true);
    const url = await uploadFile(form.imageFile, "gallery");
    if (!url) { toast({ title: "Upload failed", variant: "destructive" }); setSaving(false); return; }

    const { error } = await supabase.from("gallery").insert({ image: url, title: form.title, category: form.category });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Image added!" });
    setSaving(false);
    setForm({ title: "", category: "village", imageFile: null });
    setShowForm(false);
    load();
  };

  const handleDelete = async (item: GalleryItem) => {
    if (!confirm("Delete this image?")) return;
    await deleteFile(item.image);
    const { error } = await supabase.from("gallery").delete().eq("id", item.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Image deleted" }); load(); }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-bold text-foreground">Gallery</h2>
        {isAdmin && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90">
            <Plus className="w-4 h-4" /> Upload Image
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-card rounded-xl p-6 ring-1 ring-border mb-6 space-y-4">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title (optional)" className="w-full px-4 py-3 rounded-xl bg-background border border-input text-foreground text-sm" />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-background border border-input text-foreground text-sm">
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="file" accept="image/*" onChange={(e) => setForm({ ...form, imageFile: e.target.files?.[0] ?? null })} className="text-sm" />
          <div className="flex gap-3">
            <button onClick={handleUpload} disabled={saving} className="bg-primary text-primary-foreground px-6 py-2 rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50">
              {saving ? "Uploading..." : "Upload"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-6 py-2 rounded-xl text-sm border border-input hover:bg-secondary">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item.id} className="relative group">
            <img src={item.image} alt={item.title ?? ""} className="w-full h-40 object-cover rounded-xl" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 rounded-b-xl">
              <p className="text-white text-xs truncate">{item.title || item.category}</p>
            </div>
            {isAdmin && (
              <button onClick={() => handleDelete(item)} className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>
      {items.length === 0 && <p className="text-muted-foreground text-center py-8">No gallery images yet.</p>}
    </div>
  );
}
