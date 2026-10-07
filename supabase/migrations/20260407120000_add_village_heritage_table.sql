-- Village Heritage & Identity table (हमारे गाँव की धरोहर और पहचान)
CREATE TABLE IF NOT EXISTS public.village_heritage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT,
  badge TEXT DEFAULT 'धरोहर',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.village_heritage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Heritage items viewable by everyone" ON public.village_heritage FOR SELECT USING (true);
CREATE POLICY "Admins can insert heritage items" ON public.village_heritage FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update heritage items" ON public.village_heritage FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete heritage items" ON public.village_heritage FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
