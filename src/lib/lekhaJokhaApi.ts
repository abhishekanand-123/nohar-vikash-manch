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

// Rich default sample data for 2026 and 2025
const DEFAULT_SAMPLE_RECORDS: LekhaJokhaRecord[] = [
  {
    id: "rec-2026-1",
    year: "2026",
    title: "वार्षिक आय-व्यय व विकास निधि लेखा-जोखा (2025-2026)",
    category: "वार्षिक आय-व्यय",
    pdf_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    file_name: "Annual_Financial_Report_2026.pdf",
    file_size: "3.4 MB",
    description: "वर्ष 2025-26 के अंतर्गत ग्राम विकास, सामाजिक कार्यक्रम एवं जनसहयोग से प्राप्त संपूर्ण आय एवं व्यय का विस्तृत प्रमाणित ब्योरा।",
    total_income: 345000,
    total_expense: 288400,
    closing_balance: 56600,
    is_verified: true,
    is_active: true,
    sort_order: 1,
    created_at: "2026-03-31T10:00:00.000Z",
  },
  {
    id: "rec-2026-2",
    year: "2026",
    title: "रामनवमी व सांस्कृतिक महोत्सव विशेष लेखा रिपोर्ट (2026)",
    category: "विशेष कार्यक्रम लेखा",
    pdf_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    file_name: "Ramnavami_Mahotsav_Accounts_2026.pdf",
    file_size: "2.1 MB",
    description: "रामनवमी 2026 में जनसहयोग से एकत्र चंदा, झांकी मंचन, भंडारा एवं महाप्रसाद वितरण का मदवार प्रमाणित हिसाब।",
    total_income: 185000,
    total_expense: 172350,
    closing_balance: 12650,
    is_verified: true,
    is_active: true,
    sort_order: 2,
    created_at: "2026-03-15T12:00:00.000Z",
  },
  {
    id: "rec-2026-3",
    year: "2026",
    title: "ग्राम पुस्तकालय व खेल मैदान नवीनीकरण व्यय विवरण",
    category: "विकास कार्य व्यय",
    pdf_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    file_name: "Library_Sports_Expenditure_2026.pdf",
    file_size: "1.8 MB",
    description: "नोहर युवा केंद्र, खेल सामग्री क्रय एवं ग्राम पुस्तकालय रखरखाव का पूर्ण बिल व वाउचर विवरण।",
    total_income: 75000,
    total_expense: 71200,
    closing_balance: 3800,
    is_verified: true,
    is_active: true,
    sort_order: 3,
    created_at: "2026-02-20T09:30:00.000Z",
  },
  {
    id: "rec-2025-1",
    year: "2025",
    title: "वार्षिक सामान्य लेखा व वित्तीय प्रतिवेदन (2024-2025)",
    category: "वार्षिक आय-व्यय",
    pdf_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    file_name: "Annual_Statement_2025.pdf",
    file_size: "4.2 MB",
    description: "वित्तीय वर्ष 2024-25 का पूर्ण लेखा परीक्षण, ग्राम दानदाताओं की सूची एवं कार्यकारिणी द्वारा अनुमोदित वार्षिक वित्तीय रिपोर्ट।",
    total_income: 298000,
    total_expense: 264500,
    closing_balance: 33500,
    is_verified: true,
    is_active: true,
    sort_order: 1,
    created_at: "2025-03-31T11:00:00.000Z",
  },
  {
    id: "rec-2025-2",
    year: "2025",
    title: "दुर्गा पूजा एवं भव्य सांस्कृतिक संध्या लेखा-जोखा 2025",
    category: "विशेष कार्यक्रम लेखा",
    pdf_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    file_name: "Durga_Puja_Lekha_2025.pdf",
    file_size: "2.8 MB",
    description: "शारदीय नवरात्र दुर्गा पूजा 2025 में पंडाल निर्माण, विद्युत सज्जा, मूर्ति स्थापना एवं सांस्कृतिक संध्या का विस्तृत खर्च।",
    total_income: 215000,
    total_expense: 201800,
    closing_balance: 13200,
    is_verified: true,
    is_active: true,
    sort_order: 2,
    created_at: "2025-10-25T14:15:00.000Z",
  },
  {
    id: "rec-2025-3",
    year: "2025",
    title: "वार्षिक ऑडिट एवं सत्यापन प्रमाण पत्र (Audit Report 2025)",
    category: "ऑडिट रिपोर्ट",
    pdf_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    file_name: "Audit_Verification_2025.pdf",
    file_size: "1.5 MB",
    description: "स्वतंत्र लेखा परीक्षकों एवं ग्राम समिति के वरिष्ठ सदस्यों द्वारा अनुमोदित वार्षिक लेखा परीक्षण व बैलेंस शीट।",
    total_income: 298000,
    total_expense: 264500,
    closing_balance: 33500,
    is_verified: true,
    is_active: true,
    sort_order: 3,
    created_at: "2025-04-10T16:00:00.000Z",
  },
];

const DEFAULT_SAMPLE_EVENTS: LekhaJokhaEvent[] = [
  {
    id: "ev-2026-1",
    year: "2026",
    event_name: "श्री रामनवमी महोत्सव, भव्य शोभायात्रा एवं भजन संध्या 2026",
    category: "रामनवमी महोत्सव",
    event_date: "27 मार्च 2026",
    total_income: 185000,
    total_expense: 172350,
    balance: 12650,
    organizer: "रामनवमी आयोजन समिति एवं नोहर विकास युवक संघ",
    highlights: "भव्य रथ यात्रा, 21 झांकियां, सुप्रसिद्ध भजन कलाकारों द्वारा प्रस्तुति, 5000+ श्रद्धालुओं का महाप्रसाद",
    pdf_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    image_url: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
    description: "रामनवमी के पावन अवसर पर भव्य झांकी व 2 दिवसीय भजन संध्या का आयोजन किया गया। समस्त ग्रामवासियों के सहयोग से कार्यक्रम सफलता पूर्वक संपन्न हुआ।",
    is_active: true,
    sort_order: 1,
    created_at: "2026-03-28T18:00:00.000Z",
  },
  {
    id: "ev-2026-2",
    year: "2026",
    event_name: "होली मिलन समारोह व पारम्परिक फाग गायन प्रतियोगिता",
    category: "होली मिलन",
    event_date: "04 मार्च 2026",
    total_income: 42000,
    total_expense: 38500,
    balance: 3500,
    organizer: "सांस्कृतिक मंच नोहर",
    highlights: "पारम्परिक फगुआ गायन, वरिष्ठ ग्रामीणों का सम्मान, अबीर-गुलाल उत्सव एवं मिष्ठान वितरण",
    pdf_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    image_url: "https://images.unsplash.com/photo-1576919228236-a097c32a5cd4?auto=format&fit=crop&w=800&q=80",
    description: "ग्राम नोहर में भाईचारे और सांस्कृतिक धरोहर को संजोने हेतु वार्षिक होली मिलन व लोकगीत फाग प्रतियोगिता का सफल आयोजन।",
    is_active: true,
    sort_order: 2,
    created_at: "2026-03-05T12:00:00.000Z",
  },
  {
    id: "ev-2025-1",
    year: "2025",
    event_name: "भव्य शारदीय दुर्गा पूजा एवं 3-दिवसीय सांस्कृतिक मेला 2025",
    category: "दुर्गा पूजा",
    event_date: "01 - 04 अक्टूबर 2025",
    total_income: 215000,
    total_expense: 201800,
    balance: 13200,
    organizer: "दुर्गा पूजा सार्वजनिक समिति नोहर",
    highlights: "भव्य पंडाल, कोलकाता के मूर्तिकारों द्वारा मां दुर्गा की प्रतिमा, लोक नृत्य व नाटक मंचन, विशाल भंडारा",
    pdf_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    image_url: "https://images.unsplash.com/photo-1601055903647-87e16e099a4e?auto=format&fit=crop&w=800&q=80",
    description: "विशाल दुर्गा पूजा महोत्सव जिसमें 10 से अधिक गांवों के श्रद्धालुओं ने भाग लिया। सांस्कृतिक संध्या में बाल कलाकारों द्वारा मनमोहक प्रस्तुतियां दी गईं।",
    is_active: true,
    sort_order: 1,
    created_at: "2025-10-06T15:00:00.000Z",
  },
  {
    id: "ev-2025-2",
    year: "2025",
    event_name: "श्री कृष्ण जन्माष्टमी महोत्सव, मटका फोड़ व सांस्कृतिक संध्या",
    category: "सांस्कृतिक संध्या",
    event_date: "16 अगस्त 2025",
    total_income: 68000,
    total_expense: 63400,
    balance: 4600,
    organizer: "युवा बाल मंच एवं नोहर विकास संघ",
    highlights: "राधा-कृष्ण झांकी, मटका फोड़ प्रतियोगिता (विजेता पुरस्कार ₹5100), भजन संध्या एवं महाप्रसाद",
    pdf_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    image_url: "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=800&q=80",
    description: "जन्माष्टमी की पावन रात्रि में बालकों द्वारा सांस्कृतिक नृत्य एवं झांकी मंचन, मटका फोड़ प्रतियोगिता में 6 टीमों ने उत्साहपूर्वक भाग लिया।",
    is_active: true,
    sort_order: 2,
    created_at: "2025-08-17T10:00:00.000Z",
  },
  {
    id: "ev-2025-3",
    year: "2025",
    event_name: "लोक आस्था का महापर्व छठ पूजा घाट व्यवस्था व स्वच्छता अभियान",
    category: "छठ पूजा",
    event_date: "27 - 28 अक्टूबर 2025",
    total_income: 48000,
    total_expense: 44200,
    balance: 3800,
    organizer: "नोहर विकास युवक संघ (छठ सेवा दल)",
    highlights: "पोखर घाट की विशेष सफाई, 500+ सोलर व सजावटी लाइट व्यवस्था, निःशुल्क दूध व पूजन सामग्री वितरण",
    pdf_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    image_url: "https://images.unsplash.com/photo-1514222709107-a180c68d72b4?auto=format&fit=crop&w=800&q=80",
    description: "छठ महापर्व पर व्रतियों की सुविधा के लिए घाटों पर प्रकाश, सुरक्षा, पेयजल एवं निःशुल्क सहायता शिविर का सफल संचालन।",
    is_active: true,
    sort_order: 3,
    created_at: "2025-10-30T10:00:00.000Z",
  },
];

const LOCAL_STORAGE_RECORDS_KEY = "nvm_lekha_records_v1";
const LOCAL_STORAGE_EVENTS_KEY = "nvm_lekha_events_v1";

// ==================== ANNUAL PDF RECORDS API ====================

export async function fetchLekhaJokhaRecords(): Promise<LekhaJokhaRecord[]> {
  try {
    const { data, error } = await supabase
      .from("lekha_jokha_records" as any)
      .select("*")
      .order("year", { ascending: false })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_RECORDS_KEY, JSON.stringify(data));
      return data as LekhaJokhaRecord[];
    }
  } catch (err) {
    console.warn("Could not fetch records from Supabase, checking local storage / defaults:", err);
  }

  // Check LocalStorage fallback
  const cached = localStorage.getItem(LOCAL_STORAGE_RECORDS_KEY);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {
      // ignore
    }
  }

  localStorage.setItem(LOCAL_STORAGE_RECORDS_KEY, JSON.stringify(DEFAULT_SAMPLE_RECORDS));
  return DEFAULT_SAMPLE_RECORDS;
}

export async function saveLekhaJokhaRecord(record: Partial<LekhaJokhaRecord>): Promise<{ success: boolean; data?: LekhaJokhaRecord; error?: string }> {
  const isEditing = Boolean(record.id);
  const now = new Date().toISOString();

  const payload: any = {
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

  if (!isEditing) {
    payload.created_at = now;
  }

  // Try saving to Supabase
  try {
    if (isEditing && record.id) {
      const { data, error } = await supabase
        .from("lekha_jokha_records" as any)
        .update(payload)
        .eq("id", record.id)
        .select()
        .single();

      if (!error && data) {
        updateLocalRecordCache(data as LekhaJokhaRecord);
        return { success: true, data: data as LekhaJokhaRecord };
      }
    } else {
      const { data, error } = await supabase
        .from("lekha_jokha_records" as any)
        .insert(payload)
        .select()
        .single();

      if (!error && data) {
        updateLocalRecordCache(data as LekhaJokhaRecord);
        return { success: true, data: data as LekhaJokhaRecord };
      }
    }
  } catch (err: any) {
    console.warn("Supabase record write failed, falling back to local cache:", err);
  }

  // Local fallback
  const currentList = await fetchLekhaJokhaRecords();
  let updatedItem: LekhaJokhaRecord;

  if (isEditing && record.id) {
    updatedItem = {
      ...currentList.find((r) => r.id === record.id),
      ...payload,
      id: record.id,
    } as LekhaJokhaRecord;
    const newList = currentList.map((r) => (r.id === record.id ? updatedItem : r));
    localStorage.setItem(LOCAL_STORAGE_RECORDS_KEY, JSON.stringify(newList));
  } else {
    updatedItem = {
      ...payload,
      id: `local-rec-${Date.now()}`,
    } as LekhaJokhaRecord;
    const newList = [updatedItem, ...currentList];
    localStorage.setItem(LOCAL_STORAGE_RECORDS_KEY, JSON.stringify(newList));
  }

  return { success: true, data: updatedItem };
}

export async function deleteLekhaJokhaRecord(id: string): Promise<boolean> {
  try {
    await supabase
      .from("lekha_jokha_records" as any)
      .delete()
      .eq("id", id);
  } catch (err) {
    console.warn("Supabase record delete failed, deleting from local cache:", err);
  }

  const currentList = await fetchLekhaJokhaRecords();
  const filtered = currentList.filter((r) => r.id !== id);
  localStorage.setItem(LOCAL_STORAGE_RECORDS_KEY, JSON.stringify(filtered));
  return true;
}

function updateLocalRecordCache(item: LekhaJokhaRecord) {
  const cached = localStorage.getItem(LOCAL_STORAGE_RECORDS_KEY);
  if (cached) {
    try {
      const list: LekhaJokhaRecord[] = JSON.parse(cached);
      const idx = list.findIndex((r) => r.id === item.id);
      if (idx >= 0) {
        list[idx] = item;
      } else {
        list.unshift(item);
      }
      localStorage.setItem(LOCAL_STORAGE_RECORDS_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
  }
}

// ==================== CULTURAL EVENTS API ====================

export async function fetchLekhaJokhaEvents(): Promise<LekhaJokhaEvent[]> {
  try {
    const { data, error } = await supabase
      .from("lekha_jokha_events" as any)
      .select("*")
      .order("year", { ascending: false })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_EVENTS_KEY, JSON.stringify(data));
      return data as LekhaJokhaEvent[];
    }
  } catch (err) {
    console.warn("Could not fetch events from Supabase, checking local storage / defaults:", err);
  }

  const cached = localStorage.getItem(LOCAL_STORAGE_EVENTS_KEY);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {
      // ignore
    }
  }

  localStorage.setItem(LOCAL_STORAGE_EVENTS_KEY, JSON.stringify(DEFAULT_SAMPLE_EVENTS));
  return DEFAULT_SAMPLE_EVENTS;
}

export async function saveLekhaJokhaEvent(event: Partial<LekhaJokhaEvent>): Promise<{ success: boolean; data?: LekhaJokhaEvent; error?: string }> {
  const isEditing = Boolean(event.id);
  const now = new Date().toISOString();

  const totalIncome = Number(event.total_income) || 0;
  const totalExpense = Number(event.total_expense) || 0;
  const balance = event.balance !== undefined ? Number(event.balance) : totalIncome - totalExpense;

  const payload: any = {
    year: event.year || "2026",
    event_name: event.event_name?.trim() || "सांस्कृतिक कार्यक्रम",
    category: event.category || "सांस्कृतिक संध्या",
    event_date: event.event_date || null,
    total_income: totalIncome,
    total_expense: totalExpense,
    balance: balance,
    organizer: event.organizer || "नोहर विकास युवक संघ",
    highlights: event.highlights || null,
    pdf_url: event.pdf_url || null,
    image_url: event.image_url || null,
    description: event.description || null,
    is_active: event.is_active ?? true,
    sort_order: event.sort_order ?? 0,
    updated_at: now,
  };

  if (!isEditing) {
    payload.created_at = now;
  }

  try {
    if (isEditing && event.id) {
      const { data, error } = await supabase
        .from("lekha_jokha_events" as any)
        .update(payload)
        .eq("id", event.id)
        .select()
        .single();

      if (!error && data) {
        updateLocalEventCache(data as LekhaJokhaEvent);
        return { success: true, data: data as LekhaJokhaEvent };
      }
    } else {
      const { data, error } = await supabase
        .from("lekha_jokha_events" as any)
        .insert(payload)
        .select()
        .single();

      if (!error && data) {
        updateLocalEventCache(data as LekhaJokhaEvent);
        return { success: true, data: data as LekhaJokhaEvent };
      }
    }
  } catch (err: any) {
    console.warn("Supabase event write failed, falling back to local cache:", err);
  }

  // Local fallback
  const currentList = await fetchLekhaJokhaEvents();
  let updatedItem: LekhaJokhaEvent;

  if (isEditing && event.id) {
    updatedItem = {
      ...currentList.find((e) => e.id === event.id),
      ...payload,
      id: event.id,
    } as LekhaJokhaEvent;
    const newList = currentList.map((e) => (e.id === event.id ? updatedItem : e));
    localStorage.setItem(LOCAL_STORAGE_EVENTS_KEY, JSON.stringify(newList));
  } else {
    updatedItem = {
      ...payload,
      id: `local-ev-${Date.now()}`,
    } as LekhaJokhaEvent;
    const newList = [updatedItem, ...currentList];
    localStorage.setItem(LOCAL_STORAGE_EVENTS_KEY, JSON.stringify(newList));
  }

  return { success: true, data: updatedItem };
}

export async function deleteLekhaJokhaEvent(id: string): Promise<boolean> {
  try {
    await supabase
      .from("lekha_jokha_events" as any)
      .delete()
      .eq("id", id);
  } catch (err) {
    console.warn("Supabase event delete failed, deleting from local cache:", err);
  }

  const currentList = await fetchLekhaJokhaEvents();
  const filtered = currentList.filter((e) => e.id !== id);
  localStorage.setItem(LOCAL_STORAGE_EVENTS_KEY, JSON.stringify(filtered));
  return true;
}

function updateLocalEventCache(item: LekhaJokhaEvent) {
  const cached = localStorage.getItem(LOCAL_STORAGE_EVENTS_KEY);
  if (cached) {
    try {
      const list: LekhaJokhaEvent[] = JSON.parse(cached);
      const idx = list.findIndex((e) => e.id === item.id);
      if (idx >= 0) {
        list[idx] = item;
      } else {
        list.unshift(item);
      }
      localStorage.setItem(LOCAL_STORAGE_EVENTS_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
  }
}
