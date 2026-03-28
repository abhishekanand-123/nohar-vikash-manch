DO $$
BEGIN
  ALTER TYPE public.video_placement ADD VALUE 'page';
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;
