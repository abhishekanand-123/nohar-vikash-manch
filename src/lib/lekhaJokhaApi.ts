import { supabase } from "@/integrations/supabase/client";

export interface LekhaJokhaRecord {
  id: string;
  year: string; // e.g. "2026", "2025", "2024"
  title: string;
  category: string; // "वार्षिक आय-व्यय", "ऑडिट रिपोर्ट", "दान एवं सहयोग सूची", "विकास कार्य व्यय", "अन्य"
  pdf_url: string;
  file_name?: string | null;
  file_size?: string | null;
  description?: string | null;
  total_income?: number | null;
  total_expense?: number | null;
  closing_balance?: number | null;
  is_verified?: boolean;
  is_active?: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface LekhaJokhaEvent {
  id: string;
  year: string;
  event_name: string;
  category: string; // "दुर्गा पूजा", "रामनवमी महोत्सव", "छठ पूजा", "सांस्कृतिक संध्या", "नाटक व झांकी", "होली मिलन"
  event_date?: string | null;
  total_income: number;
  total_expense: number;
  balance: number;
  organizer?: string | null;
  highlights?: string | null;
  pdf_url?: string | null;
  image_url?: string | null;
  description?: string | null;
  is_active?: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

const LOCAL_STORAGE_RECORDS_KEY = "nvm_lekha_records_v1";
const LOCAL_STORAGE_EVENTS_KEY = "nvm_lekha_events_v1";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(id?: string | null): boolean {
  return !!id && UUID_RE.test(id);
}

function readCache<T>(key: string): T[] | null {
  try {
    const cached = localStorage.getItem(key);
    if (cached == null) return null;
    const parsed = JSON.parse(cached);
    return Array.isArray(parsed) ? (parsed as T[]) : null;
  } catch {
    return null;
  }
}

function writeCache<T>(key: string, list: T[]) {
  localStorage.setItem(key, JSON.stringify(list));
}

function upsertCache<T extends { id: string }>(key: string, item: T, replaceId?: string | null) {
  const list = (readCache<T>(key) ?? []).filter(
    (row) => row.id !== item.id && row.id !== replaceId
  );
  list.unshift(item);
  writeCache(key, list);
}

function removeFromCache<T extends { id: string }>(key: string, id: string) {
  const list = readCache<T>(key);
  if (!list) return;
  writeCache(
    key,
    list.filter((row) => row.id !== id)
  );
}

async function fetchTable<T>(table: string, cacheKey: string): Promise<T[]> {
  try {
    const { data, error } = await supabase
      .from(table as any)
      .select("*")
      .order("year", { ascending: false })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data)) {
      // Empty is a real result. Do not refill deleted rows from sample data.
      writeCache(cacheKey, data as T[]);
      return data as T[];
    }
    if (error) {
      console.warn(`Could not fetch ${table}:`, error.message);
    }
  } catch (err) {
    console.warn(`Could not fetch ${table}:`, err);
  }

  return readCache<T>(cacheKey) ?? [];
}

// ==================== ANNUAL PDF RECORDS API ====================

export async function fetchLekhaJokhaRecords(): Promise<LekhaJokhaRecord[]> {
  return fetchTable<LekhaJokhaRecord>("lekha_jokha_records", LOCAL_STORAGE_RECORDS_KEY);
}

export async function saveLekhaJokhaRecord(
  record: Partial<LekhaJokhaRecord>
): Promise<{ success: boolean; data?: LekhaJokhaRecord; error?: string }> {
  const remoteId = isUuid(record.id) ? record.id : null;
  const now = new Date().toISOString();

  const payload: Record<string, unknown> = {
    year: record.year || "2026",
    title: record.title?.trim() || "लेखा-जोखा रिपोर्ट",
    category: record.category || "वार्षिक आय-व्यय",
    pdf_url: record.pdf_url?.trim() || "",
    file_name: record.file_name || null,
    file_size: record.file_size || null,
    description: record.description || null,
    total_income: record.total_income !== undefined ? Number(record.total_income) : null,
    total_expense: record.total_expense !== undefined ? Number(record.total_expense) : null,
    closing_balance: record.closing_balance !== undefined ? Number(record.closing_balance) : null,
    is_verified: record.is_verified ?? true,
    is_active: record.is_active ?? true,
    sort_order: record.sort_order ?? 0,
    updated_at: now,
  };

  if (!remoteId) {
    payload.created_at = now;
  }

  try {
    const query = remoteId
      ? supabase.from("lekha_jokha_records" as any).update(payload).eq("id", remoteId).select().single()
      : supabase.from("lekha_jokha_records" as any).insert(payload).select().single();

    const { data, error } = await query;
    if (error || !data) {
      return { success: false, error: error?.message || "लेखा PDF सेव नहीं हो सका।" };
    }

    upsertCache(LOCAL_STORAGE_RECORDS_KEY, data as LekhaJokhaRecord, record.id);
    return { success: true, data: data as LekhaJokhaRecord };
  } catch (err: any) {
    return { success: false, error: err?.message || "लेखा PDF सेव नहीं हो सका।" };
  }
}

export async function deleteLekhaJokhaRecord(id: string): Promise<boolean> {
  if (isUuid(id)) {
    const { error } = await supabase.from("lekha_jokha_records" as any).delete().eq("id", id);
    if (error) throw new Error(error.message);
  }
  removeFromCache<LekhaJokhaRecord>(LOCAL_STORAGE_RECORDS_KEY, id);
  return true;
}

// ==================== CULTURAL EVENTS API ====================

export async function fetchLekhaJokhaEvents(): Promise<LekhaJokhaEvent[]> {
  return fetchTable<LekhaJokhaEvent>("lekha_jokha_events", LOCAL_STORAGE_EVENTS_KEY);
}

export async function saveLekhaJokhaEvent(
  event: Partial<LekhaJokhaEvent>
): Promise<{ success: boolean; data?: LekhaJokhaEvent; error?: string }> {
  const remoteId = isUuid(event.id) ? event.id : null;
  const now = new Date().toISOString();

  const totalIncome = Number(event.total_income) || 0;
  const totalExpense = Number(event.total_expense) || 0;
  const balance = event.balance !== undefined ? Number(event.balance) : totalIncome - totalExpense;

  const payload: Record<string, unknown> = {
    year: event.year || "2026",
    event_name: event.event_name?.trim() || "सांस्कृतिक कार्यक्रम",
    category: event.category || "सांस्कृतिक संध्या",
    event_date: event.event_date || null,
    total_income: totalIncome,
    total_expense: totalExpense,
    balance,
    organizer: event.organizer || "नोहर विकास युवक संघ",
    highlights: event.highlights || null,
    pdf_url: event.pdf_url?.trim() ? event.pdf_url.trim() : null,
    image_url: event.image_url?.trim() ? event.image_url.trim() : null,
    description: event.description || null,
    is_active: event.is_active ?? true,
    sort_order: event.sort_order ?? 0,
    updated_at: now,
  };

  if (!remoteId) {
    payload.created_at = now;
  }

  try {
    const query = remoteId
      ? supabase.from("lekha_jokha_events" as any).update(payload).eq("id", remoteId).select().single()
      : supabase.from("lekha_jokha_events" as any).insert(payload).select().single();

    const { data, error } = await query;
    if (error || !data) {
      return { success: false, error: error?.message || "कार्यक्रम सेव नहीं हो सका।" };
    }

    upsertCache(LOCAL_STORAGE_EVENTS_KEY, data as LekhaJokhaEvent, event.id);
    return { success: true, data: data as LekhaJokhaEvent };
  } catch (err: any) {
    return { success: false, error: err?.message || "कार्यक्रम सेव नहीं हो सका।" };
  }
}

export async function deleteLekhaJokhaEvent(id: string): Promise<boolean> {
  if (isUuid(id)) {
    const { error } = await supabase.from("lekha_jokha_events" as any).delete().eq("id", id);
    if (error) throw new Error(error.message);
  }
  removeFromCache<LekhaJokhaEvent>(LOCAL_STORAGE_EVENTS_KEY, id);
  return true;
}
