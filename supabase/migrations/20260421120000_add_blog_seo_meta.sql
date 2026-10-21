-- Add SEO meta title, description and keywords to blogs table
ALTER TABLE public.blogs
ADD COLUMN IF NOT EXISTS meta_title TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS meta_keywords TEXT;

COMMENT ON COLUMN public.blogs.meta_title IS 'Custom SEO Meta Title for search engines and social sharing';
COMMENT ON COLUMN public.blogs.meta_description IS 'Custom SEO Meta Description for search snippets';
COMMENT ON COLUMN public.blogs.meta_keywords IS 'Comma-separated SEO keywords for search engine indexing';
