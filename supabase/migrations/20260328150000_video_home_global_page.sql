-- page_key for per-route videos.
-- Enum values (home, global, page) are added in separate migrations so each commits
-- before the CHECK constraint references them (PostgreSQL 55P04).

ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS page_key TEXT;
