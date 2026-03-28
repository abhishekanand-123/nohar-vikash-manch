import { useEffect, useState } from "react";
import PageBanner from "@/components/layout/PageBanner";
import VideoShowcaseItem from "@/components/common/VideoShowcaseItem";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Video } from "lucide-react";

type VideoRow = Tables<"videos">;

export default function Videos() {
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("videos")
        .select("*")
        .eq("placement", "site")
        .order("sort_order", { ascending: true });
      setVideos((data as VideoRow[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-secondary/15 to-background">
      <PageBanner
        pageKey="videos"
        icon={Video}
        title="Videos"
        subtitle="Community videos and celebrations from Nohar — edit in Admin → Banners (Videos Page)."
      />

      <section className="w-full pb-14 pt-8 pl-[max(0.75rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] sm:pb-20 sm:pt-12 sm:pl-5 sm:pr-5 md:pl-8 md:pr-8 lg:pl-10 lg:pr-10 xl:pl-12 xl:pr-12">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-11 w-11 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : videos.length === 0 ? (
          <p className="px-2 text-center text-muted-foreground py-20 text-sm sm:text-base">Videos will appear here once added from the admin panel.</p>
        ) : (
          <div className="mx-auto flex w-full max-w-full flex-col gap-7 sm:max-w-[min(100%,96rem)] sm:gap-10 md:gap-12 lg:max-w-[min(100%,108rem)]">
            {videos.map((v, i) => (
              <VideoShowcaseItem
                key={v.id}
                index={i}
                title={v.title}
                description={v.description}
                embedUrl={v.embed_url}
                fileUrl={v.file_url}
                videoId={v.id}
                headingLevel="h2"
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
