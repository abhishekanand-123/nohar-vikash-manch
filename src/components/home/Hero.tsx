import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import EventCountdown from "./EventCountdown";
import heroImg from "@/assets/hero-village.jpg";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type PageBanner = Tables<"page_banners">;

/** Splits title on comma or em-dash so the second part reads as a warm accent (reference: hero emphasis lines). */
function AccentHeroTitle({ title }: { title: string }) {
  const comma = title.indexOf(",");
  const em = title.indexOf("—");

  let head = title.trim();
  let tail: string | null = null;

  if (comma !== -1 && (em === -1 || comma < em)) {
    head = title.slice(0, comma).trim();
    tail = title.slice(comma + 1).trim();
  } else if (em !== -1) {
    head = title.slice(0, em).trim();
    tail = title.slice(em + 1).trim();
  }

  if (tail) {
    return (
      <>
        <span className="block text-white [text-shadow:0_2px_28px_rgba(0,0,0,0.55)] sm:inline sm:mr-1.5">{head}</span>
        <span className="mt-1.5 block bg-gradient-to-r from-amber-100 via-accent to-emerald-300 bg-clip-text text-transparent sm:mt-0 sm:inline sm:max-w-[95%] [filter:drop-shadow(0_4px_24px_rgba(251,146,60,0.42))]">
          {tail}
        </span>
      </>
    );
  }

  return <span className="text-white [text-shadow:0_2px_28px_rgba(0,0,0,0.55)]">{title}</span>;
}

export default function Hero() {
  const [homeBanner, setHomeBanner] = useState<PageBanner | null>(null);
  const prefersReducedMotion = useReducedMotion();

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

  const titleMotion = prefersReducedMotion
    ? {}
    : {
        scale: [1, 1.03, 1],
        textShadow: [
          "0 0 0px rgba(255,255,255,0)",
          "0 0 36px rgba(255,255,255,0.4)",
          "0 0 0px rgba(255,255,255,0)",
        ],
      };

  const titleTransition = prefersReducedMotion
    ? undefined
    : { duration: 2.4, repeat: Infinity, ease: "easeInOut" as const };

  return (
    <section className="relative min-h-[min(92svh,880px)] sm:min-h-[90vh] flex items-center overflow-hidden pb-8 sm:pb-0">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroBackground}
          alt="Nohar Village"
          className="w-full h-full object-cover object-center scale-105 sm:scale-100"
        />
        <div className="absolute inset-0 hero-gradient-scrim" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10 grid lg:grid-cols-[1fr_auto] gap-8 lg:gap-10 items-center w-full max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="text-center sm:text-left pt-2 sm:pt-0"
        >
          <span className="inline-block text-primary font-semibold tracking-[0.2em] uppercase text-[11px] sm:text-sm animate-welcome-pop motion-reduce:animate-none drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)] transition-transform duration-300 lg:hover:scale-105 lg:hover:text-emerald-200">
            नौहर गाँव में आपका स्वागत है
          </span>

          <motion.h1
            className="text-[1.65rem] leading-tight sm:text-4xl md:text-5xl lg:text-6xl mt-4 sm:mt-5 mb-5 sm:mb-6 font-display font-bold max-w-[24ch] sm:max-w-none mx-auto sm:mx-0"
            animate={titleMotion}
            transition={titleTransition}
          >
            <AccentHeroTitle title={heroTitle} />
          </motion.h1>

          <p className="text-[15px] sm:text-lg text-white/90 max-w-[52ch] mb-7 sm:mb-8 leading-relaxed mx-auto sm:mx-0 [text-shadow:0_1px_18px_rgba(0,0,0,0.45)]">
            {heroSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap items-start gap-3 sm:items-center sm:gap-4 w-full sm:w-auto">
            <Link to="/about" className="hero-cta-primary">
              <span className="inline-flex items-center justify-center gap-2">
                Explore Our Story <ArrowRight className="h-4 w-4 shrink-0" />
              </span>
            </Link>

            <Link
              to="/donation"
              className="hero-cta-ghost group max-sm:motion-safe:animate-border-glow motion-reduce:max-sm:animate-none max-sm:ring-2 max-sm:ring-white/25"
            >
              <span className="relative z-[1] transition-colors duration-300 group-hover:text-white">
                Support Us
              </span>
            </Link>
          </div>

          {/* Countdown Card (mobile/tablet) */}
          <div className="mt-8 lg:hidden w-full max-w-[400px] mx-auto sm:mx-0 sm:max-w-[360px]">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-xl ring-1 ring-black/5 transition-shadow duration-300 hover:shadow-2xl">
              <EventCountdown />
            </div>
          </div>
        </motion.div>

        {/* Countdown Card (desktop) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="hidden lg:block justify-self-end"
        >
          <div className="bg-white rounded-2xl p-6 shadow-xl min-w-[280px] ring-1 ring-black/5 transition-all duration-300 hover:shadow-2xl hover:ring-primary/20">
            <EventCountdown />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
