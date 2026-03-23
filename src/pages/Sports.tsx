import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Trophy, Users, Dribbble } from "lucide-react";
import PageBanner from "@/components/layout/PageBanner";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import HoverImagePreview from "@/components/common/HoverImagePreview";

type SportItem = Tables<"sports">;

export default function Sports() {
  const [sportsItems, setSportsItems] = useState<SportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hrs: 0, min: 0, sec: 0 });

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("sports").select("*").order("event_date", { ascending: true, nullsFirst: false });
      setSportsItems((data as SportItem[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const highlighted = sportsItems.find((item) => Boolean(item.image)) ?? sportsItems[0] ?? null;
  const sportCategories = useMemo(
    () => Array.from(new Set(sportsItems.map((item) => item.sport_type).filter((item): item is string => Boolean(item)))),
    [sportsItems]
  );
  const nextSport = useMemo(() => {
    const now = new Date();
    const upcoming = sportsItems
      .filter((item) => item.event_date && (item.status ?? "").toLowerCase() !== "completed")
      .map((item) => ({ ...item, parsedDate: new Date(`${item.event_date}T00:00:00`) }))
      .filter((item) => item.parsedDate.getTime() >= now.getTime())
      .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());
    return upcoming[0] ?? null;
  }, [sportsItems]);

  useEffect(() => {
    function getDiff() {
      if (!nextSport?.event_date) return { days: 0, hrs: 0, min: 0, sec: 0 };
      const target = new Date(`${nextSport.event_date}T00:00:00`).getTime();
      const diff = target - Date.now();
      if (diff <= 0) return { days: 0, hrs: 0, min: 0, sec: 0 };
      return {
        days: Math.floor(diff / 86400000),
        hrs: Math.floor((diff % 86400000) / 3600000),
        min: Math.floor((diff % 3600000) / 60000),
        sec: Math.floor((diff % 60000) / 1000),
      };
    }
    setTimeLeft(getDiff());
    const timer = setInterval(() => setTimeLeft(getDiff()), 1000);
    return () => clearInterval(timer);
  }, [nextSport]);

  return (
    <div>
      <PageBanner
        pageKey="sports"
        icon={Dribbble}
        title="Sports Club"
        subtitle="Managed by Nohar Vikash Yuvak Sangh, promoting sports and fitness in Nohar."
      />

      <div className="container mx-auto px-6 py-20">
        {/* About + Image */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="font-display font-bold text-2xl mb-4 text-foreground">नोहर स्पोर्ट्स क्लब (LNCC)</h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              नोहर विकास युवक संघ द्वारा संचालित नोहर स्पोर्ट्स क्लब युवाओं को क्रिकेट, फुटबॉल और अन्य खेल गतिविधियों में भाग लेने के लिए प्रोत्साहित करता है। नीचे दिए गए खेल संबंधी घोषणाएँ एडमिन पैनल से प्रबंधित की जाती हैं।
              इस क्लब का संचालन सिद्धार्थ झा, उज्ज्वल अभिषेक, सुमित कुमार और मारुति मिश्रा द्वारा किया जाता है।
            </p>
            <div className="flex flex-wrap gap-4">
              {(sportCategories.length > 0 ? sportCategories : ["Cricket", "Football"]).slice(0, 4).map((sport) => (
                <div key={sport} className="flex flex-col items-center gap-2 bg-card rounded-xl px-8 py-5 shadow-card ring-1 ring-border">
                  {sport.toLowerCase().includes("football") ? <Users className="w-6 h-6 text-primary" /> : <Trophy className="w-6 h-6 text-primary" />}
                  <span className="font-display font-semibold text-foreground text-sm">{sport}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            {highlighted?.image ? (
              <HoverImagePreview
                src={highlighted.image}
                alt={highlighted.title}
                containerClassName="rounded-2xl shadow-card w-full overflow-hidden ring-1 ring-border"
                imageClassName="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="rounded-2xl shadow-card w-full ring-1 ring-border bg-card p-12 text-center text-muted-foreground">
                Add a sports image from admin to feature it here.
              </div>
            )}
          </motion.div>
        </div>

        {/* Tournaments */}
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display font-bold text-2xl mb-6 text-center text-foreground">खेल प्रतियोगिता सूचनाएँ</h2>
          {nextSport && (
            <div className="bg-card rounded-2xl p-5 shadow-card ring-1 ring-border mb-6">
              <p className="text-xs uppercase tracking-widest text-primary text-center font-semibold mb-3">
                Countdown - {nextSport.title}
              </p>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Days", value: timeLeft.days },
                  { label: "Hrs", value: timeLeft.hrs },
                  { label: "Min", value: timeLeft.min },
                  { label: "Sec", value: timeLeft.sec },
                ].map((unit) => (
                  <div key={unit.label} className="text-center bg-secondary/40 rounded-xl py-3 ring-1 ring-border">
                    <p className="text-xl font-bold text-accent tabular-nums">{String(unit.value).padStart(2, "0")}</p>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{unit.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : sportsItems.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No tournament announcements yet.</p>
          ) : (
            <div className="space-y-3">
              {sportsItems.map((item) => (
                <div key={item.id} className="bg-card rounded-xl p-5 shadow-card ring-1 ring-border flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-display font-semibold text-foreground">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {item.event_date ? new Date(item.event_date).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }) : "Date will be announced"}
                      {item.sport_type ? ` • ${item.sport_type}` : ""}
                    </p>
                    {item.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.status === "Upcoming" ? "bg-primary/10 text-primary" : item.status === "Ongoing" ? "bg-accent/20 text-accent-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                    {item.status || "Status"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
