import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus } from "lucide-react";

interface Member {
  id: string;
  name: string;
  role: string | null;
  image: string | null;
}

export default function ManageMembers() {
  const { isAdmin } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [form, setForm] = useState({ name: "", role: "", imageFile: null as File | null });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("members").select("*").order("created_at", { ascending: false });
    setMembers((data as Member[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => { setForm({ name: "", role: "", imageFile: null }); setEditing(null); setShowForm(false); };

  const handleSave = async () => {
    if (!form.name.trim()) { toast({ title: "Name is required", variant: "destructive" }); return; }
    setSaving(true);

    let imageUrl = editing?.image ?? null;
    if (form.imageFile) {
      const url = await uploadFile(form.imageFile, "members");
      if (url) imageUrl = url;
    }

    if (editing) {
      const { error } = await supabase.from("members").update({ name: form.name, role: form.role, image: imageUrl }).eq("id", editing.id);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Member updated!" });
    } else {
      const { error } = await supabase.from("members").insert({ name: form.name, role: form.role, image: imageUrl });
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Member added!" });
    }
    setSaving(false);
    resetForm();
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this member?")) return;
    const { error } = await supabase.from("members").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Member deleted" }); load(); }
  };

  const startEdit = (m: Member) => {
    setEditing(m);
    setForm({ name: m.name, role: m.role ?? "", imageFile: null });
    setShowForm(true);
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-bold text-foreground">Members</h2>
        {isAdmin && (
          <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90">
            <Plus className="w-4 h-4" /> Add Member
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-card rounded-xl p-6 ring-1 ring-border mb-6 space-y-4">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="w-full px-4 py-3 rounded-xl bg-background border border-input text-foreground text-sm" />
          <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Role (e.g. President)" className="w-full px-4 py-3 rounded-xl bg-background border border-input text-foreground text-sm" />
          <input type="file" accept="image/*" onChange={(e) => setForm({ ...form, imageFile: e.target.files?.[0] ?? null })} className="text-sm" />
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground px-6 py-2 rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50">
              {saving ? "Saving..." : editing ? "Update" : "Add"}
            </button>
            <button onClick={resetForm} className="px-6 py-2 rounded-xl text-sm border border-input hover:bg-secondary">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((m) => (
          <div key={m.id} className="bg-card rounded-xl p-4 ring-1 ring-border">
            {m.image && <img src={m.image} alt={m.name} className="w-full h-40 object-cover rounded-lg mb-3" />}
            <h3 className="font-semibold text-foreground">{m.name}</h3>
            <p className="text-sm text-muted-foreground">{m.role}</p>
            {isAdmin && (
              <div className="flex gap-2 mt-3">
                <button onClick={() => startEdit(m)} className="p-2 rounded-lg hover:bg-secondary"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(m.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="w-4 h-4" /></button>
              </div>
            )}
          </div>
        ))}
      </div>
      {members.length === 0 && <p className="text-muted-foreground text-center py-8">No members yet.</p>}
    </div>
  );
}
