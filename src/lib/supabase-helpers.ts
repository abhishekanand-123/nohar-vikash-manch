import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const VIDEO_MIME_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100 MB

export async function uploadFile(file: File, folder: string = "general"): Promise<string | null> {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error('Only JPEG, PNG, GIF, and WebP images are allowed.');
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error('File size must not exceed 5 MB.');
  }

  const ext = file.name.split(".").pop();
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

  const { error } = await supabase.storage.from("uploads").upload(fileName, file);
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

export async function deleteFile(url: string): Promise<boolean> {
  const prefix = `${SUPABASE_URL}/storage/v1/object/public/uploads/`;
  if (!url.startsWith(prefix)) return false;
  const path = url.replace(prefix, "");
  const { error } = await supabase.storage.from("uploads").remove([path]);
  return !error;
}
