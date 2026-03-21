import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Camera } from "lucide-react";
import PageBanner from "@/components/layout/PageBanner";
import { supabase } from "@/integrations/supabase/client";
import HoverImagePreview from "@/components/common/HoverImagePreview";

interface GalleryItem {
  id: string;
  image: string;
  title: string | null;
  category: string | null;
}

export default function Gallery() {
  const [active, setActive] = useState("All");
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("gallery").select("*").order("created_at", { ascending: false });
      setImages((data as GalleryItem[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(images.map((img) => img.category?.trim()).filter((category): category is string => Boolean(category)))
    );
    return ["All", ...uniqueCategories];
  }, [images]);

  const filtered = active === "All" ? images : images.filter((img) => img.category === active);

  return (
    <div>
      <PageBanner pageKey="gallery" title="Village Gallery" subtitle="Explore the beauty of Nohar village through our photo collection" icon={Camera} />

      <div className="container mx-auto px-6 py-16">
        <div className="max-w-6xl mx-auto mb-10 text-center">
          <p className="text-sm text-muted-foreground">
            Hover any photo to preview full image. New uploads from admin appear automatically.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                active === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground ring-1 ring-border hover:bg-secondary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5 max-w-6xl mx-auto">
          {filtered.map((img, i) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="break-inside-avoid rounded-2xl overflow-hidden shadow-card ring-1 ring-border/60 bg-card group hover:shadow-xl transition-all duration-300"
            >
              <HoverImagePreview
                src={img.image}
                alt={img.title ?? "Gallery image"}
                containerClassName="relative overflow-hidden"
                imageClassName="w-full group-hover:scale-105 transition-transform duration-500"
              />
              <div className="p-3 bg-card">
                <p className="text-sm font-medium text-foreground">{img.title || "Nohar Gallery"}</p>
                <p className="text-xs text-muted-foreground">{img.category || "General"}</p>
              </div>
            </motion.div>
          ))}
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <p className="text-muted-foreground text-center py-8">No gallery images available yet.</p>
        )}
      </div>
    </div>
  );
}
