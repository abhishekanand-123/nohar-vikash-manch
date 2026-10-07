import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Landmark, Sparkles, MapPin, Eye, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export interface HeritageItem {
  id: string;
  title: string;
  description: string;
  image: string | null;
  badge: string | null;
  display_order: number;
  is_active: boolean;
}

const DEFAULT_HERITAGE_ITEMS: HeritageItem[] = [
  {
    id: "default-1",
    title: "ऐतिहासिक बरगद का वृक्ष",
    description: "हमारे गाँव नोहर की सदियों पुरानी पहचान और बुजुर्गों की चौपाल का केंद्र, जो एकता, आपसी भाईचारे और समृद्ध संस्कृति का प्रतीक है।",
    image: "/assets/nohar-banyan-tree-BrFWNjpw.png",
    badge: "प्राकृतिक धरोहर",
    display_order: 1,
    is_active: true,
  },
  {
    id: "default-2",
    title: "प्राचीन मंदिर एवं पावन स्थल",
    description: "गाँव के आस्था और अध्यात्म का मुख्य केंद्र, जहाँ सभी ग्रामीण मिलकर पूजा-अर्चना, रामनवमी, शिवरात्रि और धार्मिक अनुष्ठान संपन्न करते हैं।",
    image: "/assets/temple-AR2vTjLz.jpg",
    badge: "सांस्कृतिक धरोहर",
    display_order: 2,
    is_active: true,
  },
  {
    id: "default-3",
    title: "गाँव का खेल मैदान व युवक संघ चौपाल",
    description: "युवाओं के खेलकूद, फिटनेस अभ्यास एवं सामाजिक जन-जागरूकता का प्रमुख केंद्र जहाँ नोहर विकास युवक संघ के नेतृत्व में सकारात्मक कार्य होते हैं।",
    image: "/assets/hero-village-CM2PJpz1.jpg",
    badge: "सामाजिक पहचान",
    display_order: 3,
    is_active: true,
  },
];

export default function VillageHeritage() {
  const [items, setItems] = useState<HeritageItem[]>(DEFAULT_HERITAGE_ITEMS);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<HeritageItem | null>(null);

  useEffect(() => {
    async function fetchHeritage() {
      try {
        const { data, error } = await supabase
          .from("village_heritage")
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true });

        if (!error && data && data.length > 0) {
          setItems(data as HeritageItem[]);
        }
      } catch (err) {
        console.warn("Could not fetch village_heritage from backend, using default items:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchHeritage();
  }, []);

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-background via-secondary/20 to-background relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs sm:text-sm font-semibold mb-4 shadow-sm"
          >
            <Landmark className="w-4 h-4" />
            <span>धरोहर एवं संस्कृति</span>
            <Sparkles className="w-3.5 h-3.5 text-accent" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-4xl font-bold font-display text-foreground tracking-tight"
          >
            हमारे गाँव की <span className="text-primary">धरोहर</span> और <span className="text-accent">पहचान</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed"
          >
            गाँव नोहर की ऐतिहासिक, सांस्कृतिक और प्राकृतिक विरासत जो सदियों से हमारे आपसी प्रेम, एकता और गौरव की प्रतीक है।
          </motion.p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {items.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setSelectedItem(item)}
              className="group relative bg-card rounded-2xl sm:rounded-3xl border border-border/70 overflow-hidden shadow-card hover:shadow-xl hover:border-primary/40 transition-all duration-300 flex flex-col cursor-pointer"
            >
              {/* Image Box */}
              <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-secondary text-muted-foreground">
                    <Landmark className="w-12 h-12 opacity-40" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                {/* Badge */}
                {item.badge && (
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-black/60 text-white backdrop-blur-md border border-white/20 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                      {item.badge}
                    </span>
                  </div>
                )}

                {/* Quick view hint */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="p-2 rounded-full bg-black/50 text-white backdrop-blur-md inline-flex items-center justify-center">
                    <Eye className="w-4 h-4" />
                  </span>
                </div>

                {/* Location indicator / Village tag */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white/90 text-xs font-medium">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span>ग्राम नोहर, मधेपुरा</span>
                </div>
              </div>

              {/* Content Box */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold font-display text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between text-xs font-semibold text-primary">
                  <span>विस्तार से देखें</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detail / Image Lightbox Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card w-full max-w-2xl rounded-2xl sm:rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="relative aspect-[16/10] bg-black max-h-[340px]">
                {selectedItem.image && (
                  <img
                    src={selectedItem.image}
                    alt={selectedItem.title}
                    className="w-full h-full object-cover"
                  />
                )}
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors backdrop-blur-md"
                >
                  <X className="w-5 h-5" />
                </button>
                {selectedItem.badge && (
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary text-white">
                      {selectedItem.badge}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-6 overflow-y-auto">
                <h3 className="text-xl sm:text-2xl font-bold font-display text-foreground">
                  {selectedItem.title}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1 mb-4">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span>ग्राम नोहर (वार्ड स्तर), मधेपुरा, बिहार</span>
                </div>
                <p className="text-sm sm:text-base text-foreground/90 leading-relaxed whitespace-pre-line">
                  {selectedItem.description}
                </p>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedItem(null)}
                    className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
                  >
                    बंद करें
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
