import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import EventCountdown from "@/components/home/EventCountdown";
import ramnavamiFallback from "@/assets/ramnavami.jpg";
import templeImg from "@/assets/temple.jpg";
import PageBanner from "@/components/layout/PageBanner";
import HoverImagePreview from "@/components/common/HoverImagePreview";
import VideoEmbed from "@/components/common/VideoEmbed";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

interface RamnavamiBlog {
  id: string;
  title: string;
  content: string | null;
  image: string | null;
  gallery_images: string[] | null;
  category: string | null;
}

type VideoRow = Tables<"videos">;

const FALLBACK_PARAGRAPHS = [
  "Ramnavami is celebrated as the birth anniversary of Lord Shri Ram. At Lakshmi Narayan Aasthan, a 3-day grand puja is organized with Ashtajam — continuous 8-hour kirtan and bhajan sessions.",
  "Devotees from Nohar and nearby villages gather to participate in the celebrations. Community bhandara (free meal) is organized for all attendees, funded entirely by village donations.",
  "The event includes decorated pandals, flower garlands, night-long bhajan sandhya, and special puja rituals performed by learned pandits.",
];

function paragraphsFromContent(content: string | null): string[] {
  if (!content?.trim()) return FALLBACK_PARAGRAPHS;
  const parts = content
    .split(/\n\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length ? parts : [content.trim()];
}

export default function Ramnavami() {
  const [post, setPost] = useState<RamnavamiBlog | null>(null);
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("blogs")
        .select("id,title,content,image,gallery_images,category")
        .or("category.ilike.%ramnavami%,title.ilike.%ram navami%,title.ilike.%ramnavami%")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setPost((data as RamnavamiBlog | null) ?? null);
      const { data: vids } = await supabase
        .from("videos")
        .select("*")
        .eq("placement", "ramnavami")
        .order("sort_order", { ascending: true });
      setVideos((vids as VideoRow[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const paragraphs = useMemo(() => paragraphsFromContent(post?.content ?? null), [post]);

  const leadImage = post?.image || ramnavamiFallback;

  /** Hero already shows `leadImage`; gallery must only list extra URLs so the same photo is not shown twice. */
  const galleryImages = useMemo(() => {
    if (!post) return [templeImg, ramnavamiFallback].filter((u) => u !== leadImage);
    const extras = Array.from(
      new Set(
        (post.gallery_images ?? []).filter((u): u is string => Boolean(u) && u !== leadImage)
      )
    );
    if (extras.length > 0) return extras;
    return [templeImg, ramnavamiFallback].filter((u) => u !== leadImage);
  }, [post, leadImage]);
  const sectionTitle = post?.title ?? "About the Event";

  return (
    <div>
      <PageBanner
        pageKey="ramnavami"
        title="Ramnavami Puja & Ashtajam"
        subtitle="श्री राम जन्मोत्सव — Grand celebration at Lakshmi Narayan Aasthan, Village Nohar."
      />

      <div className="container mx-auto px-6 py-20">
        <div className="max-w-xl mx-auto bg-card rounded-2xl p-8 shadow-card ring-1 ring-border mb-16">
          <h3 className="font-display font-bold text-xl mb-6 text-center text-foreground">Countdown to Ramnavami</h3>
          <EventCountdown />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <HoverImagePreview
                  src={leadImage}
                  alt={sectionTitle}
                  containerClassName="w-full"
                  imageClassName="rounded-2xl shadow-card w-full"
                />
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <h2 className="font-display font-bold text-2xl mb-4 text-foreground">{sectionTitle}</h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  {paragraphs.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>
                {post?.id && (
                  <p className="mt-6">
                    <Link to={`/festivals/${post.id}`} className="text-primary font-medium hover:underline text-sm">
                      View full festival post →
                    </Link>
                  </p>
                )}
              </motion.div>
            </div>

            {videos.length > 0 && (
              <div className="mb-16 max-w-4xl mx-auto">
                <h2 className="font-display font-bold text-2xl text-center mb-8 text-foreground">Videos</h2>
                <div className="space-y-10">
                  {videos.map((v) => (
                    <motion.div
                      key={v.id}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                    >
                      <h3 className="font-display font-semibold text-lg text-foreground mb-2">{v.title}</h3>
                      {v.description && <p className="text-muted-foreground text-sm mb-3 leading-relaxed">{v.description}</p>}
                      <VideoEmbed embedUrl={v.embed_url} fileUrl={v.file_url} title={v.title} videoId={v.id} />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {galleryImages.length > 0 && (
              <div className="grid md:grid-cols-2 gap-6">
                {galleryImages.map((src, i) => (
                  <HoverImagePreview
                    key={`${src}-${i}`}
                    src={src}
                    alt={`${sectionTitle} — gallery ${i + 1}`}
                    containerClassName="rounded-2xl shadow-card w-full aspect-video overflow-hidden ring-1 ring-border/60"
                    imageClassName="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
