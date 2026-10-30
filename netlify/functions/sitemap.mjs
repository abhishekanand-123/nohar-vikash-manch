/**
 * Real-time Dynamic Sitemap Generator for Netlify
 * Fetches all dynamic blogs/festivals directly from Supabase on demand so new blogs are instantly available in sitemap.xml.
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://wjxfvtjuridoqtgdbzef.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqeGZ2dGp1cmlkb3F0Z2RiemVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NDA5MDQsImV4cCI6MjA4OTQxNjkwNH0.pjiv41tfIT5Ukr85xW1P5P6VLXENhB7iu0no9Flc0Cg";
const DOMAIN = "https://noharvikashmanch.in";

const staticPages = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/about", priority: "0.8", changefreq: "monthly" },
  { path: "/festivals", priority: "0.9", changefreq: "weekly" },
  { path: "/ramnavami", priority: "0.9", changefreq: "weekly" },
  { path: "/sports", priority: "0.8", changefreq: "weekly" },
  { path: "/gram-udyog", priority: "0.8", changefreq: "weekly" },
  { path: "/lekha-jokha", priority: "0.8", changefreq: "monthly" },
  { path: "/gallery", priority: "0.7", changefreq: "weekly" },
  { path: "/videos", priority: "0.7", changefreq: "weekly" },
  { path: "/donation", priority: "0.8", changefreq: "monthly" },
  { path: "/contact", priority: "0.8", changefreq: "monthly" },
  { path: "/privacy-policy", priority: "0.5", changefreq: "monthly" },
  { path: "/terms-conditions", priority: "0.5", changefreq: "monthly" },
];

function formatDate(dateStr) {
  try {
    if (!dateStr) return new Date().toISOString().split("T")[0];
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return new Date().toISOString().split("T")[0];
    return d.toISOString().split("T")[0];
  } catch {
    return new Date().toISOString().split("T")[0];
  }
}

export const handler = async () => {
  try {
    const today = new Date().toISOString().split("T")[0];
    let blogs = [];

    try {
      const endpoint = `${SUPABASE_URL}/rest/v1/blogs?select=id,title,created_at&order=created_at.desc`;
      const res = await fetch(endpoint, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });
      if (res.ok) {
        blogs = await res.json();
      }
    } catch (err) {
      console.warn("⚠️ Dynamic Sitemap fetch error:", err?.message);
    }

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
    xml += `        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n`;
    xml += `        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9\n`;
    xml += `        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n\n`;

    xml += `  <!-- Main Static Pages -->\n`;
    for (const page of staticPages) {
      xml += `  <url>\n`;
      xml += `    <loc>${DOMAIN}${page.path === "/" ? "/" : page.path}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    if (Array.isArray(blogs) && blogs.length > 0) {
      xml += `\n  <!-- Dynamic Festival / Blog Posts from Database (${blogs.length} items) -->\n`;
      for (const blog of blogs) {
        const lastModDate = formatDate(blog.created_at);
        xml += `  <url>\n`;
        xml += `    <loc>${DOMAIN}/festivals/${blog.id}</loc>\n`;
        xml += `    <lastmod>${lastModDate}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += `  </url>\n`;
      }
    }

    xml += `</urlset>\n`;

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=0, must-revalidate",
      },
      body: xml,
    };
  } catch (err) {
    console.error("Netlify Dynamic Sitemap Error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "text/plain" },
      body: "Error generating dynamic sitemap",
    };
  }
};
