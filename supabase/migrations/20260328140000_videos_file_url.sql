-- Allow uploaded video files (storage URL) in addition to embed URLs

ALTER TABLE public.videos ALTER COLUMN embed_url DROP NOT NULL;

ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS file_url TEXT;

ALTER TABLE public.videos DROP CONSTRAINT IF EXISTS videos_has_media;

ALTER TABLE public.videos ADD CONSTRAINT videos_has_media CHECK (
  (embed_url IS NOT NULL AND btrim(embed_url) <> '')
  OR (file_url IS NOT NULL AND btrim(file_url) <> '')
);
