import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import {
  Trash2,
  Plus,
  QrCode,
  Shield,
  ShieldAlert,
  Upload,
  Check,
  Loader2,
  Copy,
  ExternalLink,
  Eye,
  CreditCard,
  HeartHandshake
} from "lucide-react";
import { uploadFile } from "@/lib/supabase-helpers";

interface Donation {
  id: string;
  name: string | null;
  amount: number | null;
  message: string | null;
  created_at: string;
}

const DEFAULT_UPI_ID = "8770824752@ybl";
const DEFAULT_BANK_NAME = "State Bank of India - 4588";
const DEFAULT_QR_URL = "/upi-qr-code.png";

export default function ManageDonations() {
  const { isAdmin, isEditor } = useAuth();
  const canManage = isAdmin || isEditor;

  // Donations List State
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [donorForm, setDonorForm] = useState({ name: "", amount: "", message: "" });
  const [savingDonor, setSavingDonor] = useState(false);

  // UPI & QR Code Settings State (Admin Only)
  const [upiSettings, setUpiSettings] = useState({
    upiId: DEFAULT_UPI_ID,
    bankName: DEFAULT_BANK_NAME,
    qrImageUrl: DEFAULT_QR_URL,
    isActive: true,
  });
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string>(DEFAULT_QR_URL);
  const [savingUpi, setSavingUpi] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    // 1. Load donations list
    const { data: dData } = await supabase
      .from("donations")
      .select("*")
      .order("created_at", { ascending: false });
    setDonations((dData as Donation[]) ?? []);

    // 2. Load UPI Settings from page_banners
    const { data: upiBanner } = await supabase
      .from("page_banners")
      .select("*")
      .eq("page_key", "donation_upi")
      .maybeSingle();

    if (upiBanner) {
      const upiId = upiBanner.title?.trim() || DEFAULT_UPI_ID;
      const bankName = upiBanner.subtitle?.trim() || DEFAULT_BANK_NAME;
      const qrImageUrl = upiBanner.bg_image?.trim() || DEFAULT_QR_URL;
      const isActive = upiBanner.is_active ?? true;

      setUpiSettings({ upiId, bankName, qrImageUrl, isActive });
      setQrPreview(qrImageUrl);
    }

    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // Handle QR File Selection (Admin Only)
  const handleQrFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) {
      toast({
        title: "अनुमति नहीं है (Permission Denied)",
        description: "केवल Admin ही QR कोड बदल सकते हैं।",
        variant: "destructive",
      });
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "अमान्य फ़ाइल",
        description: "कृपया केवल इमेज फ़ाइल (JPG, PNG, WebP) अपलोड करें।",
        variant: "destructive",
      });
      return;
    }

    setQrFile(file);
    const previewUrl = URL.createObjectURL(file);
    setQrPreview(previewUrl);
  };

  // Handle Saving UPI Settings (Admin Only)
  const handleSaveUpi = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAdmin) {
      toast({
        title: "अनुमति नहीं है (Admin Only)",
        description: "सुरक्षा नियम: केवल Admin ही UPI ID और QR कोड बदल सकते हैं। Editor (संपादक) को इसकी अनुमति नहीं है।",
        variant: "destructive",
      });
      return;
    }

    if (!upiSettings.upiId.trim()) {
      toast({
        title: "UPI ID आवश्यक है",
        description: "कृपया मान्य UPI ID या फ़ोन नंबर दर्ज करें।",
        variant: "destructive",
      });
      return;
    }

    setSavingUpi(true);

    try {
      let finalQrUrl = upiSettings.qrImageUrl;

      // Upload new file if selected
      if (qrFile) {
        const uploaded = await uploadFile(qrFile, "donations");
        if (uploaded) {
          finalQrUrl = uploaded;
        } else {
          toast({
            title: "Upload Failed",
            description: "QR कोड फोटो अपलोड नहीं हो सकी। कृपया दोबारा प्रयास करें।",
            variant: "destructive",
          });
          setSavingUpi(false);
          return;
        }
      }

      // Check if page_banner row exists
      const { data: existing } = await supabase
        .from("page_banners")
        .select("id")
        .eq("page_key", "donation_upi")
        .maybeSingle();

      const payload = {
        page_key: "donation_upi",
        title: upiSettings.upiId.trim(),
        subtitle: upiSettings.bankName.trim() || null,
        bg_image: finalQrUrl,
        is_active: upiSettings.isActive,
      };

      if (existing) {
        const { error } = await supabase
          .from("page_banners")
          .update(payload)
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("page_banners")
          .insert(payload);
        if (error) throw error;
      }

      toast({
        title: "सफलतापूर्वक सहेजा गया! 🎉",
        description: "UPI ID एवं QR कोड सेटिंग्स अपडेट हो गई हैं। वेबसाइट पर नया विवरण दिखने लगा है।",
      });

      setQrFile(null);
      setUpiSettings((prev) => ({ ...prev, qrImageUrl: finalQrUrl }));
      setQrPreview(finalQrUrl);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "UPI सेटिंग्स सेव करने में त्रुटि हुई",
        variant: "destructive",
      });
    } finally {
      setSavingUpi(false);
    }
  };

  // Donor Record Handlers
  const handleSaveDonor = async () => {
    setSavingDonor(true);
    const { error } = await supabase.from("donations").insert({
      name: donorForm.name || null,
      amount: donorForm.amount ? parseFloat(donorForm.amount) : 0,
      message: donorForm.message || null,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Donation recorded!" });
    }
    setSavingDonor(false);
    setDonorForm({ name: "", amount: "", message: "" });
    setShowDonationForm(false);
    load();
  };

  const handleDeleteDonor = async (id: string) => {
    if (!isAdmin) {
      toast({
        title: "अनुमति नहीं है",
        description: "केवल Admin ही डोनेशन रिकॉर्ड डिलीट कर सकते हैं।",
        variant: "destructive",
      });
      return;
    }
    if (!confirm("Delete this record?")) return;
    const { error } = await supabase.from("donations").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted" });
      load();
    }
  };

  const handleCopyUpiPreview = () => {
    navigator.clipboard.writeText(upiSettings.upiId);
    setCopiedUpi(true);
    toast({ title: "UPI ID Copied!" });
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin w-9 h-9 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ========================================================================= */}
      {/* 1. UPI & QR Code Configuration Card (Admin Managed)                       */}
      {/* ========================================================================= */}
      <section className="bg-card rounded-2xl p-6 sm:p-7 border border-border shadow-sm">
        {/* Header with Permissions Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
                UPI एवं QR कोड सेटिंग्स (Support Us)
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                वेबसाइट के 'सहयोग एवं दान' (/donation) पेज पर दिखने वाला UPI ID, बैंक विवरण व QR कोड।
              </p>
            </div>
          </div>

          <div className="shrink-0">
            {isAdmin ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <Shield className="w-3.5 h-3.5" /> केवल Admin प्रबंधित
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                <ShieldAlert className="w-3.5 h-3.5" /> केवल देखने की अनुमति (Read Only)
              </span>
            )}
          </div>
        </div>

        {/* Permission Warning for Editors */}
        {!isAdmin && (
          <div className="mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 text-xs sm:text-sm flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <strong>सुरक्षा प्रतिबंध:</strong> आप Editor के रूप में लॉगिन हैं। UPI ID, बैंक खाता व QR कोड केवल <strong>मुख्य Admin</strong> द्वारा ही बदले जा सकते हैं ताकि वित्तीय सुरक्षा बनी रहे।
            </div>
          </div>
        )}

        <form onSubmit={handleSaveUpi} className="mt-6 grid lg:grid-cols-12 gap-7 items-start">
          {/* Left Form: Inputs (8 Cols on desktop) */}
          <div className="lg:col-span-7 space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5">
                UPI ID या UPI नंबर <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={upiSettings.upiId}
                  onChange={(e) => setUpiSettings({ ...upiSettings, upiId: e.target.value })}
                  placeholder="उदा. 8770824752@ybl या 9876543210@paytm"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-input text-foreground text-sm font-mono focus:ring-2 focus:ring-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
                  required
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                दानकर्ता इस ID पर PhonePe, Google Pay, Paytm या किसी भी UPI ऐप से पैसे भेज सकेंगे।
              </p>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5">
                बैंक / खाता विवरण (Bank Name & Details)
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={upiSettings.bankName}
                onChange={(e) => setUpiSettings({ ...upiSettings, bankName: e.target.value })}
                placeholder="उदा. State Bank of India - 4588 या Nohar Vikash Manch"
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-input text-foreground text-sm focus:ring-2 focus:ring-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                यह नाम QR कोड के ऊपर छोटी पट्टी में दिखाई देगा।
              </p>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5">
                QR कोड फ़ोटो बदलें (Upload QR Image)
              </label>
              <input
                type="file"
                ref={fileInputRef}
                disabled={!isAdmin}
                accept="image/*"
                onChange={handleQrFileSelect}
                className="hidden"
              />
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={!isAdmin}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-secondary-foreground text-xs sm:text-sm font-semibold hover:bg-secondary/80 border border-border transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Upload className="w-4 h-4" />
                  {qrFile ? "फ़ोटो चुनी गई: " + qrFile.name.slice(0, 20) + "..." : "नया QR कोड चुनें (Browse)"}
                </button>
                {qrFile && (
                  <button
                    type="button"
                    onClick={() => {
                      setQrFile(null);
                      setQrPreview(upiSettings.qrImageUrl);
                    }}
                    className="text-xs text-destructive hover:underline"
                  >
                    हटाएं (Reset)
                  </button>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                PhonePe, Google Pay, या BHIM UPI से डाउनलोड किया गया साफ़ QR कोड अपलोड करें (JPG, PNG)।
              </p>
            </div>

            <div className="pt-2">
              <label className="inline-flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  disabled={!isAdmin}
                  checked={upiSettings.isActive}
                  onChange={(e) => setUpiSettings({ ...upiSettings, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-input text-primary focus:ring-primary disabled:opacity-60"
                />
                <span className="text-xs sm:text-sm font-medium text-foreground">
                  वेबसाइट पर ऑनलाइन UPI दान चालू रखें (Active)
                </span>
              </label>
            </div>

            {isAdmin && (
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={savingUpi}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-95 transition-opacity disabled:opacity-50 shadow-sm"
                >
                  {savingUpi ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      सहेजा जा रहा है...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      UPI सेटिंग्स सहेजें (Save Changes)
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Live Preview of Card (5 Cols on desktop) */}
          <div className="lg:col-span-5 bg-secondary/30 rounded-2xl p-5 border border-border flex flex-col items-center text-center">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" /> लाइव प्रिव्यू (वेबसाइट पर ऐसा दिखेगा)
            </span>

            {/* Simulated Donation QR Card */}
            <div className="w-full max-w-[280px] bg-card rounded-2xl p-5 shadow-sm ring-1 ring-border text-center flex flex-col items-center">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-medium mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="truncate max-w-[180px]">{upiSettings.bankName || "Bank Name"}</span>
              </div>

              <div className="bg-white p-3 rounded-xl shadow-sm ring-1 ring-border/80 mb-3 max-w-[200px]">
                <img
                  src={qrPreview}
                  alt="Donation UPI QR Code"
                  className="w-44 h-44 object-contain rounded-lg"
                  onError={(e) => {
                    // Fallback if image fails
                    (e.target as HTMLImageElement).src = "/upi-qr-code.png";
                  }}
                />
              </div>

              <div className="flex items-center gap-1.5 bg-secondary/80 px-3 py-1.5 rounded-lg text-xs font-mono text-foreground border border-border w-full justify-between mb-2">
                <span className="truncate">{upiSettings.upiId || "UPI ID"}</span>
                <button
                  type="button"
                  onClick={handleCopyUpiPreview}
                  className="p-1 hover:bg-background rounded text-primary shrink-0"
                  title="Copy"
                >
                  {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <span className="text-[11px] text-muted-foreground">
                {upiSettings.isActive ? "✅ दान सेवा सक्रिय (Active)" : "❌ दान सेवा बंद (Inactive)"}
              </span>
            </div>
          </div>
        </form>
      </section>

      {/* ========================================================================= */}
      {/* 2. Recorded Donations List Section                                        */}
      {/* ========================================================================= */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-primary" />
              प्राप्त दान रिकॉर्ड्स (Donation History)
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              गाँव के सहयोगियों और दानदाताओं द्वारा दिए गए दान की सूची।
            </p>
          </div>

          {canManage && (
            <button
              onClick={() => setShowDonationForm(true)}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 shadow-sm shrink-0"
            >
              <Plus className="w-4 h-4" /> Add Donation
            </button>
          )}
        </div>

        {showDonationForm && (
          <div className="bg-card rounded-xl p-6 ring-1 ring-border mb-6 space-y-4">
            <h3 className="font-semibold text-sm text-foreground">नया दान रिकॉर्ड जोड़ें</h3>
            <input
              value={donorForm.name}
              onChange={(e) => setDonorForm({ ...donorForm, name: e.target.value })}
              placeholder="दानदाता का नाम (Donor name)"
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-input text-foreground text-sm"
            />
            <input
              type="number"
              value={donorForm.amount}
              onChange={(e) => setDonorForm({ ...donorForm, amount: e.target.value })}
              placeholder="दान राशि ₹ (Amount)"
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-input text-foreground text-sm"
            />
            <textarea
              value={donorForm.message}
              onChange={(e) => setDonorForm({ ...donorForm, message: e.target.value })}
              placeholder="संदेश या टिप्पणी (Message / Note)"
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-input text-foreground text-sm"
            />
            <div className="flex gap-3">
              <button
                onClick={handleSaveDonor}
                disabled={savingDonor}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50"
              >
                {savingDonor ? "Saving..." : "Add Record"}
              </button>
              <button
                onClick={() => setShowDonationForm(false)}
                className="px-6 py-2 rounded-xl text-sm border border-input hover:bg-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {donations.map((d) => (
            <div
              key={d.id}
              className="bg-card rounded-xl p-4 ring-1 ring-border flex items-center justify-between hover:bg-secondary/20 transition-colors"
            >
              <div>
                <h3 className="font-semibold text-foreground">{d.name || "Anonymous Donor"}</h3>
                <p className="text-sm text-primary font-bold">₹{d.amount ?? 0}</p>
                {d.message && <p className="text-xs text-muted-foreground mt-1">{d.message}</p>}
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  दिनांक: {new Date(d.created_at).toLocaleDateString("hi-IN")}
                </p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => handleDeleteDonor(d.id)}
                  title="डिलीट करें"
                  className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {donations.length === 0 && (
          <p className="text-muted-foreground text-center py-8">अभी तक कोई दान रिकॉर्ड दर्ज नहीं है।</p>
        )}
      </section>
    </div>
  );
}
