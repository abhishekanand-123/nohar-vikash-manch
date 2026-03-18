import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import heroImg from "@/assets/hero-village.jpg";
import templeImg from "@/assets/temple.jpg";
import sportsImg from "@/assets/sports.jpg";
import diwaliImg from "@/assets/diwali.jpg";
import holiImg from "@/assets/holi.jpg";
import chhathImg from "@/assets/chhath.jpg";

const images = [heroImg, templeImg, sportsImg, diwaliImg, holiImg, chhathImg];

export default function GalleryPreview() {
  return (
    <section className="py-20 bg-secondary/50">
      <div className="container mx-auto px-6">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-accent font-semibold uppercase text-sm tracking-wide">Gallery</span>
            <h2 className="text-section font-display font-bold mt-2 text-foreground">Glimpses of Nohar</h2>
          </div>
          <Link
            to="/gallery"
            className="hidden sm:flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((src, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="aspect-square rounded-xl overflow-hidden shadow-card"
            >
              <img src={src} alt={`Nohar gallery ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
            </motion.div>
          ))}
        </div>
        <Link
          to="/gallery"
          className="sm:hidden flex items-center justify-center gap-2 mt-8 text-sm font-semibold text-primary"
        >
          View All Photos <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
