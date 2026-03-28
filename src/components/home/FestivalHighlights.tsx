import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import HoverImagePreview from "@/components/common/HoverImagePreview";

interface Blog {
  id: string;
  title: string;
  image: string | null;
  content: string | null;
  category: string | null;
}

export default function FestivalHighlights() {
  const [festivals, setFestivals] = useState<Blog[]>([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("blogs").select("id,title,image,content,category,created_at").order("created_at", { ascending: false }).limit(6);
      setFestivals((data as Blog[]) ?? []);
    }
    load();
  }, []);

  return (
    <section className="py-14 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-12 max-w-2xl mx-auto px-1">
          <span className="text-accent font-semibold uppercase text-sm tracking-wide">हमारी परंपराएँ और उत्सव</span>
          <h2 className="text-section font-display font-bold mt-2 text-foreground">
          एकता के साथ मनाए जाने वाले हमारे त्योहार
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
          {festivals.map((f, i) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to={`/festivals/${f.id}`}
                className="block bg-card rounded-2xl overflow-hidden shadow-card ring-1 ring-border hover:shadow-xl transition-shadow group active:scale-[0.99] sm:active:scale-100"
              >
                {f.image && (
                  <HoverImagePreview
                    src={f.image}
                    alt={f.title}
                    containerClassName="aspect-video overflow-hidden"
                    imageClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                <div className="p-5">
                  <h3 className="font-display font-semibold text-lg text-foreground">{f.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{f.content || "Read latest festival updates from the village."}</p>
                  {f.category && <p className="text-xs text-accent mt-3 uppercase tracking-wide">{f.category}</p>}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        {festivals.length === 0 && (
          <p className="text-muted-foreground text-center py-8">Festival highlights will appear after blog posts are added.</p>
        )}
      </div>
    </section>
  );
}
