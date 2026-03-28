import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ALLOWED_EVENTS = new Set([
  "page_view",
  "page_leave",
  "section_view",
  "section_time",
  "click_event",
  "video_play",
  "video_pause",
  "video_seek",
  "video_watch_time",
  "video_complete",
  "video_ended",
  "video_view",
]);

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    return xff.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

async function lookupGeo(ip: string): Promise<{ country: string | null; region: string | null; city: string | null }> {
  if (!ip || ip === "unknown" || ip.startsWith("127.") || ip === "::1") {
    return { country: null, region: null, city: null };
  }
  try {
    const r = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,regionName,city`, {
      signal: AbortSignal.timeout(2500),
    });
    if (!r.ok) return { country: null, region: null, city: null };
    const j = (await r.json()) as { status?: string; country?: string; regionName?: string; city?: string };
    if (j.status !== "success") return { country: null, region: null, city: null };
    return {
      country: j.country ?? null,
      region: j.regionName ?? null,
      city: j.city ?? null,
    };
  } catch {
    return { country: null, region: null, city: null };
  }
}

interface InEvent {
  type: string;
  pagePath?: string | null;
  sectionId?: string | null;
  videoId?: string | null;
  occurredAt?: string | null;
  durationMs?: number | null;
  metadata?: Record<string, unknown> | null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const salt = Deno.env.get("ANALYTICS_IP_SALT") ?? "change-me-in-production";

  let body: {
    events?: InEvent[];
    visitorId?: string;
    sessionId?: string;
    deviceType?: string;
    browser?: string;
    consent?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!body.consent) {
    return new Response(JSON.stringify({ error: "consent_required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const visitorId = typeof body.visitorId === "string" && body.visitorId.length > 0 ? body.visitorId : null;
  const sessionId = typeof body.sessionId === "string" && body.sessionId.length > 0 ? body.sessionId : null;
  const deviceType = typeof body.deviceType === "string" ? body.deviceType : null;
  const browser = typeof body.browser === "string" ? body.browser : null;

  if (!visitorId || !sessionId) {
    return new Response(JSON.stringify({ error: "missing_visitor_or_session" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const events = Array.isArray(body.events) ? body.events.slice(0, 80) : [];
  if (events.length === 0) {
    return new Response(JSON.stringify({ ok: true, inserted: 0 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const ip = clientIp(req);
  const ipHash = await sha256Hex(`${salt}:${ip}`);
  const visitorKey = await sha256Hex(`${salt}:${ip}:${visitorId}`);
  const geo = await lookupGeo(ip);

  const supabase = createClient(supabaseUrl, serviceKey);

  const rows = [];
  for (const ev of events) {
    if (!ev || typeof ev.type !== "string" || !ALLOWED_EVENTS.has(ev.type)) continue;
    const occurredAt = ev.occurredAt ? new Date(ev.occurredAt).toISOString() : new Date().toISOString();
    let videoId: string | null =
      typeof ev.videoId === "string" && /^[0-9a-f-]{36}$/i.test(ev.videoId) ? ev.videoId : null;
    if (videoId === "") videoId = null;

    rows.push({
      event_type: ev.type,
      page_path: ev.pagePath ?? null,
      section_id: ev.sectionId ?? null,
      video_id: videoId,
      session_id: sessionId,
      visitor_id: visitorId,
      visitor_key: visitorKey,
      ip_hash: ipHash,
      country: geo.country,
      region: geo.region,
      city: geo.city,
      device_type: deviceType,
      browser: browser,
      occurred_at: occurredAt,
      duration_ms: typeof ev.durationMs === "number" && Number.isFinite(ev.durationMs) ? Math.round(ev.durationMs) : null,
      metadata: ev.metadata && typeof ev.metadata === "object" ? ev.metadata : {},
    });
  }

  if (rows.length === 0) {
    return new Response(JSON.stringify({ ok: true, inserted: 0 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { error } = await supabase.from("analytics_events").insert(rows);
  if (error) {
    console.error("analytics insert error", error);
    return new Response(JSON.stringify({ error: "insert_failed", detail: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true, inserted: rows.length }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
