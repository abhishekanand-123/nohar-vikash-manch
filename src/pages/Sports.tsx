import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Trophy, Users, Dribbble } from "lucide-react";
import PageBanner from "@/components/layout/PageBanner";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import HoverImagePreview from "@/components/common/HoverImagePreview";
import SEO from "@/components/common/SEO";

function SportsCountdown({ targetDate, title }: { targetDate: string; title: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<ShadowRoot | null>(null);

  useEffect(() => {
    if (containerRef.current && !shadowRef.current) {
      try {
        shadowRef.current = containerRef.current.attachShadow({ mode: "open" });
      } catch {
        shadowRef.current = containerRef.current.shadowRoot;
      }
    }
  }, []);

  useEffect(() => {
    function render() {
      if (!shadowRef.current) return;
      const target = new Date(`${targetDate}T00:00:00`).getTime();
      const diffMs = target - Date.now();
      const diff =
        diffMs <= 0
          ? { days: 0, hrs: 0, min: 0, sec: 0 }
          : {
              days: Math.floor(diffMs / 86400000),
              hrs: Math.floor((diffMs % 86400000) / 3600000),
              min: Math.floor((diffMs % 3600000) / 60000),
              sec: Math.floor((diffMs % 60000) / 1000),
            };

      const days = String(diff.days).padStart(2, "0");
      const hrs = String(diff.hrs).padStart(2, "0");
      const min = String(diff.min).padStart(2, "0");
      const sec = String(diff.sec).padStart(2, "0");

      shadowRef.current.innerHTML = `
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: inherit; }
          :host { display: block; width: 100%; }
          .card {
            background: #ffffff;
            border-radius: 1rem;
            padding: 1.25rem;
            border: 1px solid rgba(120, 120, 120, 0.15);
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            user-select: none;
          }
          .title {
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #16a34a;
            text-align: center;
            margin-bottom: 0.75rem;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 0.75rem;
          }
          .unit {
            text-align: center;
            background: rgba(120, 120, 120, 0.07);
            border-radius: 0.75rem;
            padding: 0.75rem 0.25rem;
            border: 1px solid rgba(120, 120, 120, 0.12);
          }
          .num {
            font-size: 1.25rem;
            font-weight: 700;
            color: #ea580c;
            font-variant-numeric: tabular-nums;
          }
          .label {
            font-size: 0.625rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #6b7280;
            margin-top: 0.25rem;
            font-weight: 600;
          }
        </style>
        <div class="card notranslate" translate="no">
          <div class="title">${title} — काउंटडाउन</div>
          <div class="grid">
            <div class="unit"><div class="num">${days}</div><div class="label">दिन</div></div>
            <div class="unit"><div class="num">${hrs}</div><div class="label">घंटे</div></div>
            <div class="unit"><div class="num">${min}</div><div class="label">मिनट</div></div>
            <div class="unit"><div class="num">${sec}</div><div class="label">सेकंड</div></div>
          </div>
        </div>
      `;
    }

    render();
    const id = setInterval(render, 1000);
    return () => clearInterval(id);
  }, [targetDate, title]);

  return <div ref={containerRef} className="skiptranslate notranslate mb-6" translate="no" />;
}

export default function Sports() {
  const [sportsItems, setSportsItems] = useState<SportItem[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div>
      <SEO
        title="Sports Club & Tournaments (LNCC)"
        description="Nohar Sports Club (LNCC) managed by Nohar Vikash Yuvak Sangh — cricket tournaments, football matches, athletics schedule, and youth sports development."
        keywords="Nohar Sports Club, LNCC Nohar, Cricket Tournament, Football, Madhepura Sports"
      />
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
          {nextSport && nextSport.event_date && (
            <SportsCountdown targetDate={nextSport.event_date} title={nextSport.title} />
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
