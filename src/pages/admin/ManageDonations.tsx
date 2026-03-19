import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Trash2, Plus } from "lucide-react";

interface Donation {
  id: string;
  name: string | null;
  amount: number | null;
  message: string | null;
  created_at: string;
}

export default function ManageDonations() {
  const { isAdmin } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", amount: "", message: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("donations").select("*").order("created_at", { ascending: false });
    setDonations((data as Donation[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from("donations").insert({
      name: form.name || null,
      amount: form.amount ? parseFloat(form.amount) : 0,
      message: form.message || null,
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Donation recorded!" });
    setSaving(false);
    setForm({ name: "", amount: "", message: "" });
    setShowForm(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this record?")) return;
    const { error } = await supabase.from("donations").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Deleted" }); load(); }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-bold text-foreground">Donations</h2>
        {isAdmin && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90">
            <Plus className="w-4 h-4" /> Add Donation
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-card rounded-xl p-6 ring-1 ring-border mb-6 space-y-4">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Donor name" className="w-full px-4 py-3 rounded-xl bg-background border border-input text-foreground text-sm" />
          <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="Amount (₹)" className="w-full px-4 py-3 rounded-xl bg-background border border-input text-foreground text-sm" />
          <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Message" rows={3} className="w-full px-4 py-3 rounded-xl bg-background border border-input text-foreground text-sm" />
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground px-6 py-2 rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50">
              {saving ? "Saving..." : "Add"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-6 py-2 rounded-xl text-sm border border-input hover:bg-secondary">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {donations.map((d) => (
          <div key={d.id} className="bg-card rounded-xl p-4 ring-1 ring-border flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">{d.name || "Anonymous"}</h3>
              <p className="text-sm text-primary font-medium">₹{d.amount ?? 0}</p>
              {d.message && <p className="text-xs text-muted-foreground mt-1">{d.message}</p>}
              <p className="text-xs text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</p>
            </div>
            {isAdmin && (
              <button onClick={() => handleDelete(d.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
      {donations.length === 0 && <p className="text-muted-foreground text-center py-8">No donations recorded yet.</p>}
    </div>
  );
}
