import { motion } from "framer-motion";
import { useState } from "react";
import diwaliImg from "@/assets/diwali.jpg";
import holiImg from "@/assets/holi.jpg";
import chhathImg from "@/assets/chhath.jpg";
import kalipujaImg from "@/assets/kalipuja.jpg";
import ramnavamiImg from "@/assets/ramnavami.jpg";

const categories = ["All", "Diwali", "Holi", "Ramnavami", "Kali Puja", "Chhath Puja"];

const blogPosts = [
  { id: 1, title: "Ramnavami Mahotsav 2026", category: "Ramnavami", image: ramnavamiImg, desc: "Grand celebration at Lakshmi Narayan Aasthan with devotees from nearby villages.", date: "March 27, 2026", author: "Nohar Vikash Yuvak Sangh" },
  { id: 2, title: "Diwali Celebration in Nohar", category: "Diwali", image: diwaliImg, desc: "The entire village lit up with thousands of diyas. Community feast was organized for all.", date: "November 1, 2025", author: "Nohar Vikash Yuvak Sangh" },
  { id: 3, title: "Holi: Colors of Unity", category: "Holi", image: holiImg, desc: "Colors, music, and dance — Nohar's Holi is a spectacle of joy and togetherness.", date: "March 14, 2025", author: "Nohar Vikash Yuvak Sangh" },
  { id: 4, title: "Chhath Puja at Village Ghat", category: "Chhath Puja", image: chhathImg, desc: "Devotees offered prayers to the Sun God at the village ghat during the sacred Chhath Puja.", date: "November 7, 2025", author: "Nohar Vikash Yuvak Sangh" },
  { id: 5, title: "Kali Puja Night Celebration", category: "Kali Puja", image: kalipujaImg, desc: "A night filled with devotion, prayers, and community togetherness at Nohar's Kali temple.", date: "October 20, 2025", author: "Nohar Vikash Yuvak Sangh" },
];

export default function Festivals() {
  const [active, setActive] = useState("All");
  const filtered = active === "All" ? blogPosts : blogPosts.filter((p) => p.category === active);

  return (
    <div className="py-20">
      <div className="container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <span className="text-accent font-semibold uppercase text-sm tracking-wide">Celebrations</span>
          <h1 className="text-section font-display font-bold mt-2 text-foreground">Festival Blog</h1>
          <p className="text-muted-foreground mt-2 max-w-lg mx-auto">Stories and moments from our village celebrations.</p>
        </motion.div>

        {/* Category Filter */}
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

        {/* Blog Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((post, i) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl overflow-hidden shadow-card ring-1 ring-border"
            >
              <div className="aspect-video overflow-hidden">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="p-6">
                <span className="text-xs font-semibold text-accent uppercase tracking-wider">{post.category}</span>
                <h3 className="font-display font-bold text-lg mt-2 mb-2 text-foreground">{post.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{post.desc}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{post.date}</span>
                  <span>{post.author}</span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
}
