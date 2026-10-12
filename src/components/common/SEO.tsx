import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const SITE_BASE_URL = "https://noharvikashmanch.in";
export const DEFAULT_OG_IMAGE = `${SITE_BASE_URL}/og-image.jpg`;

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
  noindex?: boolean;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
  schema?: Record<string, unknown>;
}

export default function SEO({
  title,
  description,
  keywords,
  ogImage,
  canonical,
  noindex = false,
  type = "website",
  publishedTime,
  modifiedTime,
  author,
  section,
  tags,
  schema,
}: SEOProps) {
  const location = useLocation();

  useEffect(() => {
    const defaultTitle = "Nohar Vikash Manch — ग्राम नौहर, ग्वालपाड़ा (मधेपुरा, बिहार) | Nohar, Gwalpara";
    const fullTitle = title ? `${title} | Nohar Vikash Manch (नोहर, ग्वालपाड़ा)` : defaultTitle;
    document.title = fullTitle;

    const defaultDesc =
      "ग्राम नौहर, ग्वालपाड़ा, मधेपुरा, बिहार (Nohar, Gwalpara, Madhepura, Bihar) का आधिकारिक डिजिटल पोर्टल — Nohar Vikash Manch। नोहर विकास युवक संघ द्वारा संचालित ग्रामीण विकास, सांस्कृतिक पर्व-त्योहार, खेलकूद, ग्राम उद्योग व पारदर्शी जन सेवा।";
    const metaDesc = (description && description.trim()) || defaultDesc;

    // Determine normalized canonical URL
    const cleanPath = location.pathname === "/" ? "" : location.pathname.replace(/\/+$/, "");
    const canonicalUrl = canonical || `${SITE_BASE_URL}${cleanPath || "/"}`;

    // Normalize og:image to full URL
    let fullOgImage = DEFAULT_OG_IMAGE;
    if (ogImage && ogImage.trim()) {
      if (ogImage.startsWith("http://") || ogImage.startsWith("https://")) {
        fullOgImage = ogImage;
      } else if (ogImage.startsWith("/")) {
        fullOgImage = `${SITE_BASE_URL}${ogImage}`;
      } else {
        fullOgImage = `${SITE_BASE_URL}/${ogImage}`;
      }
    }

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

    // Helper to remove meta tag
    const removeMeta = (name: string, isProperty = false) => {
      const attr = isProperty ? `property="${name}"` : `name="${name}"`;
      const el = document.querySelector(`meta[${attr}]`);
      if (el) el.remove();
    };

    // Helper to remove all tags of a property (e.g. multiple article:tag)
    const removeAllMeta = (name: string, isProperty = false) => {
      const attr = isProperty ? `property="${name}"` : `name="${name}"`;
      document.querySelectorAll(`meta[${attr}]`).forEach((el) => el.remove());
    };

    // Helper to add multiple meta tags
    const addMultipleMeta = (name: string, contents: string[], isProperty = false) => {
      removeAllMeta(name, isProperty);
      contents.forEach((content) => {
        if (!content) return;
        const el = document.createElement("meta");
        if (isProperty) el.setAttribute("property", name);
        else el.setAttribute("name", name);
        el.setAttribute("content", content);
        document.head.appendChild(el);
      });
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

    // Update basic SEO tags
    updateMeta("description", metaDesc);
    updateMeta("og:type", type, true);
    updateMeta("og:site_name", "Nohar Vikash Manch", true);
    updateMeta("og:title", fullTitle, true);
    updateMeta("og:description", metaDesc, true);
    updateMeta("og:url", canonicalUrl, true);
    updateMeta("og:image", fullOgImage, true);
    updateMeta("og:image:secure_url", fullOgImage, true);

    // Twitter Card
    updateMeta("twitter:card", "summary_large_image");
    updateMeta("twitter:site", "@NoharVikashManch");
    updateMeta("twitter:title", fullTitle);
    updateMeta("twitter:description", metaDesc);
    updateMeta("twitter:image", fullOgImage);

    updateCanonical(canonicalUrl);

    // Article-specific OpenGraph meta tags
    if (type === "article") {
      if (publishedTime) updateMeta("article:published_time", publishedTime, true);
      else removeMeta("article:published_time", true);

      if (modifiedTime) updateMeta("article:modified_time", modifiedTime, true);
      else removeMeta("article:modified_time", true);

      if (author) updateMeta("article:author", author, true);
      else updateMeta("article:author", "Nohar Vikash Yuvak Sangh", true);

      if (section) updateMeta("article:section", section, true);
      else removeMeta("article:section", true);

      if (tags && tags.length > 0) {
        addMultipleMeta("article:tag", tags, true);
      } else {
        removeAllMeta("article:tag", true);
      }
    } else {
      removeMeta("article:published_time", true);
      removeMeta("article:modified_time", true);
      removeMeta("article:author", true);
      removeMeta("article:section", true);
      removeAllMeta("article:tag", true);
    }

    // Robots meta tag
    if (noindex) {
      updateMeta("robots", "noindex, nofollow");
    } else {
      updateMeta("robots", "index, follow");
    }

    // Keywords
    const defaultKeywords =
      "nohar, gwalpara, nohar gwalpara, nohar vikash, nohar vikash manch, gram nohar, nohar madhepura, gwalpara madhepura, nohar bihar, nauhar, नौहर, ग्वालपाड़ा, ग्वालपारा, मधेपुरा, नोहर विकास मंच, नौहर विकास युवक संघ";
    updateMeta("keywords", keywords || defaultKeywords);

    // JSON-LD Structured Data Schema
    let scriptTag = document.getElementById("structured-data-schema") as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement("script");
      scriptTag.id = "structured-data-schema";
      scriptTag.type = "application/ld+json";
      document.head.appendChild(scriptTag);
    }

    const defaultSchema =
      type === "article"
        ? {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: fullTitle,
            description: metaDesc,
            image: [fullOgImage],
            datePublished: publishedTime || new Date().toISOString(),
            dateModified: modifiedTime || publishedTime || new Date().toISOString(),
            author: {
              "@type": "Organization",
              name: author || "Nohar Vikash Yuvak Sangh",
              url: SITE_BASE_URL,
            },
            publisher: {
              "@type": "Organization",
              name: "Nohar Vikash Manch",
              logo: {
                "@type": "ImageObject",
                url: `${SITE_BASE_URL}/pwa-icon.svg`,
              },
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": canonicalUrl,
            },
          }
        : {
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebSite",
                "@id": `${SITE_BASE_URL}/#website`,
                url: `${SITE_BASE_URL}/`,
                name: "Nohar Vikash Manch",
                alternateName: [
                  "Nohar",
                  "Gwalpara",
                  "Nohar Gwalpara",
                  "Gram Nohar",
                  "Nohar Vikash",
                  "नौहर",
                  "ग्वालपाड़ा",
                  "ग्वालपारा",
                  "नोहर विकास मंच",
                  "नोहर विकास युवक संघ",
                ],
                description: metaDesc,
              },
              {
                "@type": "NGO",
                "@id": `${SITE_BASE_URL}/#organization`,
                name: "Nohar Vikash Manch (नोहर विकास मंच)",
                alternateName: ["Nohar Vikash Yuvak Sangh", "नोहर विकास युवक संघ"],
                url: `${SITE_BASE_URL}/`,
                logo: `${SITE_BASE_URL}/og-image.jpg`,
                address: {
                  "@type": "PostalAddress",
                  streetAddress: "Gram Nohar",
                  addressLocality: "Gwalpara",
                  addressRegion: "Madhepura, Bihar",
                  postalCode: "852115",
                  addressCountry: "IN",
                },
                areaServed: [
                  {
                    "@type": "AdministrativeArea",
                    name: "Nohar, Gwalpara, Madhepura, Bihar",
                  },
                ],
              },
              {
                "@type": "Place",
                "@id": `${SITE_BASE_URL}/#place`,
                name: "Nohar (नौहर), Gwalpara",
                address: {
                  "@type": "PostalAddress",
                  addressLocality: "Nohar, Gwalpara",
                  addressRegion: "Madhepura, Bihar",
                  postalCode: "852115",
                  addressCountry: "IN",
                },
                geo: {
                  "@type": "GeoCoordinates",
                  latitude: "25.92",
                  longitude: "86.78",
                },
              },
            ],
          };

    scriptTag.textContent = JSON.stringify(schema || defaultSchema);

    return () => {
      // Cleanup article tags if navigating away from article
      if (type === "article") {
        removeMeta("article:published_time", true);
        removeMeta("article:modified_time", true);
        removeMeta("article:author", true);
        removeMeta("article:section", true);
        removeAllMeta("article:tag", true);
      }
    };
  }, [
    title,
    description,
    keywords,
    ogImage,
    canonical,
    noindex,
    type,
    publishedTime,
    modifiedTime,
    author,
    section,
    tags,
    schema,
    location.pathname,
  ]);

  return null;
}
