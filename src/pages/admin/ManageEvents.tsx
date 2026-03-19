import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus } from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string | null;
  image: string | null;
}

export default function ManageEvents() {
  const { isAdmin } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [form, setForm] = useState({ title: "", description: "", date: "", imageFile: null as File | null });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("events").select("*").order("date", { ascending: false });
    setEvents((data as Event[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => { setForm({ title: "", description: "", date: "", imageFile: null }); setEditing(null); setShowForm(false); };

  const handleSave = async () => {
    if (!form.title.trim()) { toast({ title: "Title is required", variant: "destructive" }); return; }
    setSaving(true);

    let imageUrl = editing?.image ?? null;
    if (form.imageFile) {
      const url = await uploadFile(form.imageFile, "events");
      if (url) imageUrl = url;
    }

    const payload = { title: form.title, description: form.description, date: form.date || null, image: imageUrl };

    if (editing) {
      const { error } = await supabase.from("events").update(payload).eq("id", editing.id);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Event updated!" });
    } else {
      const { error } = await supabase.from("events").insert(payload);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Event added!" });
    }
    setSaving(false);
    resetForm();
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Event deleted" }); load(); }
  };

  const startEdit = (e: Event) => {
    setEditing(e);
    setForm({ title: e.title, description: e.description ?? "", date: e.date?.split("T")[0] ?? "", imageFile: null });
    setShowForm(true);
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-bold text-foreground">Events</h2>
        {isAdmin && (
          <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90">
            <Plus className="w-4 h-4" /> Add Event
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-card rounded-xl p-6 ring-1 ring-border mb-6 space-y-4">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Event title" className="w-full px-4 py-3 rounded-xl bg-background border border-input text-foreground text-sm" />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={4} className="w-full px-4 py-3 rounded-xl bg-background border border-input text-foreground text-sm" />
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-background border border-input text-foreground text-sm" />
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
        {events.map((e) => (
          <div key={e.id} className="bg-card rounded-xl p-4 ring-1 ring-border flex gap-4">
            {e.image && <img src={e.image} alt={e.title} className="w-24 h-24 object-cover rounded-lg flex-shrink-0" />}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground">{e.title}</h3>
              <p className="text-xs text-muted-foreground">{e.date ? new Date(e.date).toLocaleDateString() : "No date"}</p>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{e.description}</p>
            </div>
            {isAdmin && (
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => startEdit(e)} className="p-2 rounded-lg hover:bg-secondary"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(e.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="w-4 h-4" /></button>
              </div>
            )}
          </div>
        ))}
      </div>
      {events.length === 0 && <p className="text-muted-foreground text-center py-8">No events yet.</p>}
    </div>
  );
}
