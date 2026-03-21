-- Configurable page banners
CREATE TABLE public.page_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  bg_image TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.update_page_banners_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_update_page_banners_updated_at
BEFORE UPDATE ON public.page_banners
FOR EACH ROW
EXECUTE FUNCTION public.update_page_banners_updated_at();

ALTER TABLE public.page_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Page banners viewable by everyone" ON public.page_banners FOR SELECT USING (true);
CREATE POLICY "Admins can insert page banners" ON public.page_banners FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update page banners" ON public.page_banners FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete page banners" ON public.page_banners FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
