import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
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
    // Check if device supports hover pointer
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

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <>
      <div
        className={cn(containerClassName, "relative overflow-hidden cursor-pointer")}
        onMouseEnter={() => canPreview && setOpen(true)}
        onMouseLeave={() => canPreview && setOpen(false)}
        onClick={() => setOpen((prev) => !prev)}
        title="बड़ी तस्वीर देखने के लिए क्लिक या होवर करें"
      >
        <img
          src={src}
          alt={alt}
          className={imageClassName}
          loading="lazy"
          decoding="async"
        />
      </div>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOpen(false)}
                className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm cursor-zoom-out"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 8 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative w-full max-w-2xl max-h-[85vh] rounded-2xl overflow-hidden ring-1 ring-white/20 shadow-2xl bg-black/95 flex flex-col items-center justify-center p-3 cursor-default"
                >
                  {/* Close button for touch/mobile and desktop */}
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close image preview"
                    className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/70 text-white/90 hover:text-white hover:bg-black/95 flex items-center justify-center transition-all border border-white/20"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <img
                    src={src}
                    alt={alt}
                    className="w-full h-auto max-h-[75vh] object-contain rounded-xl"
                    loading="lazy"
                  />
                  {alt && (
                    <p className="mt-2 text-xs text-white/80 font-medium text-center truncate max-w-[90%] px-2">
                      {alt}
                    </p>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
