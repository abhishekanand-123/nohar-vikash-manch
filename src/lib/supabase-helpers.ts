import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const VIDEO_MIME_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100 MB

/**
 * Compresses an image file using an offscreen canvas to prevent large raw photos
 * (e.g. 5MB-10MB mobile uploads) from freezing/hanging the browser when rendered in lists.
 */
export async function compressImageFile(file: File, maxDimension = 1600, quality = 0.85): Promise<File> {
  // Only compress raster images; skip SVG, GIF (animations), or non-images
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      // If already small in dimension and byte size, don't re-compress
      if (width <= maxDimension && height <= maxDimension && file.size < 350 * 1024) {
        resolve(file);
        return;
      }

      // Calculate proportional scale
      if (width > height && width > maxDimension) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else if (height > maxDimension) {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      const targetMime = "image/webp";
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const newName = file.name.replace(/\.[^/.]+$/, ".webp");
          const compressed = new File([blob], newName, {
            type: targetMime,
            lastModified: Date.now(),
          });
          resolve(compressed);
        },
        targetMime,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

export async function uploadFile(file: File, folder: string = "general"): Promise<string | null> {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error('Only JPEG, PNG, GIF, and WebP images are allowed.');
  }

  // Automatically optimize and compress image before uploading
  let processedFile = file;
  try {
    processedFile = await compressImageFile(file);
  } catch (compressErr) {
    console.warn("Client image compression skipped, uploading original:", compressErr);
  }

  if (processedFile.size > MAX_SIZE_BYTES) {
    throw new Error('File size must not exceed 5 MB.');
  }

  const ext = processedFile.name.split(".").pop();
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

  const { error } = await supabase.storage.from("uploads").upload(fileName, processedFile, {
    cacheControl: "31536000", // 1 year cache
    upsert: false,
  });
  if (error) {
    console.error("Upload error:", error);
    return null;
  }

  return `${SUPABASE_URL}/storage/v1/object/public/uploads/${fileName}`;
}

export async function uploadVideoFile(file: File, folder: string = "videos"): Promise<string | null> {
  if (!VIDEO_MIME_TYPES.includes(file.type)) {
    throw new Error("Only MP4, WebM, or MOV video files are allowed.");
  }
  if (file.size > MAX_VIDEO_BYTES) {
    throw new Error("Video must not exceed 100 MB.");
  }

  const ext = file.name.split(".").pop() || (file.type.includes("webm") ? "webm" : "mp4");
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

  const { error } = await supabase.storage.from("uploads").upload(fileName, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) {
    console.error("Video upload error:", error);
    return null;
  }

  return `${SUPABASE_URL}/storage/v1/object/public/uploads/${fileName}`;
}

export async function uploadPdfFile(file: File, folder: string = "documents"): Promise<string | null> {
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) {
    throw new Error("Only PDF files are allowed.");
  }
  if (file.size > 25 * 1024 * 1024) {
    throw new Error("PDF file must not exceed 25 MB.");
  }

  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.pdf`;

  const { error } = await supabase.storage.from("uploads").upload(fileName, file, {
    contentType: "application/pdf",
    cacheControl: "3600",
    upsert: false,
  });
  if (error) {
    console.error("PDF upload error:", error);
    return null;
  }

  return `${SUPABASE_URL}/storage/v1/object/public/uploads/${fileName}`;
}

export async function deleteFile(url: string): Promise<boolean> {
  const prefix = `${SUPABASE_URL}/storage/v1/object/public/uploads/`;
  if (!url.startsWith(prefix)) return false;
  const path = url.replace(prefix, "");
  const { error } = await supabase.storage.from("uploads").remove([path]);
  return !error;
}
