export const SITE_DOMAIN = "https://noharvikashmanch.in";

export const STATIC_SITEMAP_PAGES = [
  { path: "/", priority: "1.0", changefreq: "daily", name: "मुखपृष्ठ (Home)" },
  { path: "/about", priority: "0.8", changefreq: "monthly", name: "हमारे बारे में (About)" },
  { path: "/festivals", priority: "0.9", changefreq: "weekly", name: "त्योहार और उत्सव (Festivals)" },
  { path: "/ramnavami", priority: "0.9", changefreq: "weekly", name: "रामनवमी महोत्सव (Ramnavami)" },
  { path: "/sports", priority: "0.8", changefreq: "weekly", name: "खेल क्लब (Sports)" },
  { path: "/gram-udyog", priority: "0.8", changefreq: "weekly", name: "ग्राम उद्योग व हुनर (Gram Udyog)" },
  { path: "/lekha-jokha", priority: "0.8", changefreq: "monthly", name: "लेखा-जोखा (Transparency)" },
  { path: "/gallery", priority: "0.7", changefreq: "weekly", name: "फोटो गैलरी (Gallery)" },
  { path: "/videos", priority: "0.7", changefreq: "weekly", name: "वीडियो (Videos)" },
  { path: "/donation", priority: "0.8", changefreq: "monthly", name: "सहयोग / दान (Donation)" },
];

export interface SitemapBlogItem {
  id: string;
  title: string;
  created_at: string;
  festival_date?: string | null;
}

function formatDate(dateStr?: string | null): string {
  try {
    if (!dateStr) return new Date().toISOString().split("T")[0];
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return new Date().toISOString().split("T")[0];
    return d.toISOString().split("T")[0];
  } catch {
    return new Date().toISOString().split("T")[0];
  }
}

export function generateSitemapXmlString(blogs: SitemapBlogItem[] = []): string {
  const today = new Date().toISOString().split("T")[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  xml += `        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n`;
  xml += `        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9\n`;
  xml += `        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n\n`;

  xml += `  <!-- Main Static Pages -->\n`;
  for (const page of STATIC_SITEMAP_PAGES) {
    xml += `  <url>\n`;
    xml += `    <loc>${SITE_DOMAIN}${page.path === "/" ? "/" : page.path}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  if (blogs.length > 0) {
    xml += `\n  <!-- Dynamic Festival / Blog Posts from Database (${blogs.length} items) -->\n`;
    for (const blog of blogs) {
      const lastModDate = formatDate(blog.created_at);
      xml += `  <url>\n`;
      xml += `    <loc>${SITE_DOMAIN}/festivals/${blog.id}</loc>\n`;
      xml += `    <lastmod>${lastModDate}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    }
  }

  xml += `</urlset>\n`;
  return xml;
}

export function downloadSitemapFile(xmlContent: string) {
  const blob = new Blob([xmlContent], { type: "application/xml;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "sitemap.xml";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
