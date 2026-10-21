import { useState, useEffect } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function QuickScrollNavigator() {
  const [showTop, setShowTop] = useState(false);
  const [showBottom, setShowBottom] = useState(true);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY || document.documentElement.scrollTop;
          const scrollHeight = document.documentElement.scrollHeight;
          const clientHeight = document.documentElement.clientHeight;

          // Show top button if scrolled down more than 200px
          setShowTop(scrollY > 200);

          // Show bottom button if not near the bottom
          setShowBottom(scrollY + clientHeight < scrollHeight - 220);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Initial check
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  // If page is so short that neither top nor bottom applies, don't render
  if (!showTop && !showBottom) return null;

  return (
    <div
      className="fixed bottom-6 right-4 sm:bottom-8 sm:right-6 z-40 flex flex-col gap-2 items-center pointer-events-auto"
      role="navigation"
      aria-label="Quick Page Scroll"
    >
      <AnimatePresence>
        {/* Scroll to Top Button */}
        {showTop && (
          <motion.button
            key="scroll-top-btn"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2 }}
            type="button"
            onClick={scrollToTop}
            aria-label="Scroll to top of page"
            title="पेज के सबसे ऊपर जाएँ (Scroll to Top)"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-primary text-primary-foreground shadow-xl flex items-center justify-center ring-2 ring-background hover:bg-primary/90 active:scale-95 transition-all group backdrop-blur-md"
          >
            <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
          </motion.button>
        )}

        {/* Scroll to Bottom Button */}
        {showBottom && (
          <motion.button
            key="scroll-bottom-btn"
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={{ duration: 0.2 }}
            type="button"
            onClick={scrollToBottom}
            aria-label="Scroll to bottom of page"
            title="पेज के सबसे नीचे जाएँ (Scroll to Bottom)"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-card/90 backdrop-blur-md text-foreground shadow-lg flex items-center justify-center border border-border/80 hover:bg-secondary active:scale-95 transition-all group"
          >
            <ArrowDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-y-0.5 transition-all" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
