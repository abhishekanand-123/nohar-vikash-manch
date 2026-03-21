import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import PageBanner from "@/components/layout/PageBanner";
import { Sparkles } from "lucide-react";
import ramnavamiImg from "@/assets/ramnavami-festival.jpg";
import diwaliImg from "@/assets/diwali-festival.jpg";
import holiImg from "@/assets/holi-festival.jpg";
import chhathImg from "@/assets/chhath-festival.jpg";
import kalipujaImg from "@/assets/kalipuja-festival.jpg";

const categories = ["All", "Diwali", "Holi", "Ramnavami", "Kali Puja", "Chhath Puja", "General"];

const defaultFestivals = [
  { id: "d-ramnavami", title: "Ramnavami", description: "Grand celebration at Lakshmi Narayan Aasthan", image: ramnavamiImg, category: "Ramnavami" },
  { id: "d-diwali", title: "Diwali", description: "Festival of lights celebrated with community feasts", image: diwaliImg, category: "Diwali" },
  { id: "d-holi", title: "Holi", description: "Colors of joy across every lane of Nohar", image: holiImg, category: "Holi" },
  { id: "d-chhath", title: "Chhath Puja", description: "Sacred offerings to the Sun God", image: chhathImg, category: "Chhath Puja" },
  { id: "d-kalipuja", title: "Kali Puja", description: "Night of devotion and spiritual energy", image: kalipujaImg, category: "Kali Puja" },
];

interface Blog {
  id: string;
  title: string;
  content: string | null;
  image: string | null;
  category: string | null;
  created_at: string;
}

export default function Festivals() {
  const [active, setActive] = useState("All");
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("blogs").select("*").order("created_at", { ascending: false });
      setBlogs((data as Blog[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const filteredDefaults = active === "All" ? defaultFestivals : defaultFestivals.filter((f) => f.category === active);
  const filteredBlogs = active === "All" ? blogs : blogs.filter((p) => p.category === active);

  return (
    <div>
      <PageBanner
        icon={Sparkles}
        title="Festival Blog"
        subtitle="Stories and moments from our village celebrations."
      />

      <div className="container mx-auto px-6 py-20">
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

        {/* Default Festival Cards */}
        {filteredDefaults.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredDefaults.map((fest, i) => (
              <motion.div
                key={fest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-card rounded-2xl overflow-hidden shadow-card ring-1 ring-border hover:shadow-lg transition-shadow"
              >
                <div className="aspect-video overflow-hidden">
                  <img src={fest.image} alt={fest.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
                </div>
                <div className="p-5">
                  <h3 className="font-display font-bold text-lg text-foreground">{fest.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{fest.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Blog Posts from Supabase */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : filteredBlogs.length > 0 && (
          <>
            <h3 className="font-display text-xl font-bold text-foreground mb-6">Blog Posts</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBlogs.map((post, i) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card rounded-2xl overflow-hidden shadow-card ring-1 ring-border"
                >
                  {post.image && (
                    <div className="aspect-video overflow-hidden">
                      <img src={post.image} alt={post.title} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  )}
                  <div className="p-6">
                    <span className="text-xs font-semibold text-accent uppercase tracking-wider">{post.category}</span>
                    <h3 className="font-display font-bold text-lg mt-2 mb-2 text-foreground">{post.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{post.content}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{new Date(post.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</span>
                      <span>Nohar Vikash Yuvak Sangh</span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
