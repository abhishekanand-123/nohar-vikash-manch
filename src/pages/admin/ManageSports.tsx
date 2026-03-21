import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type Sport = Tables<"sports">;

const sportTypes = ["Cricket", "Football", "Kabaddi", "Volleyball", "Athletics", "Other"];
const statuses = ["Upcoming", "Ongoing", "Completed"];

export default function ManageSports() {
  const { isAdmin } = useAuth();
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Sport | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    sport_type: "Cricket",
    status: "Upcoming",
    event_date: "",
    imageFile: null as File | null,
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("sports").select("*").order("event_date", { ascending: true, nullsFirst: false });
    setSports((data as Sport[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm({ title: "", description: "", sport_type: "Cricket", status: "Upcoming", event_date: "", imageFile: null });
    setEditing(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    setSaving(true);

    let imageUrl = editing?.image ?? null;
    if (form.imageFile) {
      const uploaded = await uploadFile(form.imageFile, "sports");
      if (uploaded) imageUrl = uploaded;
    }

    const payload = {
      title: form.title,
      description: form.description || null,
      sport_type: form.sport_type || null,
      status: form.status || null,
      event_date: form.event_date || null,
      image: imageUrl,
    };

    if (editing) {
      const { error } = await supabase.from("sports").update(payload).eq("id", editing.id);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Sports item updated!" });
    } else {
      const { error } = await supabase.from("sports").insert(payload);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Sports item added!" });
    }

    setSaving(false);
    resetForm();
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this sports item?")) return;
    const { error } = await supabase.from("sports").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Sports item deleted" });
      load();
    }
  };

  const startEdit = (item: Sport) => {
    setEditing(item);
    setForm({
      title: item.title,
      description: item.description ?? "",
      sport_type: item.sport_type ?? "Cricket",
      status: item.status ?? "Upcoming",
      event_date: item.event_date ?? "",
      imageFile: null,
    });
    setShowForm(true);
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-bold text-foreground">Sports</h2>
        {isAdmin && (
          <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90">
            <Plus className="w-4 h-4" /> Add Sports Item
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-card rounded-xl p-6 ring-1 ring-border mb-6 space-y-4">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className="w-full px-4 py-3 rounded-xl bg-background border border-input text-foreground text-sm" />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={4} className="w-full px-4 py-3 rounded-xl bg-background border border-input text-foreground text-sm" />
          <div className="grid sm:grid-cols-3 gap-4">
            <select value={form.sport_type} onChange={(e) => setForm({ ...form, sport_type: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-background border border-input text-foreground text-sm">
              {sportTypes.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-background border border-input text-foreground text-sm">
              {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
            <input type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-background border border-input text-foreground text-sm" />
          </div>
          <input type="file" accept="image/*" onChange={(e) => setForm({ ...form, imageFile: e.target.files?.[0] ?? null })} className="text-sm" />
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground px-6 py-2 rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50">
              {saving ? "Saving..." : editing ? "Update" : "Add"}
            </button>
            <button onClick={resetForm} className="px-6 py-2 rounded-xl text-sm border border-input hover:bg-secondary">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {sports.map((item) => (
          <div key={item.id} className="bg-card rounded-xl p-4 ring-1 ring-border flex gap-4">
            {item.image && <img src={item.image} alt={item.title} className="w-24 h-24 object-cover rounded-lg flex-shrink-0" />}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground">{item.title}</h3>
              <p className="text-xs text-muted-foreground">
                {item.sport_type || "General"} {item.event_date ? `• ${new Date(item.event_date).toLocaleDateString()}` : ""}
              </p>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
              <span className={`inline-flex mt-2 px-2.5 py-1 rounded-full text-xs font-semibold ${item.status === "Upcoming" ? "bg-primary/10 text-primary" : item.status === "Ongoing" ? "bg-accent/20 text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
                {item.status || "Status"}
              </span>
            </div>
            {isAdmin && (
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => startEdit(item)} className="p-2 rounded-lg hover:bg-secondary"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="w-4 h-4" /></button>
              </div>
            )}
          </div>
        ))}
      </div>
      {sports.length === 0 && <p className="text-muted-foreground text-center py-8">No sports items yet.</p>}
    </div>
  );
}
