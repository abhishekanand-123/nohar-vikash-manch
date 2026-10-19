import { useState, useEffect } from "react";
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
import { formatAutoLinks } from "@/components/common/RichContentView";

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

interface GramUdyogBlogWidgetProps {
  limit?: number;
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function GramUdyogBlogWidget({
  limit = 3,
  title = "ग्राम उद्योग एवं कामगार डायरेक्टरी",
  subtitle = "गाँव नोहर के शिक्षक, मिस्त्री, इलेक्ट्रीशियन, स्वास्थ्य कर्मी व कामगारों से सीधे संपर्क करें।",
  className = "",
}: GramUdyogBlogWidgetProps) {
  const [services, setServices] = useState<VillageService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchVillageServices();
      setServices(data.filter((s) => s.is_active !== false));
      setLoading(false);
    }
    load();
  }, []);

  const displayedList = services.slice(0, limit);

  if (loading) {
    return (
      <div className="py-8 flex justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (displayedList.length === 0) return null;

  return (
    <section className={`rounded-3xl bg-secondary/30 border border-border/70 p-6 sm:p-8 lg:p-10 my-12 relative overflow-hidden ${className}`}>
      {/* Decorative Blob */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary font-semibold text-xs px-3 py-1 rounded-full mb-2.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>गाँव का हुनर, गाँव का विकास</span>
            </div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-foreground">
              {title}
            </h3>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
              {subtitle}
            </p>
          </div>

          <Link
            to="/gram-udyog"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all shadow-sm shrink-0 self-start sm:self-auto"
          >
            <span>सभी सेवाएँ देखें (Read More)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 3 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedList.map((item, index) => {
            const IconComp = getCategoryIcon(item.category);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="bg-card border border-border hover:border-primary/40 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header: Icon, Name, Category */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {item.image ? (
                        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-border bg-muted flex items-center justify-center">
                          <img
                            src={item.image}
                            alt={item.name}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                          <IconComp className="w-6 h-6" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-base text-foreground group-hover:text-primary transition-colors truncate">
                          {item.name}
                        </h4>
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

                  {/* Skill, Description & Address */}
                  <div className="mt-4 space-y-2 text-xs">
                    {item.skill && (
                      <div className="bg-secondary/50 p-2.5 rounded-xl text-foreground font-medium text-[11px] leading-relaxed break-words">
                        <span className="text-muted-foreground block text-[10px] font-normal uppercase tracking-wider mb-0.5">
                          विशेषता:
                        </span>
                        {formatAutoLinks(item.skill)}
                      </div>
                    )}

                    {item.description && (
                      <div className="text-muted-foreground text-[11px] leading-relaxed break-words">
                        {formatAutoLinks(item.description)}
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

                {/* Actions: Call & WhatsApp */}
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

        {/* Bottom CTA */}
        <div className="mt-8 text-center">
          <Link
            to="/gram-udyog"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-primary hover:text-primary/80 transition-colors bg-primary/10 hover:bg-primary/15 px-5 py-2.5 rounded-xl border border-primary/20 shadow-sm"
          >
            <span>नोहर गाँव की पूरी डायरेक्टरी देखें (View Full Directory & Read More)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
