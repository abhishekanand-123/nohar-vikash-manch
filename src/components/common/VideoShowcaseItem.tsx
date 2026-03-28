import { motion } from "framer-motion";
import VideoEmbed from "./VideoEmbed";

interface VideoShowcaseItemProps {
  title: string;
  description?: string | null;
  embedUrl?: string | null;
  fileUrl?: string | null;
  index: number;
  headingLevel?: "h2" | "h3";
}

export default function VideoShowcaseItem({
  title,
  description,
  embedUrl,
  fileUrl,
  index,
  headingLevel = "h2",
}: VideoShowcaseItemProps) {
  const Heading = headingLevel;

  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-24px" }}
      transition={{ delay: index * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-full min-w-0"
    >
      <div className="relative overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-card via-card to-secondary/30 shadow-[0_22px_56px_-18px_rgba(0,0,0,0.14)] ring-1 ring-primary/[0.07] transition-[box-shadow,ring-color] duration-300 hover:shadow-[0_28px_64px_-16px_rgba(22,163,74,0.14)] hover:ring-primary/20 sm:rounded-2xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-emerald-500 to-accent" aria-hidden />
        <div className="p-3 pb-4 pt-3.5 sm:p-6 md:p-8 lg:p-10">
          <Heading className="font-display text-base font-bold leading-snug tracking-tight text-foreground max-sm:pr-1 sm:text-xl md:text-2xl">
            {title}
          </Heading>
          {description?.trim() && (
            <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:mt-3 sm:text-base">{description}</p>
          )}
          <div className="mt-3 w-full min-w-0 sm:mt-6">
            <VideoEmbed
              embedUrl={embedUrl}
              fileUrl={fileUrl}
              title={title}
              className="aspect-video w-full max-w-full rounded-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ring-2 ring-black/20 sm:rounded-2xl sm:ring-black/30"
            />
          </div>
        </div>
      </div>
    </motion.article>
  );
}
