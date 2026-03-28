-- Client ingest fallback when Edge Function is not deployed (no IP/geo; visitor_key from hashed visitor_id only).

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.analytics_submit_batch(
  p_events jsonb,
  p_visitor_id text,
  p_session_id text,
  p_device_type text,
  p_browser text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ev jsonb;
  n int := 0;
  vk text;
  et text;
  vid uuid;
  dms int;
BEGIN
  IF p_visitor_id IS NULL OR length(trim(p_visitor_id)) < 8 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_visitor');
  END IF;
  IF p_session_id IS NULL OR length(trim(p_session_id)) < 8 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_session');
  END IF;

  vk := encode(digest('nv_analytics_v1:' || trim(p_visitor_id), 'sha256'), 'hex');

  FOR ev IN
    SELECT jsonb_array_elements(coalesce(p_events, '[]'::jsonb))
  LOOP
    EXIT WHEN n >= 50;
    et := trim(lower(ev->>'type'));
    IF et IS NULL OR et NOT IN (
      'page_view', 'page_leave', 'section_view', 'section_time', 'click_event',
      'video_play', 'video_pause', 'video_seek', 'video_watch_time', 'video_complete', 'video_ended', 'video_view'
    ) THEN
      CONTINUE;
    END IF;

    vid := NULL;
    IF ev ? 'videoId' AND nullif(trim(ev->>'videoId'), '') IS NOT NULL THEN
      BEGIN
        vid := (trim(ev->>'videoId'))::uuid;
      EXCEPTION WHEN invalid_text_representation THEN
        vid := NULL;
      END;
    END IF;

    dms := NULL;
    IF ev ? 'durationMs' AND ev->>'durationMs' IS NOT NULL AND ev->>'durationMs' ~ '^-?[0-9]+$' THEN
      dms := (ev->>'durationMs')::int;
    END IF;

    INSERT INTO public.analytics_events (
      event_type, page_path, section_id, video_id,
      session_id, visitor_id, visitor_key,
      ip_hash, country, region, city,
      device_type, browser,
      occurred_at, duration_ms, metadata
    ) VALUES (
      et,
      nullif(trim(ev->>'pagePath'), ''),
      nullif(trim(ev->>'sectionId'), ''),
      vid,
      trim(p_session_id),
      trim(p_visitor_id),
      vk,
      NULL,
      NULL, NULL, NULL,
      nullif(trim(coalesce(p_device_type, '')), ''),
      nullif(trim(coalesce(p_browser, '')), ''),
      coalesce((ev->>'occurredAt')::timestamptz, now()),
      dms,
      coalesce(ev->'metadata', '{}'::jsonb)
    );
    n := n + 1;
  END LOOP;

  RETURN jsonb_build_object('ok', true, 'inserted', n);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('ok', false, 'error', SQLERRM);
END;
$$;

REVOKE ALL ON FUNCTION public.analytics_submit_batch(jsonb, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.analytics_submit_batch(jsonb, text, text, text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.analytics_submit_batch(jsonb, text, text, text, text) TO authenticated;
