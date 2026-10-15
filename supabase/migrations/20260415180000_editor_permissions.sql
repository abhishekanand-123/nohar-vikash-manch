-- Migration: Allow Editors to Insert/Update and restrict Deletes to Admins only
-- (एडिटर नया डेटा जोड़ व एडिट कर सकें, लेकिन कोई भी रिकॉर्ड डिलीट न कर सकें)

-- 1. Ensure 'editor' exists in app_role enum
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type typ
    JOIN pg_enum enm ON typ.oid = enm.enumtypid
    WHERE typ.typname = 'app_role' AND enm.enumlabel = 'editor'
  ) THEN
    ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'editor';
  END IF;
END $$;

-- 2. Helper function to check if a user is Admin or Editor
CREATE OR REPLACE FUNCTION public.can_manage(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _user_id AND role IN ('admin', 'editor')
  )
$$;

-- 3. VIDEOS Policies
DROP POLICY IF EXISTS "Admins can insert videos" ON public.videos;
DROP POLICY IF EXISTS "Admins can update videos" ON public.videos;
DROP POLICY IF EXISTS "Admins can delete videos" ON public.videos;

CREATE POLICY "Admins and Editors can insert videos" ON public.videos 
  FOR INSERT WITH CHECK (public.can_manage(auth.uid()));

CREATE POLICY "Admins and Editors can update videos" ON public.videos 
  FOR UPDATE USING (public.can_manage(auth.uid()));

CREATE POLICY "Only Admins can delete videos" ON public.videos 
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- 4. VILLAGE HERITAGE Policies
DROP POLICY IF EXISTS "Admins can insert heritage items" ON public.village_heritage;
DROP POLICY IF EXISTS "Admins can update heritage items" ON public.village_heritage;
DROP POLICY IF EXISTS "Admins can delete heritage items" ON public.village_heritage;

CREATE POLICY "Admins and Editors can insert heritage items" ON public.village_heritage 
  FOR INSERT WITH CHECK (public.can_manage(auth.uid()));

CREATE POLICY "Admins and Editors can update heritage items" ON public.village_heritage 
  FOR UPDATE USING (public.can_manage(auth.uid()));

CREATE POLICY "Only Admins can delete heritage items" ON public.village_heritage 
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- 5. SPORTS Policies
DROP POLICY IF EXISTS "Admins can insert sports" ON public.sports;
DROP POLICY IF EXISTS "Admins can update sports" ON public.sports;
DROP POLICY IF EXISTS "Admins can delete sports" ON public.sports;

CREATE POLICY "Admins and Editors can insert sports" ON public.sports 
  FOR INSERT WITH CHECK (public.can_manage(auth.uid()));

CREATE POLICY "Admins and Editors can update sports" ON public.sports 
  FOR UPDATE USING (public.can_manage(auth.uid()));

CREATE POLICY "Only Admins can delete sports" ON public.sports 
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- 6. PAGE BANNERS Policies
DROP POLICY IF EXISTS "Admins can insert page banners" ON public.page_banners;
DROP POLICY IF EXISTS "Admins can update page banners" ON public.page_banners;
DROP POLICY IF EXISTS "Admins can delete page banners" ON public.page_banners;

CREATE POLICY "Admins and Editors can insert page banners" ON public.page_banners 
  FOR INSERT WITH CHECK (public.can_manage(auth.uid()));

CREATE POLICY "Admins and Editors can update page banners" ON public.page_banners 
  FOR UPDATE USING (public.can_manage(auth.uid()));

CREATE POLICY "Only Admins can delete page banners" ON public.page_banners 
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- 7. BLOGS Policies
DROP POLICY IF EXISTS "Admins can insert blogs" ON public.blogs;
DROP POLICY IF EXISTS "Admins can update blogs" ON public.blogs;
DROP POLICY IF EXISTS "Admins can delete blogs" ON public.blogs;

CREATE POLICY "Admins and Editors can insert blogs" ON public.blogs 
  FOR INSERT WITH CHECK (public.can_manage(auth.uid()));

CREATE POLICY "Admins and Editors can update blogs" ON public.blogs 
  FOR UPDATE USING (public.can_manage(auth.uid()));

CREATE POLICY "Only Admins can delete blogs" ON public.blogs 
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- 8. MEMBERS Policies
DROP POLICY IF EXISTS "Admins can insert members" ON public.members;
DROP POLICY IF EXISTS "Admins can update members" ON public.members;
DROP POLICY IF EXISTS "Admins can delete members" ON public.members;

CREATE POLICY "Admins and Editors can insert members" ON public.members 
  FOR INSERT WITH CHECK (public.can_manage(auth.uid()));

CREATE POLICY "Admins and Editors can update members" ON public.members 
  FOR UPDATE USING (public.can_manage(auth.uid()));

CREATE POLICY "Only Admins can delete members" ON public.members 
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- 9. GALLERY Policies
DROP POLICY IF EXISTS "Admins can insert gallery" ON public.gallery;
DROP POLICY IF EXISTS "Admins can update gallery" ON public.gallery;
DROP POLICY IF EXISTS "Admins can delete gallery" ON public.gallery;

CREATE POLICY "Admins and Editors can insert gallery" ON public.gallery 
  FOR INSERT WITH CHECK (public.can_manage(auth.uid()));

CREATE POLICY "Admins and Editors can update gallery" ON public.gallery 
  FOR UPDATE USING (public.can_manage(auth.uid()));

CREATE POLICY "Only Admins can delete gallery" ON public.gallery 
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- 10. EVENTS Policies
DROP POLICY IF EXISTS "Admins can insert events" ON public.events;
DROP POLICY IF EXISTS "Admins can update events" ON public.events;
DROP POLICY IF EXISTS "Admins can delete events" ON public.events;

CREATE POLICY "Admins and Editors can insert events" ON public.events 
  FOR INSERT WITH CHECK (public.can_manage(auth.uid()));

CREATE POLICY "Admins and Editors can update events" ON public.events 
  FOR UPDATE USING (public.can_manage(auth.uid()));

CREATE POLICY "Only Admins can delete events" ON public.events 
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- 11. DONATIONS Policies
DROP POLICY IF EXISTS "Admins can insert donations" ON public.donations;
DROP POLICY IF EXISTS "Admins can update donations" ON public.donations;
DROP POLICY IF EXISTS "Admins can delete donations" ON public.donations;

CREATE POLICY "Admins and Editors can insert donations" ON public.donations 
  FOR INSERT WITH CHECK (public.can_manage(auth.uid()));

CREATE POLICY "Admins and Editors can update donations" ON public.donations 
  FOR UPDATE USING (public.can_manage(auth.uid()));

CREATE POLICY "Only Admins can delete donations" ON public.donations 
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- 12. STORAGE OBJECTS Policies (Upload allowed for Admin & Editor, delete only Admin)
DROP POLICY IF EXISTS "Admins can upload" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete uploads" ON storage.objects;

CREATE POLICY "Admins and Editors can upload" ON storage.objects 
  FOR INSERT WITH CHECK (public.can_manage(auth.uid()));

CREATE POLICY "Only Admins can delete uploads" ON storage.objects 
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
