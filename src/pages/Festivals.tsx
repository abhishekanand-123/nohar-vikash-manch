import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PageBanner from "@/components/layout/PageBanner";
import { Sparkles, Calendar, Filter, Search } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import HoverImagePreview from "@/components/common/HoverImagePreview";
import SEO from "@/components/common/SEO";

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

function getPostYear(post: Blog): string {
  if (post.festival_date) {
    const yearMatch = post.festival_date.match(/\b(20\d{2})\b/);
    if (yearMatch) return yearMatch[1];
  }
  return new Date(post.created_at).getFullYear().toString();
}

export default function Festivals() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeYear, setActiveYear] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
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

  const categories = useMemo(() => [
    "All",
    ...Array.from(
      new Set(
        blogs.map((p) => p.category?.trim()).filter((category): category is string => Boolean(category))
      )
    ),
  ], [blogs]);

  const years = useMemo(() => {
    const ySet = new Set<string>();
    blogs.forEach((b) => ySet.add(getPostYear(b)));
    return ["All", ...Array.from(ySet).sort((a, b) => Number(b) - Number(a))];
  }, [blogs]);

  const filteredBlogs = useMemo(() => {
    return blogs.filter((p) => {
      const matchesCategory = activeCategory === "All" || p.category === activeCategory;
      const matchesYear = activeYear === "All" || getPostYear(p) === activeYear;
      const matchesSearch =
        !searchQuery.trim() ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.content && p.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

      return matchesCategory && matchesYear && matchesSearch;
    });
  }, [blogs, activeCategory, activeYear, searchQuery]);

  return (
    <div>
      <SEO
        title="Festivals & Cultural Highlights"
        description="Celebrations, memories, photo stories, and blogs of Durga Puja, Ramnavami, Chhath Puja, and cultural festivals in Village Nohar."
        keywords="Nohar Festivals, Durga Puja Nohar, Ramnavami, Chhath Puja, Bihar Culture, Festival Blog"
      />
      <PageBanner
        pageKey="festivals"
        icon={Sparkles}
        title="Festival Blog"
        subtitle="Stories and moments from our village celebrations."
      />

      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
        {/* Search & Filter Header */}
        <div className="max-w-4xl mx-auto mb-10 space-y-5">
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="त्यौहार या पोस्ट खोजें (Search festivals)..."
              className="w-full pl-11 pr-4 py-2.5 rounded-full bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
            />
          </div>

          {/* Year Filter Buttons */}
          {years.length > 2 && (
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mr-1">
                <Calendar className="w-3.5 h-3.5" /> वर्ष (Year):
              </span>
              {years.map((year) => (
                <button
                  key={year}
                  onClick={() => setActiveYear(year)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    activeYear === year
                      ? "bg-primary text-primary-foreground shadow-sm scale-105"
                      : "bg-card text-muted-foreground border border-border hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {year === "All" ? "सभी वर्ष (All Years)" : year}
                </button>
              ))}
            </div>
          )}

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" /> श्रेणी (Category):
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-accent text-accent-foreground font-semibold shadow-sm"
                    : "bg-card text-muted-foreground border border-border hover:bg-secondary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Blog posts */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {filteredBlogs.length > 0 && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-xl font-bold text-foreground">
                    Blog Posts {activeYear !== "All" ? `(${activeYear})` : ""}
                  </h3>
                  <span className="text-xs text-muted-foreground">{filteredBlogs.length} posts found</span>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
                  <AnimatePresence mode="popLayout">
                    {filteredBlogs.map((post, i) => {
                      const year = getPostYear(post);
                      return (
                        <motion.article
                          key={post.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: i * 0.05 }}
                          className="bg-card rounded-2xl overflow-hidden shadow-card ring-1 ring-border hover:shadow-xl transition-all flex flex-col group"
                        >
                          {post.image && (
                            <HoverImagePreview
                              src={post.image}
                              alt={post.title}
                              containerClassName="aspect-video overflow-hidden relative"
                              imageClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          )}
                          <div className="p-6 flex-1 flex flex-col">
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                                {post.category || "Festival"}
                              </span>
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {year}
                              </span>
                            </div>

                            <h3 className="font-display font-bold text-lg mt-1 mb-2 text-foreground group-hover:text-primary transition-colors">
                              {post.title}
                            </h3>

                            <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">{post.content}</p>

                            {post.tags && post.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-4">
                                {post.tags.slice(0, 3).map((tag) => (
                                  <span
                                    key={tag}
                                    className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                              <span>
                                {post.festival_date ||
                                  new Date(post.created_at).toLocaleDateString("en-IN", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                              </span>
                              <Link to={`/festivals/${post.id}`} className="text-primary font-medium hover:underline">
                                Read Details →
                              </Link>
                            </div>
                          </div>
                        </motion.article>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </>
            )}

            {filteredBlogs.length === 0 && (
              <div className="text-center py-12 bg-card rounded-2xl border border-dashed border-border max-w-md mx-auto">
                <p className="text-muted-foreground text-sm">इस वर्ष या श्रेणी में कोई ब्लॉग पोस्ट नहीं मिली।</p>
                <button
                  onClick={() => {
                    setActiveCategory("All");
                    setActiveYear("All");
                    setSearchQuery("");
                  }}
                  className="mt-3 text-xs text-primary font-semibold hover:underline"
                >
                  सभी पोस्ट देखें (Reset Filters)
                </button>
              </div>
            )}

            {/* Village Events Section */}
            <div className="mt-16 pt-12 border-t border-border">
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
                          {event.date
                            ? new Date(event.date).toLocaleDateString("en-IN", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : "Date to be announced"}
                        </p>
                        <p className="text-sm text-muted-foreground mt-3 line-clamp-3">
                          {event.description || "More details will be shared soon."}
                        </p>
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
