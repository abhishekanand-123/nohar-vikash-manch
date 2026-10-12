import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SocialLinksData {
  instagram: string;
  facebook: string;
  is_active: boolean;
}

const DEFAULT_LINKS: SocialLinksData = {
  instagram: "https://www.instagram.com/",
  facebook: "https://www.facebook.com/",
  is_active: true,
};

export function useSocialLinks() {
  return useQuery<SocialLinksData>({
    queryKey: ["social_links"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("page_banners")
          .select("*")
          .eq("page_key", "social_links")
          .maybeSingle();

        if (error && error.code !== "PGRST116") {
          console.warn("Could not fetch social links from page_banners:", error);
          return DEFAULT_LINKS;
        }

        if (!data) {
          return DEFAULT_LINKS;
        }

        let instagram = data.title || "";
        let facebook = data.subtitle || "";
        const isActive = data.is_active ?? true;

        if (data.bg_image) {
          try {
            const parsed = JSON.parse(data.bg_image);
            if (parsed.instagram) instagram = parsed.instagram;
            if (parsed.facebook) facebook = parsed.facebook;
          } catch {
            // Not JSON, fallback to title & subtitle
          }
        }

        return {
          instagram: instagram || DEFAULT_LINKS.instagram,
          facebook: facebook || DEFAULT_LINKS.facebook,
          is_active: isActive,
        };
      } catch (e) {
        console.error("Error in useSocialLinks:", e);
        return DEFAULT_LINKS;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 min
  });
}
