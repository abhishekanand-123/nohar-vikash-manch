import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import EventCountdown from "./EventCountdown";
import heroImg from "@/assets/hero-village.jpg";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type PageBanner = Tables<"page_banners">;

export default function Hero() {
  const [homeBanner, setHomeBanner] = useState<PageBanner | null>(null);

  useEffect(() => {
    async function loadHomeBanner() {
      const { data } = await supabase
        .from("page_banners")
        .select("*")
        .eq("page_key", "home")
        .eq("is_active", true)
        .maybeSingle();
      setHomeBanner((data as PageBanner | null) ?? null);
    }
    loadHomeBanner();
  }, []);

  const heroTitle = homeBanner?.title || "Empowering Nohar, Preserving Heritage";
  const heroSubtitle =
    homeBanner?.subtitle ||
    "A thriving agriculture-based community in Madhepura, Bihar. Managed with care by Nohar Vikash Yuvak Sangh.";
  const heroBackground = homeBanner?.bg_image || heroImg;

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroBackground}
          alt="Nohar Village"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
      </div>

      <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-[1fr_auto] gap-8 items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-primary font-semibold tracking-widest uppercase text-sm">
            Welcome to Nohar Village
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl mt-4 mb-6 font-display font-bold text-white leading-tight">
            {heroTitle}
          </h1>
          <p className="text-lg text-white/80 max-w-[50ch] mb-8 leading-relaxed">
            {heroSubtitle}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/about"
              className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-semibold hover:opacity-90 transition-opacity text-sm inline-flex items-center gap-2"
            >
              Explore Our Story <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/donation"
              className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-full font-semibold hover:bg-white/20 transition-colors text-sm ring-1 ring-white/30"
            >
              Support Us
            </Link>
          </div>
        </motion.div>

        {/* Countdown Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="hidden lg:block"
        >
          <div className="bg-white rounded-2xl p-6 shadow-xl min-w-[280px]">
            <EventCountdown />
          </div>
        </motion.div>
      </div>

    </section>
  );
}
