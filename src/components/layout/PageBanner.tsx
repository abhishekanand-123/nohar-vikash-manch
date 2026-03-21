import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { LucideIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

interface PageBannerProps {
  pageKey: string;
  title: string;
  subtitle: string;
  icon?: LucideIcon;
}

type PageBannerRow = Tables<"page_banners">;

export default function PageBanner({ pageKey, title, subtitle, icon: Icon }: PageBannerProps) {
  const [banner, setBanner] = useState<PageBannerRow | null>(null);

  useEffect(() => {
    async function loadBanner() {
      const { data } = await supabase
        .from("page_banners")
        .select("*")
        .eq("page_key", pageKey)
        .eq("is_active", true)
        .maybeSingle();
      setBanner((data as PageBannerRow | null) ?? null);
    }
    loadBanner();
  }, [pageKey]);

  const resolvedTitle = banner?.title || title;
  const resolvedSubtitle = banner?.subtitle || subtitle;
  const bgImage = banner?.bg_image || null;

  return (
    <section className="relative bg-primary py-16 md:py-20 overflow-hidden">
      {bgImage && (
        <>
          <img src={bgImage} alt={resolvedTitle} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-primary/75" />
        </>
      )}
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center relative z-10"
        >
          {Icon && (
            <div className="flex justify-center mb-4">
              <Icon className="w-12 h-12 text-primary-foreground" />
            </div>
          )}
          <h1 className="text-3xl md:text-5xl font-display font-bold text-primary-foreground">
            {resolvedTitle}
          </h1>
          <p className="text-primary-foreground/80 mt-3 max-w-2xl mx-auto text-sm md:text-base">
            {resolvedSubtitle}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
