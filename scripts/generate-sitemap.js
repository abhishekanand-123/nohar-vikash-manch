/**
 * Dynamic Sitemap Generator for Nohar Vikash Manch
 * Fetches all dynamic festival/blog posts from Supabase database and generates sitemap.xml
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// 1. Read environment variables from .env if available
function loadEnv() {
  const envPath = path.join(rootDir, ".env");
  const env = {};
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const match = line.match(/^\s*([\w_]+)\s*=\s*["']?(.*?)["']?\s*$/);
      if (match) {
        env[match[1]] = match[2];
      }
    }
  }
  return env;
}

const env = loadEnv();
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL || "https://wjxfvtjuridoqtgdbzef.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqeGZ2dGp1cmlkb3F0Z2RiemVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NDA5MDQsImV4cCI6MjA4OTQxNjkwNH0.pjiv41tfIT5Ukr85xW1P5P6VLXENhB7iu0no9Flc0Cg";
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

async function fetchBlogPosts() {
  console.log("📡 Fetching blog posts from Supabase...");
  const endpoint = `${SUPABASE_URL}/rest/v1/blogs?select=id,title,created_at,festival_date&order=created_at.desc`;
  try {
    const res = await fetch(endpoint, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    if (!res.ok) {
      console.warn(`⚠️ Supabase fetch warning (${res.status}): ${await res.text()}`);
      return [];
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("❌ Failed to fetch blogs from Supabase:", err.message);
    return [];
  }
}

export function buildSitemapXml(blogs = []) {
  const today = new Date().toISOString().split("T")[0];

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

  if (blogs.length > 0) {
    xml += `\n  <!-- Dynamic Festival / Blog Posts from Database (${blogs.length} items) -->\n`;
    for (const blog of blogs) {
      const lastModDate = formatDate(blog.updated_at || blog.created_at);
      xml += `  <url>\n`;
      xml += `    <loc>${DOMAIN}/festivals/${blog.id}</loc>\n`;
      xml += `    <lastmod>${lastModDate}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    }
  }

  xml += `</urlset>\n`;
  return xml;
}

async function main() {
  console.log("🚀 Starting Sitemap generation...");
  const blogs = await fetchBlogPosts();
  console.log(`✅ Found ${blogs.length} blog / festival posts.`);

  const xml = buildSitemapXml(blogs);

  const publicSitemapPath = path.join(rootDir, "public", "sitemap.xml");
  fs.writeFileSync(publicSitemapPath, xml, "utf-8");
  console.log(`📝 Generated: ${publicSitemapPath}`);

  const distDir = path.join(rootDir, "dist");
  if (fs.existsSync(distDir)) {
    const distSitemapPath = path.join(distDir, "sitemap.xml");
    fs.writeFileSync(distSitemapPath, xml, "utf-8");
    console.log(`📝 Generated: ${distSitemapPath}`);
  }

  console.log("🎉 Sitemap successfully updated with all latest backend blogs!");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((e) => {
    console.error("Error generating sitemap:", e);
    process.exit(1);
  });
}
