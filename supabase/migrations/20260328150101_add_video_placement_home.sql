-- Safe if 'home' was already added manually.
DO $$
BEGIN
  ALTER TYPE public.video_placement ADD VALUE 'home';
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;
