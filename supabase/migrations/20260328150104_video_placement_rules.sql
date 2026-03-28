ALTER TABLE public.videos DROP CONSTRAINT IF EXISTS videos_blog_placement_check;
ALTER TABLE public.videos DROP CONSTRAINT IF EXISTS videos_placement_rules;

ALTER TABLE public.videos ADD CONSTRAINT videos_placement_rules CHECK (
  (
    placement = 'blog'
    AND blog_id IS NOT NULL
    AND (page_key IS NULL OR btrim(page_key) = '')
  )
  OR (
    placement IN ('site', 'ramnavami', 'home', 'global')
    AND blog_id IS NULL
    AND (page_key IS NULL OR btrim(page_key) = '')
  )
  OR (
    placement = 'page'
    AND blog_id IS NULL
    AND page_key IS NOT NULL
    AND btrim(page_key) <> ''
  )
);

CREATE INDEX IF NOT EXISTS idx_videos_placement_page_key ON public.videos (placement, page_key, sort_order);
CREATE INDEX IF NOT EXISTS idx_videos_home ON public.videos (placement, sort_order) WHERE placement = 'home';
CREATE INDEX IF NOT EXISTS idx_videos_global ON public.videos (placement, sort_order) WHERE placement = 'global';
