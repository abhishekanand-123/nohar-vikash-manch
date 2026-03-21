import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PageBanner from "@/components/layout/PageBanner";
import { Sparkles } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import HoverImagePreview from "@/components/common/HoverImagePreview";

interface Blog {
  id: string;
  title: string;
  content: string | null;
  image: string | null;
  gallery_images: string[] | null;
  category: string | null;
  tags: string[] | null;
  highlights: string[] | null;
  location: string | null;
  festival_date: string | null;
  created_at: string;
}

type Event = Tables<"events">;

export default function Festivals() {
  const [active, setActive] = useState("All");
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data: blogsData }, { data: eventsData }] = await Promise.all([
        supabase.from("blogs").select("*").order("created_at", { ascending: false }),
        supabase.from("events").select("*").order("date", { ascending: true }),
      ]);
      setBlogs((blogsData as Blog[]) ?? []);
      setEvents((eventsData as Event[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const categories = [
    "All",
    ...Array.from(new Set(blogs.map((p) => p.category?.trim()).filter((category): category is string => Boolean(category)))),
  ];
  const filteredBlogs = active === "All" ? blogs : blogs.filter((p) => p.category === active);

  return (
    <div>
      <PageBanner
        pageKey="festivals"
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

        {/* Blog posts from admin panel */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {filteredBlogs.length > 0 && (
              <>
                <h3 className="font-display text-xl font-bold text-foreground mb-6">Blog Posts</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
                  {filteredBlogs.map((post, i) => (
                    <motion.article
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-card rounded-2xl overflow-hidden shadow-card ring-1 ring-border hover:shadow-xl transition-shadow"
                    >
                      {post.image && (
                        <HoverImagePreview
                          src={post.image}
                          alt={post.title}
                          containerClassName="aspect-video overflow-hidden"
                          imageClassName="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                      )}
                      <div className="p-6">
                        <span className="text-xs font-semibold text-accent uppercase tracking-wider">{post.category}</span>
                        <h3 className="font-display font-bold text-lg mt-2 mb-2 text-foreground">{post.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{post.content}</p>
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="text-[10px] uppercase tracking-wide px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{new Date(post.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</span>
                          <Link to={`/festivals/${post.id}`} className="text-primary font-medium hover:underline">Read Details</Link>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              </>
            )}
            {filteredBlogs.length === 0 && (
              <p className="text-muted-foreground text-center py-8">No blog posts available yet.</p>
            )}
            <div className="mt-14">
              <h3 className="font-display text-xl font-bold text-foreground mb-6">Village Events</h3>
              {events.length === 0 ? (
                <p className="text-muted-foreground">No events added yet.</p>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
                  {events.map((event, i) => (
                    <motion.article
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="bg-card rounded-2xl overflow-hidden shadow-card ring-1 ring-border hover:shadow-xl transition-shadow"
                    >
                      {event.image && (
                        <HoverImagePreview
                          src={event.image}
                          alt={event.title}
                          containerClassName="aspect-video overflow-hidden"
                          imageClassName="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                      )}
                      <div className="p-6">
                        <h3 className="font-display font-bold text-lg text-foreground">{event.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {event.date ? new Date(event.date).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }) : "Date to be announced"}
                        </p>
                        <p className="text-sm text-muted-foreground mt-3 line-clamp-3">{event.description || "More details will be shared soon."}</p>
                      </div>
                    </motion.article>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
