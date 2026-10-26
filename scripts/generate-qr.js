import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const SITE_URL = "https://noharvikashmanch.in";

async function generate() {
  const publicDir = path.join(rootDir, "public");
  const pngPath = path.join(publicDir, "qr-code.png");
  const svgPath = path.join(publicDir, "qr-code.svg");

  console.log("Generating high-resolution QR codes for", SITE_URL);

  // 1. High-res PNG (1024x1024, crisp for print & posters)
  await QRCode.toFile(pngPath, SITE_URL, {
    width: 1024,
    margin: 2,
    color: {
      dark: "#0f3d1e", // Rich dark emerald green
      light: "#ffffff",
    },
    errorCorrectionLevel: "H",
  });
  console.log("✅ Generated:", pngPath);

  // 2. Vector SVG (infinite scale for printing on large flex/banners)
  const svgString = await QRCode.toString(SITE_URL, {
    type: "svg",
    margin: 2,
    color: {
      dark: "#0f3d1e",
      light: "#ffffff",
    },
    errorCorrectionLevel: "H",
  });
  fs.writeFileSync(svgPath, svgString, "utf-8");
  console.log("✅ Generated:", svgPath);

  // Also copy to dist if dist exists
  const distDir = path.join(rootDir, "dist");
  if (fs.existsSync(distDir)) {
    fs.copyFileSync(pngPath, path.join(distDir, "qr-code.png"));
    fs.copyFileSync(svgPath, path.join(distDir, "qr-code.svg"));
    console.log("✅ Copied to dist/ directory");
  }

  console.log("🎉 QR Code generation completed!");
}

generate().catch(console.error);
