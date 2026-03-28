-- Site-wide, Ram Navami, and per-blog videos (managed from admin)

CREATE TYPE public.video_placement AS ENUM ('site', 'ramnavami', 'blog');

CREATE TABLE public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT 'Video',
  description TEXT,
  embed_url TEXT NOT NULL,
  placement public.video_placement NOT NULL DEFAULT 'site',
  blog_id UUID REFERENCES public.blogs(id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT videos_blog_placement_check CHECK (
    (placement = 'blog' AND blog_id IS NOT NULL)
    OR (placement IN ('site', 'ramnavami') AND blog_id IS NULL)
  )
);

CREATE INDEX idx_videos_placement_sort ON public.videos(placement, sort_order);
CREATE INDEX idx_videos_blog_sort ON public.videos(blog_id, sort_order) WHERE blog_id IS NOT NULL;

ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Videos viewable by everyone" ON public.videos FOR SELECT USING (true);
CREATE POLICY "Admins can insert videos" ON public.videos FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update videos" ON public.videos FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete videos" ON public.videos FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
