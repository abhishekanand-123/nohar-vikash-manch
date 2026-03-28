import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

interface HoverImagePreviewProps {
  src: string;
  alt: string;
  imageClassName?: string;
  containerClassName?: string;
}

export default function HoverImagePreview({
  src,
  alt,
  imageClassName = "",
  containerClassName = "",
}: HoverImagePreviewProps) {
  const [open, setOpen] = useState(false);
  const [canPreview, setCanPreview] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(hover: hover) and (pointer: fine)");
    const updatePreviewCapability = () => setCanPreview(mql.matches);
    updatePreviewCapability();
    mql.addEventListener("change", updatePreviewCapability);
    return () => mql.removeEventListener("change", updatePreviewCapability);
  }, []);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!open || canPreview) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, canPreview]);

  return (
    <>
      <div
        className={cn(containerClassName, !canPreview && "cursor-pointer touch-manipulation")}
        onMouseEnter={() => canPreview && setOpen(true)}
        onMouseLeave={() => canPreview && setOpen(false)}
        onClick={() => !canPreview && setOpen(true)}
        role={!canPreview ? "button" : undefined}
        tabIndex={!canPreview ? 0 : undefined}
        onKeyDown={(e) => {
          if (!canPreview && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            setOpen(true);
          }
        }}
        aria-label={!canPreview ? `${alt} — view larger` : undefined}
      >
        <img src={src} alt={alt} className={imageClassName} loading="lazy" />
      </div>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && canPreview && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] hidden md:flex items-center justify-center pointer-events-none p-6"
              >
                <div className="absolute inset-0 bg-black/35" />
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 8 }}
                  transition={{ duration: 0.18 }}
                  className="relative w-[min(72vw,820px)] h-[min(68vh,560px)] rounded-2xl overflow-hidden ring-1 ring-white/30 shadow-2xl"
                >
                  <img src={src} alt={alt} className="w-full h-full object-contain bg-black/90" />
                </motion.div>
              </motion.div>
            )}
            {open && !canPreview && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/75 p-4 pointer-events-auto"
                onClick={() => setOpen(false)}
              >
                <button
                  type="button"
                  className="absolute top-4 right-4 z-10 rounded-full bg-background/90 p-2.5 text-foreground shadow-md ring-1 ring-border"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="relative max-h-[min(85vh,100%)] w-full max-w-lg"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img
                    src={src}
                    alt={alt}
                    className="max-h-[min(75vh,560px)] w-full rounded-2xl object-contain bg-black/40 shadow-2xl ring-1 ring-white/20"
                  />
                  <p className="mt-3 text-center text-sm font-medium text-white">{alt}</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
