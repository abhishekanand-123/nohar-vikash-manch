import { motion } from "framer-motion";
import { useState } from "react";
import { Camera } from "lucide-react";
import PageBanner from "@/components/layout/PageBanner";
import heroImg from "@/assets/hero-village.jpg";
import templeImg from "@/assets/temple.jpg";
import sportsImg from "@/assets/sports.jpg";
import diwaliImg from "@/assets/diwali.jpg";
import holiImg from "@/assets/holi.jpg";
import chhathImg from "@/assets/chhath.jpg";
import kalipujaImg from "@/assets/kalipuja.jpg";
import ramnavamiImg from "@/assets/ramnavami.jpg";

const categories = ["All", "Festival", "Sports", "Village"];

const images = [
  { src: heroImg, title: "Nohar Village", category: "Village" },
  { src: templeImg, title: "Lakshmi Narayan Aasthan", category: "Village" },
  { src: ramnavamiImg, title: "Ramnavami Celebration", category: "Festival" },
  { src: diwaliImg, title: "Diwali Festival", category: "Festival" },
  { src: holiImg, title: "Holi Celebration", category: "Festival" },
  { src: chhathImg, title: "Chhath Puja", category: "Festival" },
  { src: kalipujaImg, title: "Kali Puja", category: "Festival" },
  { src: sportsImg, title: "Cricket Match", category: "Sports" },
];

export default function Gallery() {
  const [active, setActive] = useState("All");
  const filtered = active === "All" ? images : images.filter((img) => img.category === active);

  return (
    <div>
      <PageBanner title="Village Gallery" subtitle="Explore the beauty of Nohar village through our photo collection" icon={Camera} />

      <div className="container mx-auto px-6 py-16">
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                active === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground ring-1 ring-border hover:bg-secondary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {filtered.map((img, i) => (
            <motion.div
              key={img.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="break-inside-avoid rounded-xl overflow-hidden shadow-card ring-1 ring-border group"
            >
              <img src={img.src} alt={img.title} className="w-full group-hover:scale-105 transition-transform duration-300" loading="lazy" />
              <div className="p-3 bg-card">
                <p className="text-sm font-medium text-foreground">{img.title}</p>
                <p className="text-xs text-muted-foreground">{img.category}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
  );
}
