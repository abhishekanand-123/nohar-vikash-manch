import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const categories = ["All", "Diwali", "Holi", "Ramnavami", "Kali Puja", "Chhath Puja", "General"];

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

  const filtered = active === "All" ? blogs : blogs.filter((p) => p.category === active);

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

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No blog posts yet. Add posts from the admin dashboard.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post, i) => (
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
        )}
      </div>
    </div>
  );
}
