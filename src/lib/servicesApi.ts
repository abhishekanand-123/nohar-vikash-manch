import { supabase } from "@/integrations/supabase/client";

export interface VillageService {
  id: string;
  name: string;
  category: string;
  phone: string;
  whatsapp?: string | null;
  skill?: string | null;
  experience?: string | null;
  address?: string | null;
  image?: string | null;
  description?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

const DEFAULT_SAMPLE_SERVICES: VillageService[] = [
  {
    id: "s-1",
    name: "सुनील कुमार शर्मा",
    category: "शिक्षक (Teacher)",
    phone: "9876543210",
    whatsapp: "9876543210",
    skill: "गणित एवं विज्ञान ट्यूशन (कक्षा 6 से 10वीं)",
    experience: "8 वर्ष का अनुभव",
    address: "नोहर वार्ड 03, स्कूल के पास",
    description: "बोर्ड परीक्षा की तैयारी व बेसिक कांसेप्ट की विशेष कक्षाएँ।",
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "s-2",
    name: "रमेश मिस्त्री",
    category: "मिस्त्री (Mistri)",
    phone: "9876543211",
    whatsapp: "9876543211",
    skill: "भवन निर्माण, प्लास्टर व टाइल्स मार्बल फिटिंग",
    experience: "12 वर्ष का अनुभव",
    address: "नोहर वार्ड 05, दुर्गा स्थान",
    description: "मकान, छत ढलाई व बाउंड्री वॉल का पक्का व मजबूत काम।",
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "s-3",
    name: "अमित कुमार मंडल",
    category: "इलेक्ट्रीशियन (Electrician)",
    phone: "9876543212",
    whatsapp: "9876543212",
    skill: "घर की वायरिंग, पंखा, मोटर व इन्वर्टर रिपेयरिंग",
    experience: "6 वर्ष का अनुभव",
    address: "नोहर मुख्य बाजार",
    description: "बिजली फिटिंग, बोरिंग मोटर कनेक्शन व इमरजेंसी रिपेयरिंग।",
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "s-4",
    name: "बिरजू यादव",
    category: "श्रमिक / मजदूर (Labor)",
    phone: "9876543213",
    whatsapp: "9876543213",
    skill: "खेती-बाड़ी, लोडिंग-अनलोडिंग व निर्माण कार्य",
    experience: "10+ वर्ष",
    address: "नोहर पश्चिम टोला",
    description: "दैनिक मजदूरी व कृषि कार्यों हेतु अनुभवी लेबर टीम उपलब्ध।",
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "s-5",
    name: "डॉ. राजेश कुमार (RMP)",
    category: "स्वास्थ्य कर्मी / डॉक्टर (Health)",
    phone: "9876543214",
    whatsapp: "9876543214",
    skill: "प्राथमिक चिकित्सा, बीपी/शुगर जांच व ड्रेसिंग",
    experience: "15 वर्ष का अनुभव",
    address: "नोहर चौक क्लिनिक",
    description: "घर पर प्राथमिक उपचार व इमरजेंसी सेवा 24x7 उपलब्ध।",
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "s-6",
    name: "विनोद प्लंबर",
    category: "प्लंबर (Plumber)",
    phone: "9876543215",
    whatsapp: "9876543215",
    skill: "नल फिटिंग, मोटर पाइपलाइन व वाटर टैंक इंस्टॉलेशन",
    experience: "7 वर्ष का अनुभव",
    address: "नोहर वार्ड 02",
    description: "बाथरूम फिटिंग व पाइप लीकेज समाधान।",
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

const LOCAL_STORAGE_KEY = "nvm_village_services_cache";

export async function fetchVillageServices(): Promise<VillageService[]> {
  try {
    const { data, error } = await supabase
      .from("village_services" as any)
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      return data as VillageService[];
    }
  } catch (err) {
    console.warn("Could not fetch from Supabase, loading fallback/cache:", err);
  }

  // Load from local storage or default sample data
  const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // ignore
    }
  }

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_SAMPLE_SERVICES));
  return DEFAULT_SAMPLE_SERVICES;
}

export async function saveVillageService(service: Omit<VillageService, "id" | "created_at"> & { id?: string }): Promise<VillageService> {
  const isEditing = Boolean(service.id);
  const id = service.id || crypto.randomUUID();
  const timestamp = new Date().toISOString();

  const record: VillageService = {
    id,
    name: service.name,
    category: service.category,
    phone: service.phone,
    whatsapp: service.whatsapp || service.phone,
    skill: service.skill || "",
    experience: service.experience || "",
    address: service.address || "",
    image: service.image || null,
    description: service.description || "",
    is_active: service.is_active ?? true,
    created_at: timestamp,
    updated_at: timestamp,
  };

  // 1. Try Supabase
  try {
    if (isEditing) {
      await supabase
        .from("village_services" as any)
        .update(record as any)
        .eq("id", id);
    } else {
      await supabase
        .from("village_services" as any)
        .insert([record as any]);
    }
  } catch (err) {
    console.warn("Could not save to Supabase, saving to local cache:", err);
  }

  // 2. Always sync local cache
  const cached = await fetchVillageServices();
  let updatedList: VillageService[];
  if (isEditing) {
    updatedList = cached.map((item) => (item.id === id ? { ...item, ...record } : item));
  } else {
    updatedList = [record, ...cached.filter((c) => c.id !== id)];
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));

  return record;
}

export async function deleteVillageService(id: string): Promise<boolean> {
  try {
    await supabase
      .from("village_services" as any)
      .delete()
      .eq("id", id);
  } catch (err) {
    console.warn("Could not delete from Supabase:", err);
  }

  const cached = await fetchVillageServices();
  const updatedList = cached.filter((item) => item.id !== id);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
  return true;
}
