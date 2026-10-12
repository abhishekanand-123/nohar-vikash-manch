import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "public");

async function generateFaviconIco() {
  console.log("🎨 Generating favicon.ico and icons from pwa-icon.svg...");
  const svgPath = path.join(publicDir, "pwa-icon.svg");
  const svgBuffer = fs.readFileSync(svgPath);

  // Generate PNG buffers for 16, 32, 48
  const sizes = [16, 32, 48];
  const pngBuffers = [];
  for (const s of sizes) {
    const buf = await sharp(svgBuffer)
      .resize(s, s)
      .png()
      .toBuffer();
    pngBuffers.push({ size: s, buffer: buf });
  }

  // Also generate 180x180 for apple-touch-icon.png
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, "apple-touch-icon.png"));

  // Also generate standard favicon-48x48.png and favicon-32x32.png
  await sharp(svgBuffer)
    .resize(48, 48)
    .png()
    .toFile(path.join(publicDir, "favicon-48x48.png"));

  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, "favicon-32x32.png"));

  // Pack PNG buffers into a valid ICO file
  const count = pngBuffers.length;
  const headerSize = 6;
  const entrySize = 16;
  const entriesTotalSize = count * entrySize;
  let currentOffset = headerSize + entriesTotalSize;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // 1 = ICO
  header.writeUInt16LE(count, 4); // count of images

  const entries = [];
  for (const item of pngBuffers) {
    const entry = Buffer.alloc(entrySize);
    entry.writeUInt8(item.size >= 256 ? 0 : item.size, 0); // width
    entry.writeUInt8(item.size >= 256 ? 0 : item.size, 1); // height
    entry.writeUInt8(0, 2); // colors
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bpp
    entry.writeUInt32LE(item.buffer.length, 8); // size of image data
    entry.writeUInt32LE(currentOffset, 12); // offset
    entries.push(entry);
    currentOffset += item.buffer.length;
  }

  const icoBuffer = Buffer.concat([
    header,
    ...entries,
    ...pngBuffers.map((p) => p.buffer),
  ]);

  fs.writeFileSync(path.join(publicDir, "favicon.ico"), icoBuffer);
  console.log("✅ favicon.ico updated with official Nohar Vikash Manch emblem!");
}

async function generateOgImage() {
  console.log("🖼️ Generating official high-res OG Image (1200x630)...");

  // Read pwa-icon as base64 to embed in OG image SVG
  const iconPngBuffer = await sharp(path.join(publicDir, "pwa-icon.svg"))
    .resize(280, 280)
    .png()
    .toBuffer();
  const iconBase64 = `data:image/png;base64,${iconPngBuffer.toString("base64")}`;

  const ogSvg = `
  <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#042f2e" />
        <stop offset="40%" stop-color="#064e3b" />
        <stop offset="80%" stop-color="#0f766e" />
        <stop offset="100%" stop-color="#14532d" />
      </linearGradient>

      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#fef08a" />
        <stop offset="50%" stop-color="#f59e0b" />
        <stop offset="100%" stop-color="#d97706" />
      </linearGradient>

      <linearGradient id="cardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.12" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0.04" />
      </linearGradient>

      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="12" stdDeviation="20" flood-color="#000000" flood-opacity="0.5"/>
      </filter>
    </defs>

    <!-- Background -->
    <rect width="1200" height="630" fill="url(#bgGrad)" />

    <!-- Decorative Top & Bottom Borders -->
    <rect x="0" y="0" width="1200" height="8" fill="url(#goldGrad)" />
    <rect x="0" y="622" width="1200" height="8" fill="url(#goldGrad)" />

    <!-- Ambient Glowing Circles -->
    <circle cx="150" cy="120" r="260" fill="#16a34a" fill-opacity="0.15" filter="blur(60px)" />
    <circle cx="1050" cy="500" r="280" fill="#f59e0b" fill-opacity="0.12" filter="blur(60px)" />

    <!-- Inner Card Container with Glassmorphism -->
    <rect x="50" y="50" width="1100" height="530" rx="28" fill="url(#cardGrad)" stroke="#ffffff" stroke-opacity="0.18" stroke-width="2" filter="url(#shadow)" />

    <!-- Left side: Official Badge / Logo -->
    <g transform="translate(100, 175)">
      <image href="${iconBase64}" width="280" height="280" filter="url(#shadow)" />
    </g>

    <!-- Right side: Typography & Highlights -->
    <g transform="translate(430, 130)">
      <!-- Super-header Badge -->
      <rect x="0" y="0" width="370" height="38" rx="19" fill="#f59e0b" fill-opacity="0.2" stroke="#f59e0b" stroke-width="1.5" />
      <text x="185" y="25" text-anchor="middle" font-family="'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700" fill="#fef08a" letter-spacing="2">
        OFFICIAL DIGITAL PORTAL
      </text>

      <!-- Main Hindi Title -->
      <text x="0" y="95" font-family="'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="900" fill="#ffffff" filter="url(#shadow)">
        नौहर विकास मंच
      </text>

      <!-- English Subtitle -->
      <text x="0" y="142" font-family="'Segoe UI', Roboto, sans-serif" font-size="30" font-weight="700" fill="url(#goldGrad)">
        Nohar Vikash Manch — Village Nohar
      </text>

      <!-- Description Line 1 -->
      <text x="0" y="190" font-family="'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="500" fill="#e2e8f0">
        सामुदायिक विकास, सांस्कृतिक पर्व-त्योहार, खेलकूद एवं ग्राम सेवा
      </text>

      <!-- Description Line 2 -->
      <text x="0" y="222" font-family="'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="400" fill="#94a3b8">
        ग्राम नौहर, प्रखंड आलमनगर, जिला मधेपुरा (बिहार) | नौहर विकास युवक संघ
      </text>

      <!-- Feature Pill Tags -->
      <g transform="translate(0, 260)">
        <!-- Tag 1 -->
        <rect x="0" y="0" width="130" height="36" rx="18" fill="#ffffff" fill-opacity="0.12" stroke="#ffffff" stroke-opacity="0.2" />
        <text x="65" y="23" text-anchor="middle" font-family="'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="600" fill="#ffffff">
          पर्व-त्योहार
        </text>

        <!-- Tag 2 -->
        <rect x="145" y="0" width="130" height="36" rx="18" fill="#ffffff" fill-opacity="0.12" stroke="#ffffff" stroke-opacity="0.2" />
        <text x="210" y="23" text-anchor="middle" font-family="'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="600" fill="#ffffff">
          खेल क्लब
        </text>

        <!-- Tag 3 -->
        <rect x="290" y="0" width="145" height="36" rx="18" fill="#ffffff" fill-opacity="0.12" stroke="#ffffff" stroke-opacity="0.2" />
        <text x="362" y="23" text-anchor="middle" font-family="'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="600" fill="#ffffff">
          ग्राम उद्योग
        </text>

        <!-- Tag 4 -->
        <rect x="450" y="0" width="140" height="36" rx="18" fill="#ffffff" fill-opacity="0.12" stroke="#ffffff" stroke-opacity="0.2" />
        <text x="520" y="23" text-anchor="middle" font-family="'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="600" fill="#ffffff">
          लेखा-जोखा
        </text>
      </g>

      <!-- Website URL & Verified indicator -->
      <g transform="translate(0, 335)">
        <circle cx="10" cy="-5" r="5" fill="#22c55e" />
        <text x="26" y="0" font-family="'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="700" fill="#38bdf8" letter-spacing="1">
          https://noharvikashmanch.in
        </text>
      </g>
    </g>
  </svg>
  `;

  // Render SVG to JPEG
  const ogJpegBuffer = await sharp(Buffer.from(ogSvg))
    .jpeg({ quality: 92, chromaSubsampling: "4:4:4" })
    .toBuffer();

  fs.writeFileSync(path.join(publicDir, "og-image.jpg"), ogJpegBuffer);

  // Also write og-image.png for platforms preferring PNG
  const ogPngBuffer = await sharp(Buffer.from(ogSvg))
    .png()
    .toBuffer();

  fs.writeFileSync(path.join(publicDir, "og-image.png"), ogPngBuffer);

  console.log("✅ og-image.jpg & og-image.png generated successfully!");
}

async function run() {
  await generateFaviconIco();
  await generateOgImage();
}

run().catch((err) => {
  console.error("Error generating assets:", err);
  process.exit(1);
});
