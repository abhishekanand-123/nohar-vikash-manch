import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { endOfDay, format, startOfDay, subDays } from "date-fns";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { ANALYTICS_ROUTE_PRESETS } from "@/lib/analytics/public-routes";
import type { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BarChart3, Globe, MonitorSmartphone, Users, Video, Eye } from "lucide-react";

type AnalyticsRow = Tables<"analytics_events">;
type VideoRow = Tables<"videos">;

const PIE_COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "#6366f1", "#ec4899", "#14b8a6", "#f97316"];

type DateRangePreset = "today" | "yesterday" | "7" | "30" | "90";

function formatWatchMs(ms: number): string {
  if (ms <= 0) return "0";
  const m = Math.floor(ms / 60000);
  const s = Math.round((ms % 60000) / 1000);
  if (m === 0) return `${s}s`;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function formatAvgPerPlay(watchMs: number, plays: number): string {
  if (plays < 1 || watchMs <= 0) return "—";
  return formatWatchMs(watchMs / plays);
}

function shortKey(k: string, n = 10) {
  if (!k) return "—";
  return `${k.slice(0, n)}…`;
}

export default function AnalyticsDashboard() {
  const [preset, setPreset] = useState<DateRangePreset>("30");
  const [pageFilter, setPageFilter] = useState("");
  const [videoFilter, setVideoFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [events, setEvents] = useState<AnalyticsRow[]>([]);
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    uniqueVisitors: 0,
    sessions: 0,
    activeRecent: 0,
  });
  const [rowCapNote, setRowCapNote] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const mainTab: "pages" | "videos" | "audience" =
    tabParam === "videos" || tabParam === "audience" ? tabParam : "pages";

  const setMainTab = (tab: "pages" | "videos" | "audience") => {
    const next = new URLSearchParams(searchParams);
    next.set("tab", tab);
    setSearchParams(next, { replace: true });
  };

  const range = useMemo(() => {
    const now = new Date();
    if (preset === "today") {
      return { start: startOfDay(now), end: endOfDay(now) };
    }
    if (preset === "yesterday") {
      const y = subDays(now, 1);
      return { start: startOfDay(y), end: endOfDay(y) };
    }
    const days = parseInt(preset, 10);
    const end = endOfDay(now);
    const start = startOfDay(subDays(end, days - 1));
    return { start, end };
  }, [preset]);

  const load = useCallback(async () => {
    setLoading(true);
    setRowCapNote(null);
    setLoadError(null);
    const fromIso = range.start.toISOString();
    const toIso = range.end.toISOString();

    const [{ data: vid }, { data: uv, error: uvErr }, { data: sc, error: scErr }, { data: act, error: actErr }] =
      await Promise.all([
        supabase.from("videos").select("id, title").order("title"),
        supabase.rpc("analytics_unique_visitors", { _from: fromIso, _to: toIso }),
        supabase.rpc("analytics_session_count", { _from: fromIso, _to: toIso }),
        supabase.rpc("analytics_active_sessions", { _minutes: 15 }),
      ]);

    if (!uvErr) setMetrics((m) => ({ ...m, uniqueVisitors: uv ?? 0 }));
    if (!scErr) setMetrics((m) => ({ ...m, sessions: sc ?? 0 }));
    if (!actErr) setMetrics((m) => ({ ...m, activeRecent: act ?? 0 }));

    setVideos((vid as VideoRow[]) ?? []);

    const { data, error } = await supabase
      .from("analytics_events")
      .select("*")
      .gte("occurred_at", fromIso)
      .lte("occurred_at", toIso)
      .order("occurred_at", { ascending: false })
      .limit(12000);
    if (error) {
      console.error(error);
      setLoadError(error.message);
      setEvents([]);
    } else {
      const rows = (data as AnalyticsRow[]) ?? [];
      setEvents(rows);
      if (rows.length >= 12000) setRowCapNote("Showing the latest 12,000 events in this range — narrow the date range for full detail.");
    }
    setLoading(false);
  }, [range.start, range.end]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const id = searchParams.get("videoId");
    if (id) setVideoFilter(id);
  }, [searchParams]);

  const routeQuickSelectValue = useMemo(() => {
    const hit = ANALYTICS_ROUTE_PRESETS.find((r) => r.path === pageFilter);
    return hit ? hit.path : "__custom__";
  }, [pageFilter]);

  const videoTitle = useMemo(() => {
    const m = new Map<string, string>();
    videos.forEach((v) => m.set(v.id, v.title));
    return m;
  }, [videos]);

  const countryFiltered = useMemo(() => {
    return events.filter((e) => {
      if (countryFilter !== "all" && (e.country ?? "Unknown") !== countryFilter) return false;
      return true;
    });
  }, [events, countryFilter]);

  /** Page analytics only — path filter, no video filter */
  const pageAnalyticsEvents = useMemo(() => {
    if (!pageFilter.trim()) return countryFiltered;
    const q = pageFilter.trim().toLowerCase();
    return countryFiltered.filter((e) => (e.page_path ?? "").toLowerCase().includes(q));
  }, [countryFiltered, pageFilter]);

  /** Video analytics — country only (always list every admin video) */
  const videoAnalyticsEvents = countryFiltered;

  /** Sections, visitors, locations */
  const audienceEvents = countryFiltered;

  /** Drill-down / event log */
  const filtered = useMemo(() => {
    let r = countryFiltered;
    if (pageFilter.trim()) {
      const q = pageFilter.trim().toLowerCase();
      r = r.filter((e) => (e.page_path ?? "").toLowerCase().includes(q));
    }
    if (videoFilter !== "all") r = r.filter((e) => e.video_id === videoFilter);
    return r;
  }, [countryFiltered, pageFilter, videoFilter]);

  const countries = useMemo(() => {
    const s = new Set<string>();
    events.forEach((e) => s.add(e.country ?? "Unknown"));
    return ["all", ...Array.from(s).sort()];
  }, [events]);

  const pageStats = useMemo(() => {
    const views = new Map<string, number>();
    const uniq = new Map<string, Set<string>>();
    const dwell = new Map<string, number>();
    pageAnalyticsEvents.forEach((e) => {
      const p = e.page_path ?? "(unknown)";
      if (e.event_type === "page_view") {
        views.set(p, (views.get(p) ?? 0) + 1);
        if (!uniq.has(p)) uniq.set(p, new Set());
        uniq.get(p)!.add(e.visitor_key);
      }
      if (e.event_type === "page_leave" && e.duration_ms != null) {
        dwell.set(p, (dwell.get(p) ?? 0) + e.duration_ms);
      }
    });
    return Array.from(views.entries())
      .map(([page_path, viewCount]) => ({
        page_path,
        viewCount,
        uniqueVisitors: uniq.get(page_path)?.size ?? 0,
        avgDwellMs: viewCount > 0 ? Math.round((dwell.get(page_path) ?? 0) / viewCount) : 0,
      }))
      .sort((a, b) => b.viewCount - a.viewCount);
  }, [pageAnalyticsEvents]);

  const trafficByDay = useMemo(() => {
    const m = new Map<string, number>();
    pageAnalyticsEvents.forEach((e) => {
      if (e.event_type !== "page_view") return;
      const d = format(new Date(e.occurred_at), "yyyy-MM-dd");
      m.set(d, (m.get(d) ?? 0) + 1);
    });
    return Array.from(m.entries())
      .map(([date, views]) => ({ date, views }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [pageAnalyticsEvents]);

  const sectionStats = useMemo(() => {
    const views = new Map<string, number>();
    const timeMs = new Map<string, number>();
    const clicks = new Map<string, number>();
    audienceEvents.forEach((e) => {
      const s = e.section_id ?? "";
      if (!s) return;
      if (e.event_type === "section_view") views.set(s, (views.get(s) ?? 0) + 1);
      if (e.event_type === "section_time" && e.duration_ms) timeMs.set(s, (timeMs.get(s) ?? 0) + e.duration_ms);
      if (e.event_type === "click_event") clicks.set(s, (clicks.get(s) ?? 0) + 1);
    });
    return Array.from(views.entries())
      .map(([section_id, viewCount]) => ({
        section_id,
        viewCount,
        timeMinutes: Math.round((timeMs.get(section_id) ?? 0) / 60000),
        clicks: clicks.get(section_id) ?? 0,
      }))
      .sort((a, b) => b.viewCount - a.viewCount);
  }, [audienceEvents]);

  const videoStats = useMemo(() => {
    const byVid = new Map<
      string,
      { plays: number; views: number; completes: number; watchMs: number; seek: number; pauses: number }
    >();
    videoAnalyticsEvents.forEach((e) => {
      if (!e.video_id) return;
      if (!byVid.has(e.video_id)) {
        byVid.set(e.video_id, { plays: 0, views: 0, completes: 0, watchMs: 0, seek: 0, pauses: 0 });
      }
      const x = byVid.get(e.video_id)!;
      if (e.event_type === "video_play") x.plays += 1;
      if (e.event_type === "video_view") x.views += 1;
      if (e.event_type === "video_complete") x.completes += 1;
      if (e.event_type === "video_watch_time" && e.duration_ms != null && e.duration_ms > 0) {
        x.watchMs += Number(e.duration_ms);
      }
      if (e.event_type === "video_seek") x.seek += 1;
      if (e.event_type === "video_pause") x.pauses += 1;
    });
    return Array.from(byVid.entries())
      .map(([video_id, s]) => ({
        video_id,
        title: videoTitle.get(video_id) ?? video_id,
        ...s,
        avgWatchMin: s.plays > 0 ? Math.round(s.watchMs / s.plays / 60000) : 0,
        completionRate: s.plays > 0 ? Math.round((s.completes / s.plays) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.plays - a.plays);
  }, [videoAnalyticsEvents, videoTitle]);

  const allVideoAnalyticsRows = useMemo(() => {
    const statsMap = new Map(videoStats.map((s) => [s.video_id, s]));
    return videos.map((v) => {
      const s = statsMap.get(v.id);
      return {
        video_id: v.id,
        title: v.title,
        placement: v.placement,
        plays: s?.plays ?? 0,
        views: s?.views ?? 0,
        completes: s?.completes ?? 0,
        watchMs: s?.watchMs ?? 0,
        seek: s?.seek ?? 0,
        pauses: s?.pauses ?? 0,
        avgWatchMin: s?.avgWatchMin ?? 0,
        completionRate: s?.completionRate ?? 0,
        watchLabel: s ? formatWatchMs(s.watchMs) : "0",
        avgLabel: s ? formatAvgPerPlay(s.watchMs, s.plays) : "—",
      };
    });
  }, [videos, videoStats]);

  const devicePie = useMemo(() => {
    const m = new Map<string, number>();
    pageAnalyticsEvents.forEach((e) => {
      if (e.event_type !== "page_view") return;
      const d = e.device_type ?? "unknown";
      m.set(d, (m.get(d) ?? 0) + 1);
    });
    return Array.from(m.entries()).map(([name, value]) => ({ name, value }));
  }, [pageAnalyticsEvents]);

  const countryPie = useMemo(() => {
    const m = new Map<string, number>();
    pageAnalyticsEvents.forEach((e) => {
      if (e.event_type !== "page_view") return;
      const c = e.country ?? "Unknown";
      m.set(c, (m.get(c) ?? 0) + 1);
    });
    return Array.from(m.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [pageAnalyticsEvents]);

  const bounceApprox = useMemo(() => {
    const pathsBySession = new Map<string, Set<string>>();
    pageAnalyticsEvents.forEach((e) => {
      if (e.event_type !== "page_view") return;
      const p = e.page_path ?? "";
      if (!pathsBySession.has(e.session_id)) pathsBySession.set(e.session_id, new Set());
      pathsBySession.get(e.session_id)!.add(p);
    });
    let single = 0;
    let total = 0;
    pathsBySession.forEach((paths) => {
      total += 1;
      if (paths.size <= 1) single += 1;
    });
    return total > 0 ? Math.round((single / total) * 1000) / 10 : 0;
  }, [pageAnalyticsEvents]);

  const visitorLog = useMemo(() => {
    const byVk = new Map<
      string,
      {
        visitor_key: string;
        country: string | null;
        device: string | null;
        browser: string | null;
        events: number;
        pages: Set<string>;
        watchMs: number;
        lastAt: string;
      }
    >();
    audienceEvents.forEach((e) => {
      if (!byVk.has(e.visitor_key)) {
        byVk.set(e.visitor_key, {
          visitor_key: e.visitor_key,
          country: e.country,
          device: e.device_type,
          browser: e.browser,
          events: 0,
          pages: new Set<string>(),
          watchMs: 0,
          lastAt: e.occurred_at,
        });
      }
      const r = byVk.get(e.visitor_key)!;
      r.events += 1;
      if (e.page_path) r.pages.add(e.page_path);
      if (e.event_type === "video_watch_time" && e.duration_ms != null && e.duration_ms > 0) {
        r.watchMs += Number(e.duration_ms);
      }
      if (e.occurred_at > r.lastAt) r.lastAt = e.occurred_at;
    });
    return Array.from(byVk.values())
      .sort((a, b) => b.events - a.events)
      .slice(0, 200);
  }, [audienceEvents]);

  const locationTraffic = useMemo(() => {
    const m = new Map<string, { country: string; region: string | null; city: string | null; views: number }>();
    audienceEvents.forEach((e) => {
      if (e.event_type !== "page_view") return;
      const key = `${e.country ?? "?"}|${e.region ?? ""}|${e.city ?? ""}`;
      if (!m.has(key)) {
        m.set(key, { country: e.country ?? "?", region: e.region, city: e.city, views: 0 });
      }
      m.get(key)!.views += 1;
    });
    return Array.from(m.values()).sort((a, b) => b.views - a.views).slice(0, 25);
  }, [audienceEvents]);

  const videoChartData = useMemo(
    () =>
      [...allVideoAnalyticsRows]
        .filter((r) => r.plays + r.views > 0)
        .sort((a, b) => b.plays - a.plays)
        .slice(0, 12),
    [allVideoAnalyticsRows]
  );

  const highlightedVideoRow = videoFilter !== "all" ? allVideoAnalyticsRows.find((r) => r.video_id === videoFilter) : null;

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="h-7 w-7 text-primary" />
          Analytics
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Consent-gated tracking. Events save via the <code className="text-xs bg-muted px-1 rounded">analytics_submit_batch</code>{" "}
          database function (works without Edge). With Edge deployed, IP/country enrich automatically.
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          {(["pages", "videos", "audience"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setMainTab(t)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                mainTab === t ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {t === "pages" ? "Page analytics" : t === "videos" ? "Video analytics" : "Audience & detail"}
            </button>
          ))}
        </div>
      </div>

      {loadError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Could not load events: {loadError}. Run Supabase migrations including{" "}
          <code className="text-xs">20260329120000_analytics_events</code> and{" "}
          <code className="text-xs">20260329133000_analytics_submit_batch_rpc</code>.
        </div>
      )}

      <div className="flex flex-wrap gap-4 items-end">
        <div className="space-y-2">
          <Label>Date range (daily breakdown in charts)</Label>
          <Select value={preset} onValueChange={(v) => setPreset(v as DateRangePreset)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="7">Last 7 days (by day)</SelectItem>
              <SelectItem value="30">Last 30 days (by day)</SelectItem>
              <SelectItem value="90">Last 90 days (by day)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {mainTab === "pages" && (
          <div className="space-y-2 min-w-[220px]">
            <Label>Route / page path</Label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Select
                value={routeQuickSelectValue}
                onValueChange={(v) => {
                  if (v !== "__custom__") setPageFilter(v);
                }}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Quick route" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__custom__">Custom path (type below)</SelectItem>
                  {ANALYTICS_ROUTE_PRESETS.map((r) => (
                    <SelectItem key={r.path} value={r.path}>
                      {r.label} ({r.path})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                className="w-full sm:flex-1 sm:min-w-[160px]"
                placeholder="e.g. /about or /videos"
                value={pageFilter}
                onChange={(e) => setPageFilter(e.target.value)}
                title="Filters page analytics to paths containing this text (case-insensitive)"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Charts and tables use events whose path includes this substring. Use <code className="rounded bg-muted px-1">/</code> for home only if paths are stored as &quot;/&quot;.
            </p>
          </div>
        )}
        {mainTab === "videos" && (
          <div className="space-y-2">
            <Label>Highlight video</Label>
            <Select value={videoFilter} onValueChange={setVideoFilter}>
              <SelectTrigger className="w-[260px]">
                <SelectValue placeholder="All videos (full list below)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All videos</SelectItem>
                {videos.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="space-y-2">
          <Label>Country</Label>
          <Select value={countryFilter} onValueChange={setCountryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {countries.map((c) => (
                <SelectItem key={c} value={c}>
                  {c === "all" ? "All" : c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="text-sm font-medium text-primary hover:underline h-10"
        >
          Refresh
        </button>
      </div>

      {rowCapNote && <p className="text-sm text-amber-700 dark:text-amber-400">{rowCapNote}</p>}

      {mainTab === "pages" && events.length === 0 && !loadError && (
        <p className="text-sm text-muted-foreground rounded-lg border border-border bg-card p-4">
          No events in this range. On the public site, accept the analytics cookie banner, browse a few pages, then click
          Refresh. Confirm the <code className="text-xs">analytics_submit_batch</code> migration is applied.
        </p>
      )}

      {mainTab === "pages" && (
      <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Unique visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.uniqueVisitors}</div>
            <p className="text-xs text-muted-foreground">Salted IP + browser ID (RPC)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sessions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.sessions}</div>
            <p className="text-xs text-muted-foreground">Distinct session_id</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active (15 min)</CardTitle>
            <MonitorSmartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeRecent}</div>
            <p className="text-xs text-muted-foreground">Recent event activity</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approx. bounce</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bounceApprox}%</div>
            <p className="text-xs text-muted-foreground">Sessions with one page (filtered)</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Traffic (page views / day)</CardTitle>
            <CardDescription>One point per calendar day in the date range (after route filter).</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trafficByDay}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top pages</CardTitle>
            <CardDescription>Views & unique visitors</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pageStats.slice(0, 8)} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="page_path" width={100} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="viewCount" name="Views" fill="hsl(var(--primary))" />
                <Bar dataKey="uniqueVisitors" name="Visitors" fill="hsl(var(--accent))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Devices</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={devicePie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {devicePie.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Regions (page views)</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={countryPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {countryPie.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      </>
      )}

      {mainTab === "videos" && (
        <div className="space-y-6">
          {highlightedVideoRow && (
            <Card className="border-primary/40">
              <CardHeader>
                <CardTitle className="text-base">Selected video</CardTitle>
                <CardDescription>Opened from Manage Videos (analytics icon) or the highlight control above.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <p className="text-muted-foreground">Title</p>
                  <p className="font-medium">{highlightedVideoRow.title}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Impressions</p>
                  <p className="font-medium">{highlightedVideoRow.views}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Plays</p>
                  <p className="font-medium">{highlightedVideoRow.plays}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Watch time</p>
                  <p className="font-medium">{highlightedVideoRow.watchLabel}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Avg / play</p>
                  <p className="font-medium">{highlightedVideoRow.avgLabel}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Completion % · Seeks</p>
                  <p className="font-medium">
                    {highlightedVideoRow.completionRate}% · {highlightedVideoRow.seek}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Video analytics (all CMS videos)
              </CardTitle>
              <CardDescription>
                One row per video in the admin library. Uploaded MP4/WebM report plays, pauses, watch time; YouTube/Vimeo embeds
                only record impressions unless you extend the tracker.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={videoChartData.length > 0 ? videoChartData : [{ title: "No activity yet", plays: 0, completes: 0 }]}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="title" tick={{ fontSize: 9 }} interval={0} angle={-18} textAnchor="end" height={72} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="plays" name="Plays" fill="hsl(var(--primary))" />
                    <Bar dataKey="completes" name="Completes" fill="hsl(var(--accent))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden md:table-cell">Placement</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                    <TableHead className="text-right">Plays</TableHead>
                    <TableHead className="text-right">Watch time</TableHead>
                    <TableHead className="text-right">Avg / play</TableHead>
                    <TableHead className="text-right">Done %</TableHead>
                    <TableHead className="text-right">Seeks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allVideoAnalyticsRows.map((s) => (
                    <TableRow key={s.video_id} className={videoFilter !== "all" && s.video_id === videoFilter ? "bg-primary/5" : undefined}>
                      <TableCell className="max-w-[200px] truncate font-medium">{s.title}</TableCell>
                      <TableCell className="hidden max-w-[140px] truncate text-xs text-muted-foreground md:table-cell">{s.placement}</TableCell>
                      <TableCell className="text-right">{s.views}</TableCell>
                      <TableCell className="text-right">{s.plays}</TableCell>
                      <TableCell className="text-right tabular-nums">{s.watchLabel}</TableCell>
                      <TableCell className="text-right tabular-nums">{s.avgLabel}</TableCell>
                      <TableCell className="text-right">{s.completionRate}</TableCell>
                      <TableCell className="text-right">{s.seek}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {mainTab === "audience" && (
      <>
      <Tabs defaultValue="sections">
        <TabsList>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="visitors">Visitors (hashed)</TabsTrigger>
        </TabsList>
        <TabsContent value="sections" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Section engagement</CardTitle>
              <CardDescription>Scroll visibility, dwell, clicks attributed to section IDs</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Section</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                    <TableHead className="text-right">Time (min)</TableHead>
                    <TableHead className="text-right">Clicks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sectionStats.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-muted-foreground">
                        No section data in range
                      </TableCell>
                    </TableRow>
                  ) : (
                    sectionStats.map((s) => (
                      <TableRow key={s.section_id}>
                        <TableCell className="font-mono text-xs">{s.section_id}</TableCell>
                        <TableCell className="text-right">{s.viewCount}</TableCell>
                        <TableCell className="text-right">{s.timeMinutes}</TableCell>
                        <TableCell className="text-right">{s.clicks}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="locations" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Location traffic</CardTitle>
              <CardDescription>Derived from IP via Edge (ip-api.com). Approximate only.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Country</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead className="text-right">Page views</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locationTraffic.map((r, i) => (
                    <TableRow key={`${r.country}-${r.region ?? ""}-${r.city ?? ""}-${i}`}>
                      <TableCell>{r.country}</TableCell>
                      <TableCell>{r.region}</TableCell>
                      <TableCell>{r.city}</TableCell>
                      <TableCell className="text-right">{r.views}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="visitors" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Visitor keys (hashed)</CardTitle>
              <CardDescription>No raw IP stored. Journey = distinct pages in filtered set.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[420px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Key</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead>Browser</TableHead>
                      <TableHead className="text-right">Events</TableHead>
                      <TableHead className="text-right">Video watch min</TableHead>
                      <TableHead>Pages touched</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visitorLog.map((v) => (
                      <TableRow key={v.visitor_key}>
                        <TableCell className="font-mono text-xs">{shortKey(v.visitor_key, 12)}</TableCell>
                        <TableCell>{v.country ?? "—"}</TableCell>
                        <TableCell>{v.device ?? "—"}</TableCell>
                        <TableCell>{v.browser ?? "—"}</TableCell>
                        <TableCell className="text-right">{v.events}</TableCell>
                        <TableCell className="text-right">{Math.round(v.watchMs / 60000)}</TableCell>
                        <TableCell className="max-w-[220px]">
                          <div className="flex flex-wrap gap-1">
                            {Array.from(v.pages)
                              .slice(0, 6)
                              .map((p) => (
                                <Badge key={p} variant="secondary" className="text-[10px] font-normal truncate max-w-[180px]">
                                  {p}
                                </Badge>
                              ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent events</CardTitle>
          <CardDescription>Newest first (max 500 rows shown)</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-80">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Page</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Video</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.slice(0, 500).map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="text-xs whitespace-nowrap">{format(new Date(e.occurred_at), "MMM d HH:mm")}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{e.event_type}</Badge>
                    </TableCell>
                    <TableCell className="text-xs max-w-[120px] truncate">{e.page_path}</TableCell>
                    <TableCell className="text-xs">{e.section_id}</TableCell>
                    <TableCell className="text-xs max-w-[140px] truncate">
                      {e.video_id ? videoTitle.get(e.video_id) ?? e.video_id : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
      </>
      )}
    </div>
  );
}