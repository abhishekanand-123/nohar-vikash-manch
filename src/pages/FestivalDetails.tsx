import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CalendarDays, MapPin, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import HoverImagePreview from "@/components/common/HoverImagePreview";
import VideoEmbed from "@/components/common/VideoEmbed";
import { Tables } from "@/integrations/supabase/types";
import SEO from "@/components/common/SEO";

interface BlogDetails {
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

type VideoRow = Tables<"videos">;

export default function FestivalDetails() {
  const { id } = useParams();
  const [post, setPost] = useState<BlogDetails | null>(null);
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const { data } = await supabase.from("blogs").select("*").eq("id", id).maybeSingle();
      setPost((data as BlogDetails | null) ?? null);
      const { data: vids } = await supabase
        .from("videos")
        .select("*")
        .eq("blog_id", id)
        .eq("placement", "blog")
        .order("sort_order", { ascending: true });
      setVideos((vids as VideoRow[]) ?? []);
      setLoading(false);
    }
    load();
  }, [id]);

  const allImages = useMemo(() => {
    if (!post) return [];
    const list = [post.image, ...(post.gallery_images ?? [])].filter((img): img is string => Boolean(img));
    return Array.from(new Set(list));
  }, [post]);

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-20 flex justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-6 py-20 text-center space-y-3">
        <h1 className="font-display text-3xl font-bold text-foreground">Festival post not found</h1>
        <Link to="/festivals" className="text-primary hover:underline">Back to festivals</Link>
      </div>
    );
  }

  const postDescription = useMemo(() => {
    if (!post) return "";
    if (post.content && post.content.trim()) {
      // Strip markdown/html and excess whitespace
      const clean = post.content
        .replace(/<[^>]*>/g, "")
        .replace(/[#*_~`]/g, "")
        .replace(/\s+/g, " ")
        .trim();
      if (clean.length > 155) {
        const slice = clean.substring(0, 155);
        const lastSpace = slice.lastIndexOf(" ");
        return (lastSpace > 110 ? slice.substring(0, lastSpace) : slice) + "...";
      }
      return clean;
    }
    if (post.highlights && post.highlights.length > 0) {
      return `${post.title}: ${post.highlights.slice(0, 2).join(", ")}. ग्राम नौहर, मधेपुरा, बिहार का पावन उत्सव।`;
    }
    const dateText = post.festival_date ? ` (${post.festival_date})` : "";
    const locText = post.location ? ` | स्थान: ${post.location}` : "";
    return `${post.title}${dateText}${locText} — नोहर विकास मंच द्वारा ग्राम नौहर, मधेपुरा में आयोजित सांस्कृतिक उत्सव का विस्तृत विवरण एवं तस्वीरें।`;
  }, [post]);

  const postKeywords = useMemo(() => {
    if (!post) return "नोहर, त्योहार, ब्लॉग";
    const kw = [
      post.title,
      post.category,
      ...(post.tags || []),
      post.location,
      "नोहर",
      "ग्राम नौहर",
      "मधेपुरा",
      "बिहार",
      "Nohar Vikash Manch",
      "त्योहार ब्लॉग",
    ].filter(Boolean) as string[];
    return Array.from(new Set(kw)).join(", ");
  }, [post]);

  const postOgImage = useMemo(() => {
    if (!post) return undefined;
    if (post.image) return post.image;
    if (post.gallery_images && post.gallery_images.length > 0) return post.gallery_images[0];
    return undefined;
  }, [post]);

  return (
    <div className="container mx-auto px-6 py-14">
      <SEO
        title={post.title}
        description={postDescription}
        ogImage={postOgImage}
        keywords={postKeywords}
        type="article"
        publishedTime={post.created_at}
        section={post.category || "Festivals"}
        tags={post.tags || []}
        canonical={`https://noharvikashmanch.in/festivals/${post.id}`}
      />
      <div className="mb-6">
        <Link to="/festivals" className="text-sm text-primary hover:underline">← Back to festival posts</Link>
      </div>

      <article className="max-w-4xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">{post.category || "Festival"}</p>
        <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mt-2">{post.title}</h1>

        <div className="flex flex-wrap gap-4 mt-5 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1"><CalendarDays className="w-4 h-4" /> {new Date(post.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</span>
          {post.festival_date && <span className="inline-flex items-center gap-1"><CalendarDays className="w-4 h-4" /> {post.festival_date}</span>}
          {post.location && <span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4" /> {post.location}</span>}
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-5">
            {post.tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs uppercase tracking-wide">
                <Tag className="w-3 h-3" /> {tag}
              </span>
            ))}
          </div>
        )}

        {post.content && <p className="text-base md:text-lg text-muted-foreground leading-relaxed mt-8">{post.content}</p>}

        {videos.length > 0 && (
          <div className="mt-10">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">Videos</h2>
            <div className="space-y-8">
              {videos.map((v) => (
                <div key={v.id}>
                  <h3 className="font-display font-semibold text-lg text-foreground mb-2">{v.title}</h3>
                  {v.description && <p className="text-sm text-muted-foreground mb-3">{v.description}</p>}
                  <VideoEmbed embedUrl={v.embed_url} fileUrl={v.file_url} title={v.title} videoId={v.id} />
                </div>
              ))}
            </div>
          </div>
        )}

        {post.highlights && post.highlights.length > 0 && (
          <div className="mt-10">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">Highlights</h2>
            <ul className="space-y-2">
              {post.highlights.map((point, idx) => (
                <li key={`${point}-${idx}`} className="text-muted-foreground">• {point}</li>
              ))}
            </ul>
          </div>
        )}

        {allImages.length > 0 && (
          <div className="mt-10">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">Festival Gallery</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {allImages.map((img, idx) => (
                <HoverImagePreview
                  key={`${img}-${idx}`}
                  src={img}
                  alt={`${post.title} ${idx + 1}`}
                  containerClassName="rounded-xl overflow-hidden aspect-video ring-1 ring-border"
                  imageClassName="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
