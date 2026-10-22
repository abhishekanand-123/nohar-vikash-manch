import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PageBanner from "@/components/layout/PageBanner";
import { Sparkles, Calendar, Filter, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import HoverImagePreview from "@/components/common/HoverImagePreview";
import SEO from "@/components/common/SEO";
import GramUdyogBlogWidget from "@/components/common/GramUdyogBlogWidget";
import RichContentView, { stripHtmlToPlainText } from "@/components/common/RichContentView";

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

const ITEMS_PER_PAGE = 6;

export default function Festivals() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeYear, setActiveYear] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
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

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, activeYear, searchQuery]);

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

  const totalPages = Math.max(1, Math.ceil(filteredBlogs.length / ITEMS_PER_PAGE));

  const paginatedBlogs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBlogs.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBlogs, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const blogHeader = document.getElementById("blog-list-top");
    if (blogHeader) {
      blogHeader.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div>
      <SEO
        title="त्योहार एवं उत्सव ब्लॉग (Festivals & Celebrations)"
        description="ग्राम नौहर के पावन पर्व, दुर्गा पूजा, रामनवमी, छठ पूजा, कृष्ण जन्माष्टमी और सांस्कृतिक संध्या की यादें, तस्वीरें व विस्तृत ब्लॉग।"
        keywords="त्योहार, नोहर दुर्गा पूजा, नोहर रामनवमी, छठ पूजा नोहर, Nohar Festivals, Bihar Culture, ग्राम नौहर पर्व"
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
                <div id="blog-list-top" className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 scroll-mt-24">
                  <h3 className="font-display text-xl font-bold text-foreground">
                    Blog Posts {activeYear !== "All" ? `(${activeYear})` : ""}
                  </h3>
                  <span className="text-xs text-muted-foreground font-medium">
                    कुल {filteredBlogs.length} ब्लॉग (पेज {currentPage} / {totalPages})
                  </span>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
                  {paginatedBlogs.map((post) => {
                    const year = getPostYear(post);
                    const cleanContent = stripHtmlToPlainText(post.content);
                    const rawSnippet = cleanContent;
                    return (
                      <motion.article
                        key={post.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="bg-card rounded-2xl overflow-hidden shadow-card ring-1 ring-border hover:shadow-xl transition-shadow flex flex-col group"
                      >
                        {post.image && (
                          <div className="relative aspect-[16/10] sm:aspect-video overflow-hidden bg-slate-100 dark:bg-slate-900/60 border-b border-border flex items-center justify-center p-2 sm:p-2.5 pr-3 sm:pr-2.5">
                            {/* Foreground image - object-contain with right margin preserves full banner without cropping */}
                            <img
                              src={post.image}
                              alt={post.title}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full max-w-full max-h-full object-contain rounded-lg md:group-hover:scale-[1.01] transition-transform duration-300"
                            />
                          </div>
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

                            <h3 className="font-display font-bold text-lg mt-1 mb-2 text-foreground group-hover:text-primary transition-colors line-clamp-2">
                              {post.title}
                            </h3>

                            <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1 leading-relaxed">
                              {rawSnippet || "ब्लॉग का विस्तृत विवरण पढ़ने के लिए नीचे दिए गए लिंक पर क्लिक करें..."}
                            </p>

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
                              <Link to={`/festivals/${post.id}`} className="text-primary font-semibold hover:underline">
                                Read Details →
                              </Link>
                            </div>
                          </div>
                        </motion.article>
                      );
                    })}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border pt-6">
                    <p className="text-xs text-muted-foreground">
                      दिखाए जा रहे हैं {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
                      {Math.min(currentPage * ITEMS_PER_PAGE, filteredBlogs.length)} (कुल {filteredBlogs.length} में से)
                    </p>

                    <div className="flex items-center gap-1.5 flex-wrap justify-center">
                      {/* Previous Page */}
                      <button
                        type="button"
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-card border border-border text-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>पिछला (Prev)</span>
                      </button>

                      {/* Numbered Page Buttons */}
                      {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                            currentPage === pageNum
                              ? "bg-primary text-primary-foreground shadow-sm scale-105"
                              : "bg-card border border-border text-foreground hover:bg-secondary"
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}

                      {/* Next Page */}
                      <button
                        type="button"
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-card border border-border text-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <span>अगला (Next)</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Gram Udyog Widget on Blog Page (Shows 3 services related to Gram Udyog) */}
            <GramUdyogBlogWidget
              limit={3}
              title="ग्राम उद्योग एवं कामगार डायरेक्टरी"
              subtitle="गाँव नोहर के शिक्षक, मिस्त्री, इलेक्ट्रीशियन, स्वास्थ्य कर्मी व कामगारों से सीधे संपर्क करें।"
            />

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
                        <div className="text-sm text-muted-foreground mt-3 line-clamp-3">
                          {event.description ? (
                            <RichContentView content={event.description} compact />
                          ) : (
                            "More details will be shared soon."
                          )}
                        </div>
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
