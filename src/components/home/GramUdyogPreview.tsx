import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Briefcase,
  Phone,
  MessageCircle,
  ArrowRight,
  Sparkles,
  GraduationCap,
  Hammer,
  Zap,
  Stethoscope,
  Wrench,
  MapPin,
  Award,
} from "lucide-react";
import { fetchVillageServices, VillageService } from "@/lib/servicesApi";

function getCategoryIcon(category: string) {
  const cat = category.toLowerCase();
  if (cat.includes("teacher") || cat.includes("शिक्षक") || cat.includes("शिक्षा")) {
    return GraduationCap;
  }
  if (cat.includes("mistri") || cat.includes("मिस्त्री") || cat.includes("राजमिस्त्री")) {
    return Hammer;
  }
  if (cat.includes("electric") || cat.includes("इलेक्ट्रीशियन") || cat.includes("बिजली")) {
    return Zap;
  }
  if (cat.includes("health") || cat.includes("डॉक्टर") || cat.includes("स्वास्थ्य") || cat.includes("चिकित्सा")) {
    return Stethoscope;
  }
  if (cat.includes("plumber") || cat.includes("नल") || cat.includes("प्लंबर")) {
    return Wrench;
  }
  return Briefcase;
}

export default function GramUdyogPreview() {
  const [services, setServices] = useState<VillageService[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState<string>("all");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchVillageServices();
      setServices(data.filter((s) => s.is_active !== false));
      setLoading(false);
    }
    load();
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    services.forEach((s) => {
      if (s.category) set.add(s.category.trim());
    });
    return Array.from(set).slice(0, 5); // top 5 categories
  }, [services]);

  const displayedList = useMemo(() => {
    let list = services;
    if (activeCat !== "all") {
      list = services.filter((s) => s.category.toLowerCase() === activeCat.toLowerCase());
    }
    return list.slice(0, 6); // show up to 6 on home page
  }, [services, activeCat]);

  return (
    <section className="py-16 sm:py-20 bg-secondary/30 relative overflow-hidden border-y border-border/50">
      {/* Background Decorative Blob */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary font-semibold text-xs px-3 py-1.5 rounded-full mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>गाँव का हुनर, गाँव का विकास</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-foreground">
              ग्राम उद्योग एवं कामगार डायरेक्टरी
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
              गाँव नोहर के शिक्षक, मिस्त्री, इलेक्ट्रीशियन, स्वास्थ्य कर्मी व कामगारों से सीधे संपर्क करें।
            </p>
          </div>

          <Link
            to="/gram-udyog"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all shadow-md active:scale-95 shrink-0 self-start md:self-auto"
          >
            <span>सभी सेवाएँ देखें (Read More)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Category Pills */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveCat("all")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                activeCat === "all"
                  ? "bg-primary text-primary-foreground shadow-sm scale-105"
                  : "bg-card text-foreground border border-border hover:bg-secondary"
              }`}
            >
              सभी (All) ({services.length})
            </button>
            {categories.map((cat) => {
              const IconComp = getCategoryIcon(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCat(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 ${
                    activeCat.toLowerCase() === cat.toLowerCase()
                      ? "bg-primary text-primary-foreground shadow-sm scale-105"
                      : "bg-card text-foreground border border-border hover:bg-secondary"
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Services Cards Grid */}
        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedList.map((item, idx) => {
              const IconComp = getCategoryIcon(item.category);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="bg-card border border-border hover:border-primary/40 rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Info */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 rounded-xl object-cover border border-border shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                            <IconComp className="w-6 h-6" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors truncate">
                            {item.name}
                          </h3>
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md mt-0.5">
                            <IconComp className="w-3 h-3" />
                            {item.category}
                          </span>
                        </div>
                      </div>

                      {item.experience && (
                        <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-0.5 border border-amber-500/20">
                          <Award className="w-2.5 h-2.5" />
                          {item.experience}
                        </span>
                      )}
                    </div>

                    {/* Skill & Address */}
                    <div className="mt-4 space-y-2 text-xs">
                      {item.skill && (
                        <div className="bg-secondary/50 p-2.5 rounded-xl text-foreground font-medium text-[11px]">
                          <span className="text-muted-foreground block text-[10px] font-normal uppercase tracking-wider mb-0.5">
                            विशेषता:
                          </span>
                          {item.skill}
                        </div>
                      )}

                      {item.address && (
                        <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] pt-1">
                          <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
                          <span className="truncate">{item.address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-4 border-t border-border flex items-center gap-2">
                    <a
                      href={`tel:${item.phone}`}
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      कॉल करें
                    </a>

                    <a
                      href={`https://wa.me/91${(item.whatsapp || item.phone).replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 rounded-xl transition-colors border border-emerald-500/20"
                      title="WhatsApp Chat"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Bottom Read More CTA */}
        <div className="mt-10 text-center">
          <Link
            to="/gram-udyog"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors bg-primary/10 hover:bg-primary/15 px-6 py-3 rounded-xl border border-primary/20 shadow-sm"
          >
            <span>नोहर गाँव की पूरी डायरेक्टरी देखें (View Full Directory & Read More)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
