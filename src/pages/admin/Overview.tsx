import { useEffect, useState } from "react";
import { FileText, Users, Calendar, Image, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function AdminOverview() {
  const [stats, setStats] = useState({ blogs: 0, members: 0, events: 0, gallery: 0, donations: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [b, m, e, g, d] = await Promise.all([
        supabase.from("blogs").select("id", { count: "exact", head: true }),
        supabase.from("members").select("id", { count: "exact", head: true }),
        supabase.from("events").select("id", { count: "exact", head: true }),
        supabase.from("gallery").select("id", { count: "exact", head: true }),
        supabase.from("donations").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        blogs: b.count ?? 0,
        members: m.count ?? 0,
        events: e.count ?? 0,
        gallery: g.count ?? 0,
        donations: d.count ?? 0,
      });
      setLoading(false);
    }
    load();
  }, []);

  const cards = [
    { label: "Blog Posts", value: stats.blogs, icon: FileText },
    { label: "Members", value: stats.members, icon: Users },
    { label: "Events", value: stats.events, icon: Calendar },
    { label: "Gallery Items", value: stats.gallery, icon: Image },
    { label: "Donations", value: stats.donations, icon: Heart },
  ];

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <h2 className="font-display text-xl font-bold mb-6 text-foreground">Dashboard Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map((s) => (
          <div key={s.label} className="bg-card rounded-xl p-6 shadow-card ring-1 ring-border">
            <s.icon className="w-5 h-5 text-primary mb-3" />
            <div className="font-display text-3xl font-bold text-foreground">{s.value}</div>
            <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
