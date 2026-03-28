export type AnalyticsEventType =
  | "page_view"
  | "page_leave"
  | "section_view"
  | "section_time"
  | "click_event"
  | "video_play"
  | "video_pause"
  | "video_seek"
  | "video_watch_time"
  | "video_complete"
  | "video_ended"
  | "video_view";

export interface AnalyticsEventPayload {
  type: AnalyticsEventType;
  pagePath?: string | null;
  sectionId?: string | null;
  videoId?: string | null;
  occurredAt?: string;
  durationMs?: number | null;
  metadata?: Record<string, unknown>;
}
