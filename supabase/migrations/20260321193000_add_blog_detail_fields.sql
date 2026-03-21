ALTER TABLE public.blogs
ADD COLUMN IF NOT EXISTS gallery_images TEXT[] DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS highlights TEXT[] DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS festival_date TEXT;
