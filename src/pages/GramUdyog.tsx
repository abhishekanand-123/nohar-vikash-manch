import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Search,
  Phone,
  MessageCircle,
  MapPin,
  Award,
  Sparkles,
  Share2,
  Users,
  CheckCircle2,
  GraduationCap,
  Wrench,
  Hammer,
  Zap,
  Stethoscope,
  Filter,
} from "lucide-react";
import PageBanner from "@/components/layout/PageBanner";
import { fetchVillageServices, VillageService } from "@/lib/servicesApi";
import { toast } from "sonner";

// Helper to get category icon
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

export default function GramUdyog() {
  const [services, setServices] = useState<VillageService[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await fetchVillageServices();
      setServices(data.filter((s) => s.is_active !== false));
      setLoading(false);
    }
    loadData();
  }, []);

  // Extract all distinct categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    services.forEach((s) => {
      if (s.category && s.category.trim()) {
        set.add(s.category.trim());
      }
    });
    return Array.from(set);
  }, [services]);

  // Filtered list based on search and selected category
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchCategory =
        selectedCategory === "all" || s.category.toLowerCase() === selectedCategory.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        (s.skill && s.skill.toLowerCase().includes(q)) ||
        (s.address && s.address.toLowerCase().includes(q)) ||
        s.phone.includes(q);

      return matchCategory && matchSearch;
    });
  }, [services, selectedCategory, searchQuery]);

  const handleShareProfile = (item: VillageService) => {
    const text = `*${item.name}* (${item.category})\nकाम: ${item.skill || "सेवा"}\nपता: ${item.address || "ग्राम नोहर"}\nफ़ोन: ${item.phone}\n\n_नोहर विकास मंच डिजिटल डायरेक्टरी_`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Dynamic Database Page Banner */}
      <PageBanner
        pageKey="gram-udyog"
        title="ग्राम उद्योग एवं विकास"
        subtitle="गाँव नोहर के कुशल कामगार, शिक्षक, मिस्त्री, इलेक्ट्रीशियन, स्वास्थ्य कर्मी व व्यापार डायरेक्टरी"
        icon={Briefcase}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 space-y-8">
        {/* Search & Stats Bar */}
        <div className="bg-card border border-border/80 rounded-2xl shadow-xl p-4 sm:p-6 backdrop-blur-md">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="नाम, श्रेणी (Teacher/Mistri), काम या फ़ोन नंबर खोजें..."
                className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/70"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground self-start md:self-auto">
              <div className="flex items-center gap-1.5 bg-primary/10 text-primary font-semibold px-3 py-1.5 rounded-lg">
                <Users className="w-3.5 h-3.5" />
                <span>कुल सेवाएँ: {services.length}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>सत्यापित सदस्य</span>
              </div>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="mt-5 pt-4 border-t border-border flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1 shrink-0 pr-1">
              <Filter className="w-3.5 h-3.5" /> श्रेणी:
            </div>

            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                selectedCategory === "all"
                  ? "bg-primary text-primary-foreground shadow-sm scale-105"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              सभी (All) ({services.length})
            </button>

            {categories.map((cat) => {
              const count = services.filter((s) => s.category.toLowerCase() === cat.toLowerCase()).length;
              const IconComp = getCategoryIcon(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 ${
                    selectedCategory.toLowerCase() === cat.toLowerCase()
                      ? "bg-primary text-primary-foreground shadow-sm scale-105"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  <IconComp className="w-3 h-3" />
                  <span>{cat}</span>
                  <span className="opacity-70 text-[10px]">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Directory Listing Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            <p className="text-sm text-muted-foreground">ग्राम डायरेक्टरी लोड हो रही है...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center space-y-3">
            <Briefcase className="w-10 h-10 text-muted-foreground mx-auto opacity-50" />
            <h3 className="font-semibold text-lg text-foreground">कोई सेवा नहीं मिली</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              आपकी खोज या चुनी गई श्रेणी में कोई परिणाम नहीं मिला। कृपया दूसरा शब्द खोजें।
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
              }}
              className="mt-2 text-xs text-primary font-semibold hover:underline"
            >
              सभी सूचियाँ देखें (Clear filters)
            </button>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filteredServices.map((item) => {
                const IconComp = getCategoryIcon(item.category);
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="bg-card border border-border hover:border-primary/40 rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Header */}
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

                      {/* Skill & Description */}
                      <div className="mt-4 space-y-2 text-xs">
                        {item.skill && (
                          <div className="bg-secondary/50 p-2.5 rounded-xl text-foreground font-medium">
                            <span className="text-muted-foreground block text-[10px] font-normal uppercase tracking-wider mb-0.5">
                              हुनर / विशेषता:
                            </span>
                            {item.skill}
                          </div>
                        )}

                        {item.description && (
                          <p className="text-muted-foreground text-[11px] leading-relaxed line-clamp-2">
                            {item.description}
                          </p>
                        )}

                        {item.address && (
                          <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] pt-1">
                            <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
                            <span className="truncate">{item.address}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-5 pt-4 border-t border-border flex items-center gap-2">
                      <a
                        href={`tel:${item.phone}`}
                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        कॉल करें
                      </a>

                      <a
                        href={`https://wa.me/91${(item.whatsapp || item.phone).replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 rounded-xl transition-colors border border-emerald-500/20"
                        title="WhatsApp Chat"
                        aria-label="WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>

                      <button
                        type="button"
                        onClick={() => handleShareProfile(item)}
                        className="p-2.5 text-muted-foreground hover:text-foreground bg-secondary hover:bg-secondary/80 rounded-xl transition-colors"
                        title="Share on WhatsApp"
                        aria-label="Share"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Bottom Callout for Villagers */}
        <div className="bg-gradient-to-br from-primary/10 via-card to-accent/10 border border-primary/20 rounded-2xl p-6 sm:p-8 text-center space-y-3 shadow-md">
          <Sparkles className="w-8 h-8 text-primary mx-auto" />
          <h3 className="font-bold text-lg sm:text-xl text-foreground">
            क्या आप भी गाँव में अपनी सेवा या हुनर जोड़ना चाहते हैं?
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
            यदि आप शिक्षक, मिस्त्री, इलेक्ट्रीशियन, वाहन चालक, या कोई भी व्यापार/दुकान चलाते हैं, तो अपना नाम Direct Portal में जुड़वाने हेतु एडमिन से संपर्क करें।
          </p>
          <div className="pt-2">
            <a
              href="https://wa.me/918770824752?text=नमस्ते%20नोहर%20विकास%20मंच,%20मैं%20ग्राम%20उद्योग%20डायरेक्टरी%20में%20अपना%20नाम/सेवा%20जोड़ना%20चाहता%20हूँ।"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl hover:opacity-95 transition-opacity shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              एडमिन से WhatsApp पर जुड़ें
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
