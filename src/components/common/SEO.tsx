import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const SITE_BASE_URL = "https://noharvikashmanch.in";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
  noindex?: boolean;
}

export default function SEO({
  title,
  description,
  keywords,
  ogImage,
  canonical,
  noindex = false,
}: SEOProps) {
  const location = useLocation();

  useEffect(() => {
    const defaultTitle = "Nohar Vikash Manch — Village Digital Portal";
    const fullTitle = title ? `${title} | Nohar Vikash Manch` : defaultTitle;
    document.title = fullTitle;

    const defaultDesc =
      "Official digital portal of Village Nohar, Madhepura, Bihar. Managed by Nohar Vikash Yuvak Sangh for rural community development, cultural festivals, sports, and local services.";
    const metaDesc = description || defaultDesc;

    // Determine normalized canonical URL (cleans query params, hashes, trailing slashes)
    const cleanPath = location.pathname === "/" ? "" : location.pathname.replace(/\/+$/, "");
    const canonicalUrl = canonical || `${SITE_BASE_URL}${cleanPath || "/"}`;

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

    // Helper to update or create canonical link tag
    const updateCanonical = (href: string) => {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", href);
    };

    updateMeta("description", metaDesc);
    updateMeta("og:title", fullTitle, true);
    updateMeta("twitter:title", fullTitle);
    updateMeta("og:description", metaDesc, true);
    updateMeta("twitter:description", metaDesc);
    updateMeta("og:url", canonicalUrl, true);
    updateCanonical(canonicalUrl);

    if (noindex) {
      updateMeta("robots", "noindex, nofollow");
    } else {
      updateMeta("robots", "index, follow");
    }

    if (keywords) {
      updateMeta("keywords", keywords);
    }
    if (ogImage) {
      updateMeta("og:image", ogImage, true);
      updateMeta("twitter:image", ogImage);
    }
  }, [title, description, keywords, ogImage, canonical, noindex, location.pathname]);

  return null;
}
