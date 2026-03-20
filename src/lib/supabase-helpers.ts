import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

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

export async function deleteFile(url: string): Promise<boolean> {
  const prefix = `${SUPABASE_URL}/storage/v1/object/public/uploads/`;
  if (!url.startsWith(prefix)) return false;
  const path = url.replace(prefix, "");
  const { error } = await supabase.storage.from("uploads").remove([path]);
  return !error;
}
