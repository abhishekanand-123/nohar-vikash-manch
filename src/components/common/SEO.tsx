import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
}

export default function SEO({ title, description, keywords, ogImage }: SEOProps) {
  const location = useLocation();

  useEffect(() => {
    const defaultTitle = "NoharVikashManch — Empowering Our Village";
    const fullTitle = title ? `${title} | Nohar Vikash Manch` : defaultTitle;
    document.title = fullTitle;

    const defaultDesc =
      "NoharVikashManch is the official digital platform of Village Nohar, Madhepura, Bihar. Community development, festivals, cultural heritage, sports, Gram Udyog, and transparent accounts.";
    const metaDesc = description || defaultDesc;

    // Helper to update or create meta tag
    const updateMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? `property="${name}"` : `name="${name}"`;
      let el = document.querySelector(`meta[${attr}]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        if (isProperty) el.setAttribute("property", name);
        else el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    updateMeta("description", metaDesc);
    updateMeta("og:title", fullTitle, true);
    updateMeta("twitter:title", fullTitle);
    updateMeta("og:description", metaDesc, true);
    updateMeta("twitter:description", metaDesc);
    updateMeta("og:url", window.location.href, true);

    if (keywords) {
      updateMeta("keywords", keywords);
    }
    if (ogImage) {
      updateMeta("og:image", ogImage, true);
      updateMeta("twitter:image", ogImage);
    }
  }, [title, description, keywords, ogImage, location.pathname]);

  return null;
}
