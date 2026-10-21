import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import HoverImagePreview from "@/components/common/HoverImagePreview";

interface GalleryItem {
  id: string;
  image: string;
  title: string | null;
}

export default function GalleryPreview() {
  const [images, setImages] = useState<GalleryItem[]>([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("gallery").select("id,image,title,created_at").order("created_at", { ascending: false }).limit(6);
      setImages((data as GalleryItem[]) ?? []);
    }
    load();
  }, []);

  return (
    <section className="py-8 sm:py-16 bg-secondary/40 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6 sm:mb-10 text-center sm:text-left">
          <div className="max-w-xl mx-auto sm:mx-0">
            <span className="text-accent font-semibold uppercase text-xs sm:text-sm tracking-wide">Gallery</span>
            <h2 className="text-xl sm:text-3xl font-display font-bold mt-1 text-foreground">Glimpses of Nohar</h2>
          </div>
          <Link
            to="/gallery"
            className="hidden sm:flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-5">
          {images.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="aspect-square rounded-xl overflow-hidden shadow-card ring-1 ring-border/60 bg-muted"
            >
              <HoverImagePreview
                src={item.image}
                alt={item.title || `Nohar gallery ${i + 1}`}
                containerClassName="w-full h-full overflow-hidden"
                imageClassName="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </motion.div>
          ))}
        </div>
        {images.length === 0 && <p className="text-muted-foreground text-center py-6 text-sm">Gallery images will appear here soon.</p>}
        <Link
          to="/gallery"
          className="sm:hidden flex items-center justify-center gap-2 mt-5 min-h-[44px] text-xs sm:text-sm font-semibold text-primary rounded-full px-5 py-2.5 bg-primary/10 hover:bg-primary/20 active:scale-98 transition-all"
        >
          View All Photos <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
