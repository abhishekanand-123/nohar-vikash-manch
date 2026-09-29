import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import HoverImagePreview from "@/components/common/HoverImagePreview";
import { Calendar, Filter, ArrowRight, Sparkles } from "lucide-react";

interface Blog {
  id: string;
  title: string;
  image: string | null;
  content: string | null;
  category: string | null;
  festival_date: string | null;
  created_at: string;
}

// Helper to extract year from festival_date or created_at
function getPostYear(post: Blog): string {
  if (post.festival_date) {
    const yearMatch = post.festival_date.match(/\b(20\d{2})\b/);
    if (yearMatch) return yearMatch[1];
  }
  return new Date(post.created_at).getFullYear().toString();
}

export default function FestivalHighlights() {
  const [festivals, setFestivals] = useState<Blog[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("blogs")
        .select("id,title,image,content,category,festival_date,created_at")
        .order("created_at", { ascending: false });

      setFestivals((data as Blog[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  // Compute available years dynamically
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    festivals.forEach((f) => {
      years.add(getPostYear(f));
    });
    // Sort descending so 2026 comes before 2025
    return ["All", ...Array.from(years).sort((a, b) => Number(b) - Number(a))];
  }, [festivals]);

  // Compute available categories dynamically
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    festivals.forEach((f) => {
      if (f.category?.trim()) cats.add(f.category.trim());
    });
    return ["All", ...Array.from(cats)];
  }, [festivals]);

  // Filter posts based on selected year and category
  const filteredFestivals = useMemo(() => {
    return festivals.filter((f) => {
      const yearMatch = selectedYear === "All" || getPostYear(f) === selectedYear;
      const categoryMatch = selectedCategory === "All" || f.category === selectedCategory;
      return yearMatch && categoryMatch;
    });
  }, [festivals, selectedYear, selectedCategory]);

  return (
    <section className="py-14 sm:py-20 bg-background/50 relative">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-8 max-w-3xl mx-auto px-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent font-semibold uppercase text-xs tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>हमारी परंपराएँ और उत्सव</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-foreground">
            एकता के साथ मनाए जाने वाले हमारे त्योहार
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
            नोहर गाँव के सभी पावन पर्व और उत्सवों की ताज़ा और ऐतिहासिक यादें
          </p>
        </div>

        {/* Filter Controls (Year & Category) */}
        <div className="mb-10 space-y-4 max-w-4xl mx-auto">
          {/* Year Filter Buttons */}
          {availableYears.length > 2 && (
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mr-1">
                <Calendar className="w-3.5 h-3.5" /> वर्ष (Year):
              </span>
              {availableYears.map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    selectedYear === year
                      ? "bg-primary text-primary-foreground shadow-sm scale-105"
                      : "bg-card text-muted-foreground border border-border hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {year === "All" ? "सभी वर्ष (All Years)" : year}
                </button>
              ))}
            </div>
          )}

          {/* Category Filter Buttons */}
          {availableCategories.length > 2 && (
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mr-1">
                <Filter className="w-3.5 h-3.5" /> त्यौहार (Festival):
              </span>
              {availableCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all ${
                    selectedCategory === cat
                      ? "bg-accent text-accent-foreground font-semibold shadow-sm"
                      : "bg-card text-muted-foreground border border-border/80 hover:bg-secondary"
                  }`}
                >
                  {cat === "All" ? "सभी (All)" : cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Festivals Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            <AnimatePresence mode="popLayout">
              {filteredFestivals.slice(0, 6).map((f, i) => {
                const year = getPostYear(f);
                return (
                  <motion.div
                    key={f.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to={`/festivals/${f.id}`}
                      className="block h-full bg-card rounded-2xl overflow-hidden shadow-card ring-1 ring-border hover:shadow-xl hover:ring-primary/40 transition-all duration-300 group flex flex-col"
                    >
                      {f.image && (
                        <HoverImagePreview
                          src={f.image}
                          alt={f.title}
                          containerClassName="aspect-video overflow-hidden relative"
                          imageClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}

                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          {f.category ? (
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-wide">
                              {f.category}
                            </span>
                          ) : <span />}
                          
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-accent/15 text-accent flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {year}
                          </span>
                        </div>

                        <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {f.title}
                        </h3>

                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2 flex-1">
                          {f.content || "Read latest festival updates and stories from the village."}
                        </p>

                        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            {f.festival_date ||
                              new Date(f.created_at).toLocaleDateString("en-IN", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                          </span>
                          <span className="text-primary font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            पूरी जानकारी <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {filteredFestivals.length === 0 && !loading && (
          <div className="text-center py-12 bg-card rounded-2xl border border-dashed border-border max-w-md mx-auto">
            <p className="text-muted-foreground text-sm">इस वर्ष / श्रेणी में कोई पोस्ट नहीं मिली।</p>
            <button
              onClick={() => {
                setSelectedYear("All");
                setSelectedCategory("All");
              }}
              className="mt-3 text-xs text-primary font-semibold hover:underline"
            >
              सभी पोस्ट देखें (Reset Filters)
            </button>
          </div>
        )}

        {/* View All Button */}
        <div className="text-center mt-10">
          <Link
            to="/festivals"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity shadow-md hover:shadow-lg"
          >
            <span>सभी त्यौहार और ब्लॉग देखें (View All)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
