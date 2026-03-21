import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CalendarDays, MapPin, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import HoverImagePreview from "@/components/common/HoverImagePreview";

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

export default function FestivalDetails() {
  const { id } = useParams();
  const [post, setPost] = useState<BlogDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const { data } = await supabase.from("blogs").select("*").eq("id", id).maybeSingle();
      setPost((data as BlogDetails | null) ?? null);
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

  return (
    <div className="container mx-auto px-6 py-14">
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
