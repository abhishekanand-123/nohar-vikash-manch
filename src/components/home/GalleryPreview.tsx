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
    <section className="py-14 sm:py-20 bg-secondary/50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 sm:mb-12 text-center sm:text-left">
          <div className="max-w-xl mx-auto sm:mx-0">
            <span className="text-accent font-semibold uppercase text-sm tracking-wide">Gallery</span>
            <h2 className="text-section font-display font-bold mt-2 text-foreground">Glimpses of Nohar</h2>
          </div>
          <Link
            to="/gallery"
            className="hidden sm:flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
          {images.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="aspect-square rounded-xl overflow-hidden shadow-card ring-1 ring-border/60"
            >
              <HoverImagePreview
                src={item.image}
                alt={item.title || `Nohar gallery ${i + 1}`}
                containerClassName="w-full h-full overflow-hidden"
                imageClassName="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
              />
            </motion.div>
          ))}
        </div>
        {images.length === 0 && <p className="text-muted-foreground text-center py-6">Gallery images will appear here soon.</p>}
        <Link
          to="/gallery"
          className="sm:hidden flex items-center justify-center gap-2 mt-8 min-h-[48px] text-sm font-semibold text-primary rounded-full px-5 py-3 bg-primary/10"
        >
          View All Photos <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
