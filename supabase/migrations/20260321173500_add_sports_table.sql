-- Sports announcements table
CREATE TABLE public.sports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  sport_type TEXT DEFAULT 'Cricket',
  status TEXT DEFAULT 'Upcoming',
  event_date DATE,
  image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sports viewable by everyone" ON public.sports FOR SELECT USING (true);
CREATE POLICY "Admins can insert sports" ON public.sports FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update sports" ON public.sports FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete sports" ON public.sports FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
