-- Privacy-focused analytics: rows inserted only via Edge Function (service role).
-- visitor_key / ip_hash are salted hashes; no raw IP stored.

CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL CHECK (event_type IN (
    'page_view',
    'page_leave',
    'section_view',
    'section_time',
    'click_event',
    'video_play',
    'video_pause',
    'video_seek',
    'video_watch_time',
    'video_complete',
    'video_ended',
    'video_view'
  )),
  page_path text,
  section_id text,
  video_id uuid REFERENCES public.videos(id) ON DELETE SET NULL,
  session_id text NOT NULL,
  visitor_id text NOT NULL,
  visitor_key text NOT NULL,
  ip_hash text,
  country text,
  region text,
  city text,
  device_type text,
  browser text,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  duration_ms integer,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX analytics_events_occurred_at_idx ON public.analytics_events (occurred_at DESC);
CREATE INDEX analytics_events_page_path_idx ON public.analytics_events (page_path);
CREATE INDEX analytics_events_visitor_key_idx ON public.analytics_events (visitor_key);
CREATE INDEX analytics_events_session_id_idx ON public.analytics_events (session_id);
CREATE INDEX analytics_events_video_id_idx ON public.analytics_events (video_id) WHERE video_id IS NOT NULL;
CREATE INDEX analytics_events_type_occurred_idx ON public.analytics_events (event_type, occurred_at DESC);
CREATE INDEX analytics_events_location_idx ON public.analytics_events (country, region, city);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read analytics events"
  ON public.analytics_events
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- No INSERT/UPDATE/DELETE for authenticated or anon — only service role (Edge).

CREATE OR REPLACE FUNCTION public.analytics_unique_visitors(
  _from timestamptz,
  _to timestamptz
)
RETURNS integer
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  RETURN (
    SELECT count(DISTINCT visitor_key)::integer
    FROM public.analytics_events
    WHERE occurred_at >= _from AND occurred_at <= _to
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.analytics_session_count(
  _from timestamptz,
  _to timestamptz
)
RETURNS integer
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  RETURN (
    SELECT count(DISTINCT session_id)::integer
    FROM public.analytics_events
    WHERE occurred_at >= _from AND occurred_at <= _to
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.analytics_active_sessions(_minutes integer DEFAULT 15)
RETURNS integer
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cutoff timestamptz := now() - make_interval(mins => greatest(_minutes, 1));
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  RETURN (
    SELECT count(DISTINCT session_id)::integer
    FROM public.analytics_events
    WHERE occurred_at >= cutoff
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.analytics_unique_visitors(timestamptz, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.analytics_session_count(timestamptz, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.analytics_active_sessions(integer) TO authenticated;
