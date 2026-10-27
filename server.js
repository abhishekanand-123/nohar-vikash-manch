import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { sendContactEmail } from "./server/mailService.js";
import { handler as sitemapHandler } from "./netlify/functions/sitemap.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, "dist");
const PORT = process.env.PORT || 8080;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};

const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = url.pathname;

  // Handle Dynamic Real-time Sitemap
  if (pathname === "/sitemap.xml") {
    try {
      const out = await sitemapHandler();
      res.statusCode = out.statusCode;
      for (const [key, val] of Object.entries(out.headers)) {
        res.setHeader(key, val);
      }
      res.end(out.body);
      return;
    } catch (e) {
      console.error("Sitemap generation error:", e);
    }
  }

  // Handle Contact API
  if (pathname === "/api/contact") {
    if (req.method !== "POST") {
      res.statusCode = 405;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Method not allowed" }));
      return;
    }

    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", async () => {
      try {
        const data = JSON.parse(body || "{}");
        const { name, email, phone, category, message } = data;

        if (!name || !email || !message) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "कृपया नाम, ईमेल और संदेश भरें।" }));
          return;
        }

        const info = await sendContactEmail({ name, email, phone, category, message });

        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            success: true,
            message: "आपका संदेश सफलतापूर्वक भेज दिया गया है!",
            messageId: info.messageId,
          })
        );
      } catch (err) {
        console.error("Server Contact Email Error:", err);
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: err?.message || "ईमेल भेजने में त्रुटि हुई।" }));
      }
    });
    return;
  }

  // Serve static files from dist
  if (fs.existsSync(distDir)) {
    let filePath = path.join(distDir, pathname);
    
    // Check if path exists and is file
    let stat = null;
    try {
      if (fs.existsSync(filePath)) {
        stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          filePath = path.join(filePath, "index.html");
          if (fs.existsSync(filePath)) stat = fs.statSync(filePath);
          else stat = null;
        }
      }
    } catch {
      stat = null;
    }

    // SPA fallback to dist/index.html
    if (!stat || !fs.existsSync(filePath)) {
      filePath = path.join(distDir, "index.html");
    }

    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || "application/octet-stream";
      res.setHeader("Content-Type", contentType);
      fs.createReadStream(filePath).pipe(res);
      return;
    }
  }

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.end("Nohar Vikash Manch Server Running.");
});

server.listen(PORT, () => {
  console.log(`🚀 Nohar Vikash Manch Server running at http://localhost:${PORT}`);
});
