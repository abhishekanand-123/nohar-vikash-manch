import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import VideoShowcaseItem from "./VideoShowcaseItem";

type VideoRow = Tables<"videos">;
type Placement = VideoRow["placement"];

interface ManagedVideosSectionProps {
  placement: Placement;
  pageKey?: string;
  heading?: string;
  className?: string;
}

export default function ManagedVideosSection({
  placement,
  pageKey,
  heading = "Videos",
  className = "",
}: ManagedVideosSectionProps) {
  const [videos, setVideos] = useState<VideoRow[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      let query = supabase.from("videos").select("*").eq("placement", placement).order("sort_order", { ascending: true });

      if (placement === "page") {
        if (!pageKey) {
          setVideos([]);
          return;
        }
        query = query.eq("page_key", pageKey);
      }

      const { data } = await query;
      if (!cancelled) setVideos((data as VideoRow[]) ?? []);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [placement, pageKey]);

  if (videos.length === 0) return null;

  return (
    <section
      className={`border-t border-border/80 bg-gradient-to-b from-secondary/35 via-secondary/20 to-background py-10 sm:py-14 md:py-16 ${className}`}
    >
      <div className="mx-auto w-full max-w-full pl-[max(0.75rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] sm:max-w-[min(100%,96rem)] sm:pl-5 sm:pr-5 md:pl-8 md:pr-8 lg:max-w-[min(100%,108rem)] lg:pl-10 lg:pr-10 xl:pl-12 xl:pr-12">
        <h2 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl md:text-3xl">
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{heading}</span>
        </h2>
        <p className="mt-1 max-w-2xl text-xs text-muted-foreground sm:text-sm">Tap play — optimized for phones and desktops.</p>
        <div className="mt-6 flex flex-col gap-8 sm:mt-8 sm:gap-10 md:gap-12">
          {videos.map((v, i) => (
            <VideoShowcaseItem
              key={v.id}
              index={i}
              title={v.title}
              description={v.description}
              embedUrl={v.embed_url}
              fileUrl={v.file_url}
              headingLevel="h3"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
