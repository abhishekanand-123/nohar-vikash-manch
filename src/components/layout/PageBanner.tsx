import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface PageBannerProps {
  title: string;
  subtitle: string;
  icon?: LucideIcon;
}

export default function PageBanner({ title, subtitle, icon: Icon }: PageBannerProps) {
  return (
    <section className="bg-primary py-16 md:py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {Icon && (
            <div className="flex justify-center mb-4">
              <Icon className="w-12 h-12 text-primary-foreground" />
            </div>
          )}
          <h1 className="text-3xl md:text-5xl font-display font-bold text-primary-foreground">
            {title}
          </h1>
          <p className="text-primary-foreground/80 mt-3 max-w-2xl mx-auto text-sm md:text-base">
            {subtitle}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
