DO $$
BEGIN
  ALTER TYPE public.video_placement ADD VALUE 'global';
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;
