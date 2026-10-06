import { useState, useEffect } from "react";
import {
  FileSpreadsheet,
  Plus,
  Pencil,
  Trash2,
  Upload,
  FileText,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Image as ImageIcon,
  Save,
  Eye,
  TrendingUp,
  TrendingDown,
  Building2,
  Sparkles,
  RefreshCw,
  X,
  Layers,
  PanelsTopLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  fetchLekhaJokhaRecords,
  saveLekhaJokhaRecord,
  deleteLekhaJokhaRecord,
  fetchLekhaJokhaEvents,
  saveLekhaJokhaEvent,
  deleteLekhaJokhaEvent,
  LekhaJokhaRecord,
  LekhaJokhaEvent,
} from "@/lib/lekhaJokhaApi";
import { uploadPdfFile, uploadFile } from "@/lib/supabase-helpers";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import SEO from "@/components/common/SEO";

const PDF_CATEGORIES = [
  "वार्षिक आय-व्यय",
  "ऑडिट रिपोर्ट",
  "विशेष कार्यक्रम लेखा",
  "दान एवं सहयोग सूची",
  "विकास कार्य व्यय",
  "बैंक पासबुक व विवरण",
  "अन्य प्रतिवेदन",
];

const EVENT_CATEGORIES = [
  "दुर्गा पूजा",
  "रामनवमी महोत्सव",
  "छठ पूजा",
  "सांस्कृतिक संध्या",
  "कृष्ण जन्माष्टमी",
  "नाटक व झांकी",
  "होली मिलन",
  "अन्य",
];

export default function ManageLekhaJokha() {
  const { isAdmin } = useAuth();
  const [activeAdminTab, setActiveAdminTab] = useState<"annual-pdf" | "events" | "banner">("annual-pdf");

  // Data states
  const [records, setRecords] = useState<LekhaJokhaRecord[]>([]);
  const [events, setEvents] = useState<LekhaJokhaEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected year filter for admin list
  const [adminYearFilter, setAdminYearFilter] = useState<string>("All");

  // ==================== ANNUAL PDF FORM STATE ====================
  const [isPdfDialogOpen, setIsPdfDialogOpen] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [pdfYear, setPdfYear] = useState("2026");
  const [customYear, setCustomYear] = useState("");
  const [pdfTitle, setPdfTitle] = useState("");
  const [pdfCategory, setPdfCategory] = useState("वार्षिक आय-व्यय");
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfFileName, setPdfFileName] = useState("");
  const [pdfFileSize, setPdfFileSize] = useState("");
  const [pdfDescription, setPdfDescription] = useState("");
  const [pdfIncome, setPdfIncome] = useState<string>("");
  const [pdfExpense, setPdfExpense] = useState<string>("");
  const [pdfVerified, setPdfVerified] = useState(true);
  const [pdfActive, setPdfActive] = useState(true);
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);
  const [savingPdf, setSavingPdf] = useState(false);

  // ==================== EVENT FORM STATE ====================
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventYear, setEventYear] = useState("2026");
  const [eventName, setEventName] = useState("");
  const [eventCategory, setEventCategory] = useState("सांस्कृतिक संध्या");
  const [eventDate, setEventDate] = useState("");
  const [eventIncome, setEventIncome] = useState<string>("");
  const [eventExpense, setEventExpense] = useState<string>("");
  const [eventOrganizer, setEventOrganizer] = useState("नोहर विकास युवक संघ");
  const [eventHighlights, setEventHighlights] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventImageUrl, setEventImageUrl] = useState("");
  const [eventPdfUrl, setEventPdfUrl] = useState("");
  const [eventActive, setEventActive] = useState(true);
  const [selectedEventImage, setSelectedEventImage] = useState<File | null>(null);
  const [selectedEventPdf, setSelectedEventPdf] = useState<File | null>(null);
  const [savingEvent, setSavingEvent] = useState(false);

  // ==================== BANNER FORM STATE ====================
  const [bannerTitle, setBannerTitle] = useState("लेखा-जोखा एवं वार्षिक प्रतिवेदन");
  const [bannerSubtitle, setBannerSubtitle] = useState("नोहर विकास युवक संघ का पारदर्शी, प्रमाणित एवं डिजिटल आय-व्यय ब्योरा।");
  const [bannerBgImage, setBannerBgImage] = useState("");
  const [bannerActive, setBannerActive] = useState(true);
  const [selectedBannerFile, setSelectedBannerFile] = useState<File | null>(null);
  const [savingBanner, setSavingBanner] = useState(false);

  useEffect(() => {
    loadAllData();
    loadBanner();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [recordsData, eventsData] = await Promise.all([
        fetchLekhaJokhaRecords(),
        fetchLekhaJokhaEvents(),
      ]);
      setRecords(recordsData);
      setEvents(eventsData);
    } catch (err) {
      console.error(err);
      toast.error("डेटा लोड करने में त्रुटि हुई");
    } finally {
      setLoading(false);
    }
  };

  const loadBanner = async () => {
    try {
      const { data } = await supabase
        .from("page_banners")
        .select("*")
        .eq("page_key", "lekha-jokha")
        .maybeSingle();

      if (data) {
        setBannerTitle(data.title || "लेखा-जोखा एवं वार्षिक प्रतिवेदन");
        setBannerSubtitle(data.subtitle || "");
        setBannerBgImage(data.bg_image || "");
        setBannerActive(data.is_active ?? true);
      }
    } catch (err) {
      console.error("Banner load error:", err);
    }
  };

  // ==================== PDF DIALOG HANDLERS ====================
  const handleOpenAddPdf = () => {
    setEditingRecordId(null);
    setPdfYear("2026");
    setCustomYear("");
    setPdfTitle("");
    setPdfCategory("वार्षिक आय-व्यय");
    setPdfUrl("");
    setPdfFileName("");
    setPdfFileSize("");
    setPdfDescription("");
    setPdfIncome("");
    setPdfExpense("");
    setPdfVerified(true);
    setPdfActive(true);
    setSelectedPdfFile(null);
    setIsPdfDialogOpen(true);
  };

  const handleOpenEditPdf = (record: LekhaJokhaRecord) => {
    setEditingRecordId(record.id);
    setPdfYear(record.year);
    setCustomYear("");
    setPdfTitle(record.title);
    setPdfCategory(record.category);
    setPdfUrl(record.pdf_url);
    setPdfFileName(record.file_name || "");
    setPdfFileSize(record.file_size || "");
    setPdfDescription(record.description || "");
    setPdfIncome(record.total_income ? String(record.total_income) : "");
    setPdfExpense(record.total_expense ? String(record.total_expense) : "");
    setPdfVerified(record.is_verified ?? true);
    setPdfActive(record.is_active ?? true);
    setSelectedPdfFile(null);
    setIsPdfDialogOpen(true);
  };

  const handleSavePdf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error("केवल एडमिन ही डेटा सुरक्षित कर सकते हैं");
      return;
    }

    if (!pdfTitle.trim()) {
      toast.error("शीर्षक अनिवार्य है");
      return;
    }

    setSavingPdf(true);
    let finalUrl = pdfUrl;
    let finalFileName = pdfFileName;
    let finalFileSize = pdfFileSize;

    try {
      if (selectedPdfFile) {
        toast.info("PDF फाइल अपलोड हो रही है, कृपया प्रतीक्षा करें...");
        const sizeMb = (selectedPdfFile.size / (1024 * 1024)).toFixed(1) + " MB";
        finalFileSize = sizeMb;
        finalFileName = selectedPdfFile.name;

        const uploaded = await uploadPdfFile(selectedPdfFile, "lekha-jokha");
        if (uploaded) {
          finalUrl = uploaded;
        } else {
          toast.error("PDF स्टोरेज में अपलोड नहीं हो सकी।");
          setSavingPdf(false);
          return;
        }
      }

      if (!finalUrl.trim()) {
        toast.error("कृपया PDF फाइल अपलोड करें या PDF URL दर्ज करें।");
        setSavingPdf(false);
        return;
      }

      const finalYear = customYear.trim() || pdfYear;
      const incomeNum = pdfIncome ? Number(pdfIncome) : null;
      const expenseNum = pdfExpense ? Number(pdfExpense) : null;
      const balanceNum = incomeNum !== null && expenseNum !== null ? incomeNum - expenseNum : null;

      const payload: Partial<LekhaJokhaRecord> = {
        id: editingRecordId || undefined,
        year: finalYear,
        title: pdfTitle.trim(),
        category: pdfCategory,
        pdf_url: finalUrl.trim(),
        file_name: finalFileName || `${pdfTitle.trim()}.pdf`,
        file_size: finalFileSize || "PDF Document",
        description: pdfDescription.trim() || null,
        total_income: incomeNum,
        total_expense: expenseNum,
        closing_balance: balanceNum,
        is_verified: pdfVerified,
        is_active: pdfActive,
      };

      const res = await saveLekhaJokhaRecord(payload);
      if (res.success) {
        toast.success(editingRecordId ? "लेखा PDF अपडेट हो गया!" : "नया लेखा PDF जोड़ा गया!");
        setIsPdfDialogOpen(false);
        loadAllData();
      } else {
        toast.error(res.error || "सुरक्षित करने में त्रुटि हुई");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "त्रुटि उत्पन्न हुई");
    } finally {
      setSavingPdf(false);
    }
  };

  const handleDeletePdf = async (id: string) => {
    if (!confirm("क्या आप वाकई इस लेखा PDF को हटाना चाहते हैं?")) return;
    try {
      await deleteLekhaJokhaRecord(id);
      toast.success("दस्तावेज हटा दिया गया");
      loadAllData();
    } catch (err: any) {
      toast.error(err.message || "हटाने में विफल");
    }
  };

  // ==================== EVENT DIALOG HANDLERS ====================
  const handleOpenAddEvent = () => {
    setEditingEventId(null);
    setEventYear("2026");
    setEventName("");
    setEventCategory("सांस्कृतिक संध्या");
    setEventDate("");
    setEventIncome("");
    setEventExpense("");
    setEventOrganizer("नोहर विकास युवक संघ");
    setEventHighlights("");
    setEventDescription("");
    setEventImageUrl("");
    setEventPdfUrl("");
    setEventActive(true);
    setSelectedEventImage(null);
    setSelectedEventPdf(null);
    setIsEventDialogOpen(true);
  };

  const handleOpenEditEvent = (event: LekhaJokhaEvent) => {
    setEditingEventId(event.id);
    setEventYear(event.year);
    setEventName(event.event_name);
    setEventCategory(event.category);
    setEventDate(event.event_date || "");
    setEventIncome(String(event.total_income || ""));
    setEventExpense(String(event.total_expense || ""));
    setEventOrganizer(event.organizer || "नोहर विकास युवक संघ");
    setEventHighlights(event.highlights || "");
    setEventDescription(event.description || "");
    setEventImageUrl(event.image_url || "");
    setEventPdfUrl(event.pdf_url || "");
    setEventActive(event.is_active ?? true);
    setSelectedEventImage(null);
    setSelectedEventPdf(null);
    setIsEventDialogOpen(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error("केवल एडमिन ही डेटा सुरक्षित कर सकते हैं");
      return;
    }

    if (!eventName.trim()) {
      toast.error("कार्यक्रम का नाम आवश्यक है");
      return;
    }

    setSavingEvent(true);
    let finalImageUrl = eventImageUrl;
    let finalPdfUrl = eventPdfUrl;

    try {
      if (selectedEventImage) {
        toast.info("कार्यक्रम फोटो अपलोड हो रही है...");
        const uploadedImg = await uploadFile(selectedEventImage, "cultural-events");
        if (uploadedImg) finalImageUrl = uploadedImg;
      }

      if (selectedEventPdf) {
        toast.info("कार्यक्रम PDF बिल अपलोड हो रहा है...");
        const uploadedPdf = await uploadPdfFile(selectedEventPdf, "cultural-events");
        if (uploadedPdf) finalPdfUrl = uploadedPdf;
      }

      const incomeNum = Number(eventIncome) || 0;
      const expenseNum = Number(eventExpense) || 0;
      const balanceNum = incomeNum - expenseNum;

      const payload: Partial<LekhaJokhaEvent> = {
        id: editingEventId || undefined,
        year: eventYear,
        event_name: eventName.trim(),
        category: eventCategory,
        event_date: eventDate.trim() || null,
        total_income: incomeNum,
        total_expense: expenseNum,
        balance: balanceNum,
        organizer: eventOrganizer.trim() || "नोहर विकास युवक संघ",
        highlights: eventHighlights.trim() || null,
        description: eventDescription.trim() || null,
        image_url: finalImageUrl.trim() || null,
        pdf_url: finalPdfUrl.trim() || null,
        is_active: eventActive,
      };

      const res = await saveLekhaJokhaEvent(payload);
      if (res.success) {
        toast.success(editingEventId ? "कार्यक्रम अपडेट हो गया!" : "नया सांस्कृतिक कार्यक्रम जोड़ा गया!");
        setIsEventDialogOpen(false);
        loadAllData();
      } else {
        toast.error(res.error || "सुरक्षित करने में विफल");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "त्रुटि हुई");
    } finally {
      setSavingEvent(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("क्या आप वाकई इस सांस्कृतिक कार्यक्रम रिकॉर्ड को हटाना चाहते हैं?")) return;
    try {
      await deleteLekhaJokhaEvent(id);
      toast.success("कार्यक्रम हटा दिया गया");
      loadAllData();
    } catch (err: any) {
      toast.error(err.message || "हटाने में विफल");
    }
  };

  // ==================== BANNER SAVE HANDLER ====================
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error("केवल एडमिन ही बैनर बदल सकते हैं");
      return;
    }

    setSavingBanner(true);
    let finalBg = bannerBgImage;

    try {
      if (selectedBannerFile) {
        toast.info("बैनर इमेज अपलोड हो रही है...");
        const uploaded = await uploadFile(selectedBannerFile, "banners");
        if (uploaded) finalBg = uploaded;
      }

      const payload = {
        page_key: "lekha-jokha",
        title: bannerTitle.trim() || "लेखा-जोखा एवं वार्षिक प्रतिवेदन",
        subtitle: bannerSubtitle.trim() || null,
        bg_image: finalBg.trim() || null,
        is_active: bannerActive,
        updated_at: new Date().toISOString(),
      };

      // Check if existing banner row exists
      const { data: existing } = await supabase
        .from("page_banners")
        .select("id")
        .eq("page_key", "lekha-jokha")
        .maybeSingle();

      if (existing?.id) {
        const { error } = await supabase
          .from("page_banners")
          .update(payload)
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("page_banners").insert(payload);
        if (error) throw error;
      }

      toast.success("लेखा-जोखा बैनर सफलतापूर्वक अपडेट हो गया!");
      setSelectedBannerFile(null);
      loadBanner();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "बैनर सेव करने में त्रुटि");
    } finally {
      setSavingBanner(false);
    }
  };

  // Filtered records by year for admin view
  const filteredRecords = records.filter(
    (r) => adminYearFilter === "All" || r.year === adminYearFilter
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <SEO
        title="लेखा-जोखा प्रबंधन (Manage Lekha-Jokha) — Admin"
        description="वार्षिक वित्तीय PDF दस्तावेज, सांस्कृतिक कार्यक्रम एवं बैनर प्रबंधन।"
      />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-foreground flex items-center gap-3">
            <FileSpreadsheet className="w-8 h-8 text-primary" />
            प्रबंधन: लेखा-जोखा एवं वार्षिक प्रतिवेदन
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            2026, 2025 व अन्य वर्षों के वार्षिक PDF दस्तावेज, सांस्कृतिक कार्यक्रम हिसाब एवं बैनर प्रबंधित करें।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/lekha-jokha"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-sm font-semibold transition-colors"
          >
            <Eye className="w-4 h-4 text-primary" />
            लाइव पेज देखें
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={loadAllData}
            className="rounded-xl h-9 text-xs gap-1.5"
            disabled={loading}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            रिफ्रेश
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeAdminTab}
        onValueChange={(val) => setActiveAdminTab(val as any)}
        className="w-full space-y-6"
      >
        <TabsList className="grid grid-cols-3 max-w-2xl bg-secondary/80 p-1.5 rounded-2xl">
          <TabsTrigger
            value="annual-pdf"
            className="rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-primary" />
            <span>वार्षिक PDF ({records.length})</span>
          </TabsTrigger>
          <TabsTrigger
            value="events"
            className="rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-accent" />
            <span>सांस्कृतिक कार्यक्रम ({events.length})</span>
          </TabsTrigger>
          <TabsTrigger
            value="banner"
            className="rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2"
          >
            <PanelsTopLeft className="w-4 h-4 text-blue-500" />
            <span>पेज बैनर</span>
          </TabsTrigger>
        </TabsList>

        {/* ======================= TAB 1: ANNUAL PDFS ======================= */}
        <TabsContent value="annual-pdf" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-5 rounded-2xl border border-border shadow-card">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-primary shrink-0" />
              <div>
                <h3 className="font-bold text-base text-foreground">वर्ष वार फिल्टर (Year Filter)</h3>
                <p className="text-xs text-muted-foreground">विशिष्ट वर्ष के सभी PDF रिकॉर्ड देखें</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-xl">
                <span className="text-xs font-semibold text-muted-foreground">वर्ष:</span>
                <select
                  value={adminYearFilter}
                  onChange={(e) => setAdminYearFilter(e.target.value)}
                  className="bg-transparent text-xs font-bold text-foreground focus:outline-none cursor-pointer"
                >
                  <option value="All">सभी वर्ष (All)</option>
                  <option value="2026">वर्ष 2026</option>
                  <option value="2025">वर्ष 2025</option>
                  <option value="2024">वर्ष 2024</option>
                </select>
              </div>

              <Button
                type="button"
                onClick={handleOpenAddPdf}
                className="rounded-xl text-xs font-bold h-10 gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" /> नया PDF जोड़ें
              </Button>
            </div>
          </div>

          {/* Records Table / Cards */}
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : filteredRecords.length === 0 ? (
            <Card className="rounded-2xl p-10 text-center border-dashed">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-base font-semibold text-foreground">कोई PDF रिकॉर्ड उपलब्ध नहीं है</p>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                "नया PDF जोड़ें" बटन पर क्लिक करके 2026 या 2025 का लेखा दस्तावेज अपलोड करें।
              </p>
              <Button onClick={handleOpenAddPdf} size="sm" className="rounded-xl gap-2">
                <Plus className="w-4 h-4" /> पहला PDF अपलोड करें
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRecords.map((item) => (
                <Card
                  key={item.id}
                  className="rounded-2xl border border-border hover:border-primary/40 transition-all p-5 bg-card flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary/10 text-primary text-xs font-bold">
                          वर्ष {item.year}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {item.is_active ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Live
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                            Hidden
                          </span>
                        )}
                      </div>
                    </div>

                    <h4 className="font-bold text-base text-foreground leading-snug">
                      {item.title}
                    </h4>

                    {item.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}

                    {(item.total_income || item.total_expense) && (
                      <div className="flex items-center gap-2 text-[11px] pt-1">
                        {item.total_income && (
                          <span className="text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md font-semibold">
                            आय: ₹{Number(item.total_income).toLocaleString("en-IN")}
                          </span>
                        )}
                        {item.total_expense && (
                          <span className="text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded-md font-semibold">
                            व्यय: ₹{Number(item.total_expense).toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                    <a
                      href={item.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 truncate max-w-[200px]"
                    >
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{item.file_name || "Open PDF"}</span>
                    </a>

                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEditPdf(item)}
                        className="h-8 px-2.5 rounded-lg text-xs gap-1"
                      >
                        <Pencil className="w-3.5 h-3.5 text-primary" /> एडिट
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeletePdf(item.id)}
                        className="h-8 px-2.5 rounded-lg text-xs gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> हटाएं
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ======================= TAB 2: CULTURAL EVENTS ======================= */}
        <TabsContent value="events" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-5 rounded-2xl border border-border shadow-card">
            <div>
              <h3 className="font-bold text-base text-foreground">सांस्कृतिक कार्यक्रम हिसाब-किताब</h3>
              <p className="text-xs text-muted-foreground">
                दुर्गा पूजा, रामनवमी, कृष्ण जन्माष्टमी आदि कार्यक्रमों का आय-व्यय व बिल अपलोड करें
              </p>
            </div>
            <Button
              type="button"
              onClick={handleOpenAddEvent}
              className="rounded-xl text-xs font-bold h-10 gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" /> नया कार्यक्रम जोड़ें
            </Button>
          </div>

          {/* Event Cards */}
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : events.length === 0 ? (
            <Card className="rounded-2xl p-10 text-center border-dashed">
              <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-base font-semibold text-foreground">कोई सांस्कृतिक कार्यक्रम दर्ज नहीं है</p>
              <Button onClick={handleOpenAddEvent} size="sm" className="rounded-xl gap-2 mt-4">
                <Plus className="w-4 h-4" /> पहला कार्यक्रम जोड़ें
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map((ev) => (
                <Card
                  key={ev.id}
                  className="rounded-2xl border border-border hover:border-accent/40 transition-all p-5 bg-card flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary/10 text-primary text-xs font-bold">
                          वर्ष {ev.year}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {ev.category}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">
                        {ev.event_date || ""}
                      </span>
                    </div>

                    <h4 className="font-bold text-base text-foreground leading-snug">
                      {ev.event_name}
                    </h4>

                    {/* Financial summary mini widget */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                      <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                        <span className="block text-[10px]">कुल आय</span>
                        <span className="font-bold">₹{Number(ev.total_income).toLocaleString("en-IN")}</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600">
                        <span className="block text-[10px]">कुल व्यय</span>
                        <span className="font-bold">₹{Number(ev.total_expense).toLocaleString("en-IN")}</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                        <span className="block text-[10px]">बचत</span>
                        <span className="font-bold">₹{Number(ev.balance).toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                    {ev.pdf_url ? (
                      <a
                        href={ev.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" /> Attached PDF
                      </a>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">No PDF attached</span>
                    )}

                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEditEvent(ev)}
                        className="h-8 px-2.5 rounded-lg text-xs gap-1"
                      >
                        <Pencil className="w-3.5 h-3.5 text-accent" /> एडिट
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteEvent(ev.id)}
                        className="h-8 px-2.5 rounded-lg text-xs gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> हटाएं
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ======================= TAB 3: BANNER MANAGEMENT ======================= */}
        <TabsContent value="banner" className="space-y-6">
          <Card className="rounded-2xl border border-border p-6 shadow-card bg-card">
            <CardHeader className="p-0 pb-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <PanelsTopLeft className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">लेखा-जोखा पेज का हीरो बैनर</CardTitle>
                  <CardDescription className="text-xs">
                    सार्वजनिक पेज पर सबसे ऊपर दिखने वाले मुख्य बैनर का शीर्षक, उपशीर्षक एवं बैकग्राउंड फोटो बदलें।
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <form onSubmit={handleSaveBanner} className="space-y-6 pt-6">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  बैनर का मुख्य शीर्षक (Title)
                </label>
                <Input
                  value={bannerTitle}
                  onChange={(e) => setBannerTitle(e.target.value)}
                  placeholder="लेखा-जोखा एवं वार्षिक प्रतिवेदन"
                  required
                  className="rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  उपशीर्षक (Subtitle)
                </label>
                <Textarea
                  value={bannerSubtitle}
                  onChange={(e) => setBannerSubtitle(e.target.value)}
                  rows={2}
                  placeholder="नोहर विकास युवक संघ का पारदर्शी, प्रमाणित एवं डिजिटल आय-व्यय विवरण।"
                  className="rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  बैकग्राउंड इमेज (Banner Background Image)
                </label>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedBannerFile(e.target.files?.[0] || null)}
                    className="block w-full text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">या इमेज URL:</span>
                    <Input
                      type="url"
                      value={bannerBgImage}
                      onChange={(e) => setBannerBgImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="rounded-xl text-xs flex-1"
                    />
                  </div>
                </div>

                {bannerBgImage && (
                  <div className="mt-3 rounded-xl overflow-hidden h-32 w-full max-w-md border border-border relative">
                    <img src={bannerBgImage} alt="Banner Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="banner-active"
                  checked={bannerActive}
                  onChange={(e) => setBannerActive(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
                <label htmlFor="banner-active" className="text-sm font-medium text-foreground cursor-pointer">
                  बैनर को लाइव पेज पर सक्रिय (Active) रखें
                </label>
              </div>

              <Button
                type="submit"
                disabled={savingBanner}
                className="rounded-xl px-6 font-bold gap-2 shadow-md"
              >
                <Save className="w-4 h-4" />
                {savingBanner ? "सेव हो रहा है..." : "बैनर सेटिंग्स सुरक्षित करें"}
              </Button>
            </form>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ======================= ADD/EDIT ANNUAL PDF MODAL ======================= */}
      <Dialog open={isPdfDialogOpen} onOpenChange={setIsPdfDialogOpen}>
        <DialogContent className="max-w-xl w-[95vw] max-h-[90vh] overflow-y-auto rounded-2xl bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              {editingRecordId ? "लेखा PDF प्रतिवेदन संपादित करें" : "नया वार्षिक लेखा PDF अपलोड करें"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              वर्ष चुनें (जैसे 2026, 2025) और मूल PDF फाइल अपलोड करें।
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSavePdf} className="space-y-4 pt-3">
            {/* Year Selection */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  वित्तीय वर्ष (Year) *
                </label>
                <select
                  value={pdfYear}
                  onChange={(e) => setPdfYear(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="2026">वर्ष 2026 (चालू वर्ष)</option>
                  <option value="2025">वर्ष 2025</option>
                  <option value="2024">वर्ष 2024</option>
                  <option value="custom">अन्य वर्ष (Custom)</option>
                </select>
              </div>

              {pdfYear === "custom" && (
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    वर्ष दर्ज करें (e.g. 2023) *
                  </label>
                  <Input
                    type="text"
                    value={customYear}
                    onChange={(e) => setCustomYear(e.target.value)}
                    placeholder="2023"
                    required
                    className="rounded-xl text-sm"
                  />
                </div>
              )}

              <div className={pdfYear === "custom" ? "col-span-2" : ""}>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  दस्तावेज श्रेणी (Category) *
                </label>
                <select
                  value={pdfCategory}
                  onChange={(e) => setPdfCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {PDF_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Document Title */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                दस्तावेज / प्रतिवेदन का शीर्षक *
              </label>
              <Input
                type="text"
                value={pdfTitle}
                onChange={(e) => setPdfTitle(e.target.value)}
                placeholder="वार्षिक आय-व्यय व वित्तीय लेखा-जोखा विवरण 2026"
                required
                className="rounded-xl"
              />
            </div>

            {/* PDF Upload */}
            <div className="p-4 rounded-2xl bg-secondary/50 border border-border space-y-3">
              <label className="block text-xs font-bold text-foreground flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-primary" />
                PDF फाइल अपलोड करें (.pdf) *
              </label>

              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setSelectedPdfFile(file);
                  if (file) {
                    setPdfFileName(file.name);
                    setPdfFileSize((file.size / (1024 * 1024)).toFixed(1) + " MB");
                  }
                }}
                className="block w-full text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
              />

              {pdfUrl && !selectedPdfFile && (
                <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 p-2 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="truncate">वर्तमान PDF: {pdfFileName || pdfUrl}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">
                  अथवा सीधे PDF URL पेस्ट करें:
                </label>
                <Input
                  type="url"
                  value={pdfUrl}
                  onChange={(e) => setPdfUrl(e.target.value)}
                  placeholder="https://.../document.pdf"
                  className="rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Optional Financial Figures */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  कुल आय / प्राप्तियां (₹) (ऐच्छिक)
                </label>
                <Input
                  type="number"
                  value={pdfIncome}
                  onChange={(e) => setPdfIncome(e.target.value)}
                  placeholder="उदा. 345000"
                  className="rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  कुल व्यय / खर्च (₹) (ऐच्छिक)
                </label>
                <Input
                  type="number"
                  value={pdfExpense}
                  onChange={(e) => setPdfExpense(e.target.value)}
                  placeholder="उदा. 288400"
                  className="rounded-xl"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                संक्षिप्त विवरण / टिप्पणी
              </label>
              <Textarea
                value={pdfDescription}
                onChange={(e) => setPdfDescription(e.target.value)}
                placeholder="इस रिपोर्ट में वर्ष 2026 के समस्त सामाजिक विकास कार्यों व आय-व्यय का विवरण है।"
                rows={2}
                className="rounded-xl text-xs"
              />
            </div>

            {/* Toggles */}
            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={pdfVerified}
                  onChange={(e) => setPdfVerified(e.target.checked)}
                  className="rounded border-border text-primary h-4 w-4"
                />
                ऑडिटेड एवं सत्यापित (Verified)
              </label>

              <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={pdfActive}
                  onChange={(e) => setPdfActive(e.target.checked)}
                  className="rounded border-border text-primary h-4 w-4"
                />
                सक्रिय (Active on Site)
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPdfDialogOpen(false)}
                className="rounded-xl text-xs"
              >
                रद्द करें
              </Button>
              <Button
                type="submit"
                disabled={savingPdf}
                className="rounded-xl text-xs font-bold gap-1.5"
              >
                <Save className="w-4 h-4" />
                {savingPdf ? "सेव हो रहा है..." : "सुरक्षित करें"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ======================= ADD/EDIT EVENT MODAL ======================= */}
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent className="max-w-xl w-[95vw] max-h-[90vh] overflow-y-auto rounded-2xl bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              {editingEventId ? "सांस्कृतिक कार्यक्रम संपादित करें" : "नया सांस्कृतिक कार्यक्रम जोड़ें"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              पूजा, महोत्सव, सांस्कृतिक संध्या का आय-व्यय, फोटो एवं PDF रसीद दर्ज करें।
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEvent} className="space-y-4 pt-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  वर्ष (Year) *
                </label>
                <select
                  value={eventYear}
                  onChange={(e) => setEventYear(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  श्रेणी (Category) *
                </label>
                <select
                  value={eventCategory}
                  onChange={(e) => setEventCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {EVENT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                कार्यक्रम का नाम (Event Name) *
              </label>
              <Input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="उदा. श्री रामनवमी महोत्सव, भव्य शोभायात्रा एवं भजन संध्या 2026"
                required
                className="rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  आयोजन तिथि (Event Date)
                </label>
                <Input
                  type="text"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  placeholder="उदा. 27 मार्च 2026"
                  className="rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  आयोजक / समिति
                </label>
                <Input
                  type="text"
                  value={eventOrganizer}
                  onChange={(e) => setEventOrganizer(e.target.value)}
                  placeholder="नोहर विकास युवक संघ"
                  className="rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Income & Expense */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-secondary/40 rounded-xl border border-border">
              <div>
                <label className="block text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                  कुल आय / चंदा (₹) *
                </label>
                <Input
                  type="number"
                  value={eventIncome}
                  onChange={(e) => setEventIncome(e.target.value)}
                  placeholder="185000"
                  required
                  className="rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-rose-600 dark:text-rose-400 mb-1">
                  कुल व्यय / खर्च (₹) *
                </label>
                <Input
                  type="number"
                  value={eventExpense}
                  onChange={(e) => setEventExpense(e.target.value)}
                  placeholder="172350"
                  required
                  className="rounded-xl"
                />
              </div>
            </div>

            {/* Highlights */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                मुख्य विशेषताएं (Highlights)
              </label>
              <Input
                type="text"
                value={eventHighlights}
                onChange={(e) => setEventHighlights(e.target.value)}
                placeholder="भव्य झांकी, 21 कलाकार, महाप्रसाद वितरण"
                className="rounded-xl text-xs"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                विस्तृत विवरण
              </label>
              <Textarea
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                placeholder="कार्यक्रम का विवरण लिखें..."
                rows={2}
                className="rounded-xl text-xs"
              />
            </div>

            {/* Image & PDF Upload */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-card rounded-xl border border-border space-y-2">
                <label className="block text-xs font-semibold text-foreground flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-primary" />
                  कार्यक्रम फोटो
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedEventImage(e.target.files?.[0] || null)}
                  className="text-xs text-muted-foreground file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:bg-secondary cursor-pointer"
                />
                {eventImageUrl && !selectedEventImage && (
                  <p className="text-[10px] text-muted-foreground truncate font-mono">{eventImageUrl}</p>
                )}
              </div>

              <div className="p-3 bg-card rounded-xl border border-border space-y-2">
                <label className="block text-xs font-semibold text-foreground flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-accent" />
                  PDF बिल / वाउचर
                </label>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(e) => setSelectedEventPdf(e.target.files?.[0] || null)}
                  className="text-xs text-muted-foreground file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:bg-secondary cursor-pointer"
                />
                {eventPdfUrl && !selectedEventPdf && (
                  <p className="text-[10px] text-muted-foreground truncate font-mono">{eventPdfUrl}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEventDialogOpen(false)}
                className="rounded-xl text-xs"
              >
                रद्द करें
              </Button>
              <Button
                type="submit"
                disabled={savingEvent}
                className="rounded-xl text-xs font-bold gap-1.5"
              >
                <Save className="w-4 h-4" />
                {savingEvent ? "सेव हो रहा है..." : "कार्यक्रम सुरक्षित करें"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
