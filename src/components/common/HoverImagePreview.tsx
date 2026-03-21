import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

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

  return (
    <>
      <div
        className={containerClassName}
        onMouseEnter={() => canPreview && setOpen(true)}
        onMouseLeave={() => canPreview && setOpen(false)}
      >
        <img src={src} alt={alt} className={imageClassName} loading="lazy" />
      </div>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
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
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
