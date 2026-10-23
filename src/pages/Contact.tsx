import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  User,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  HelpCircle,
  ShieldCheck,
  Loader2,
  MessageCircle,
  Building2,
  RefreshCw,
} from "lucide-react";
import PageBanner from "@/components/layout/PageBanner";
import SEO from "@/components/common/SEO";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  category: string;
  message: string;
}

const CATEGORIES = [
  "ग्राम विकास एवं बुनियादी ढांचा (Village Development)",
  "सड़क, नाली एवं स्वच्छता संबंधी समस्या (Road & Drainage)",
  "बिजली, स्ट्रीट लाइट एवं पेयजल (Electricity & Water)",
  "रामनवमी एवं सांस्कृतिक पर्व संबंधी (Festivals & Events)",
  "खेल क्लब एवं युवा कार्यक्रम (Sports Club)",
  "दान एवं वित्तीय सहयोग संबंधी (Donation & Support)",
  "अन्य समस्या या सुझाव (Other Problem / Feedback)",
];

const CONTACT_INFO = {
  email: "abhi96anand@gmail.com",
  phone: "+91 8770824752",
  phoneRaw: "8770824752",
  address: "ग्राम – नोहर, पोस्ट – ग्वालपाड़ा, जिला – मधेपुरा, बिहार, भारत (पिन: 852115)",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Nohar+Gwalpara+Madhepura+Bihar",
};

export default function Contact() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    category: CATEGORIES[0],
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const handleCopy = (text: string, type: "email" | "phone") => {
    navigator.clipboard.writeText(text);
    if (type === "email") {
      setCopiedEmail(true);
      toast.success("ईमेल कॉपी कर लिया गया!");
      setTimeout(() => setCopiedEmail(false), 2500);
    } else {
      setCopiedPhone(true);
      toast.success("फ़ोन नंबर कॉपी कर लिया गया!");
      setTimeout(() => setCopiedPhone(false), 2500);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      toast.error("कृपया अपना पूरा नाम दर्ज करें (कम से कम 2 अक्षर)");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      toast.error("कृपया एक मान्य ईमेल पता दर्ज करें (Valid Email Address)");
      return false;
    }
    const cleanPhone = formData.phone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      toast.error("कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें");
      return false;
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      toast.error("कृपया समस्या या संदेश का विस्तृत विवरण लिखें (कम से कम 10 अक्षर)");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      let isSuccess = false;
      let serverErrorMsg = "";

      // 1. Try sending to the backend API endpoint
      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        const result = await response.json().catch(() => ({}));

        if (response.ok && !result.error) {
          isSuccess = true;
        } else {
          serverErrorMsg =
            result.error ||
            result.errorMessage ||
            result.message ||
            (response.status ? `सर्वर त्रुटि (${response.status})` : "संदेश भेजने में समस्या आई।");
        }
      } catch (networkErr: any) {
        console.warn("API Contact call network failure:", networkErr);
        serverErrorMsg = "सर्वर से सीधा संपर्क नहीं हो सका।";
      }

      // 2. Best-effort backup save to Supabase contact_messages table
      let supabaseSaved = false;
      try {
        const { error: sbErr } = await (supabase as any).from("contact_messages").insert([
          {
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            category: formData.category,
            message: formData.message.trim(),
            status: "new",
          },
        ]);
        if (!sbErr) {
          supabaseSaved = true;
        }
      } catch {
        // Table might not exist or network failure
      }

      if (isSuccess) {
        setSubmitted(true);
        toast.success("आपका संदेश सफलतापूर्वक भेज दिया गया है!");
      } else if (supabaseSaved) {
        // Backup save succeeded!
        setSubmitted(true);
        toast.success("आपका संदेश पोर्टल पर सुरक्षित सहेज लिया गया है! एडमिन शीघ्र संपर्क करेंगे।");
      } else {
        throw new Error(serverErrorMsg || "संदेश भेजने में समस्या आई।");
      }
    } catch (err: any) {
      console.error("Submission failed:", err);
      setErrorMsg(
        err?.message ||
          "सर्वर से संपर्क नहीं हो सका। आप नीचे दिए गए 'WhatsApp' या सीधे ईमेल बटन से भी हमें संदेश भेज सकते हैं।"
      );
      toast.error("ईमेल भेजने में कठिनाई हुई। कृपया WhatsApp या डायरेक्ट ईमेल विकल्प का उपयोग करें।");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      category: CATEGORIES[0],
      message: "",
    });
    setSubmitted(false);
    setErrorMsg(null);
  };

  // WhatsApp fallback link generator
  const getWhatsAppLink = () => {
    const text = `*नोहर विकास मंच - संपर्क/समस्या विवरण*%0A%0A*नाम:* ${encodeURIComponent(
      formData.name || "नागरिक"
    )}%0A*ईमेल:* ${encodeURIComponent(formData.email || "N/A")}%0A*फ़ोन:* ${encodeURIComponent(
      formData.phone || "N/A"
    )}%0A*श्रेणी:* ${encodeURIComponent(formData.category)}%0A%0A*समस्या/संदेश:*%0A${encodeURIComponent(
      formData.message || "नमस्ते, मुझे नोहर विकास मंच के संबंध में जानकारी चाहिए।"
    )}`;
    return `https://wa.me/91${CONTACT_INFO.phoneRaw}?text=${text}`;
  };

  // Mailto fallback link
  const getMailtoLink = () => {
    const subject = encodeURIComponent(`[नोहर विकास मंच] ${formData.category} - ${formData.name || "नागरिक"}`);
    const body = encodeURIComponent(
      `नमस्ते नोहर विकास मंच टीम,\n\nनाम: ${formData.name}\nईमेल: ${formData.email}\nफ़ोन: ${formData.phone}\nश्रेणी: ${formData.category}\n\nसमस्या या संदेश:\n${formData.message}\n`
    );
    return `mailto:${CONTACT_INFO.email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="हमसे संपर्क करें (Contact Us) — समस्या निवारण एवं सुझाव"
        description="नोहर विकास मंच (Nohar Vikash Manch) से संपर्क करें। ग्राम नौहर, ग्वालपाड़ा, मधेपुरा संबंधी अपनी समस्या, शिकायत अथवा विकास संबंधी सुझाव साझा करें। ईमेल: abhi96anand@gmail.com, फ़ोन: +91 8770824752"
        keywords="नोहर संपर्क, nohar contact, हमसे संपर्क करें nohar, nohar vikash manch contact, abhi96anand@gmail.com, 8770824752, nohar madhepura contact, नौहर समस्या निवारण"
      />

      <PageBanner
        pageKey="contact"
        icon={Mail}
        title="हमसे संपर्क करें (Contact Us)"
        subtitle="ग्राम विकास, संस्कृति, खेलकूद अथवा किसी भी समस्या/सुझाव हेतु हमसे सीधा संपर्क करें।"
      />

      <div className="container mx-auto px-4 sm:px-6 py-12 lg:py-20">
        {/* Intro Highlight Banner */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5 rounded-2xl p-6 sm:p-8 border border-primary/20 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-md">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-foreground mb-1">
                  आपकी आवाज़, हमारे गाँव की प्रगति (Your Voice Matters)
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  नोहर विकास युवक संघ द्वारा संचालित इस पोर्टल पर आप गाँव की किसी भी समस्या, विकास सुझाव या कार्यक्रम संबंधी जानकारी साझा कर सकते हैं।
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs sm:text-sm shadow-sm transition-all hover:scale-105"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp पर जुड़ें</span>
              </a>
              <a
                href={`tel:${CONTACT_INFO.phone}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground border border-border font-medium text-xs sm:text-sm transition-colors"
              >
                <Phone className="w-4 h-4 text-primary" />
                <span>कॉल करें</span>
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Direct Contact & Details (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border shadow-card">
              <h3 className="text-xl font-display font-bold text-foreground mb-2 flex items-center gap-2">
                <span>संपर्क विवरण</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                  Direct Info
                </span>
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-6">
                आप नीचे दिए गए माध्यमों से भी सीधे हमारे मुख्य संयोजक से संपर्क कर सकते हैं:
              </p>

              <div className="space-y-4">
                {/* Email Card */}
                <div className="p-4 rounded-xl bg-secondary/50 border border-border hover:border-primary/40 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0 mt-0.5">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          आधिकारिक ईमेल (Email)
                        </div>
                        <a
                          href={`mailto:${CONTACT_INFO.email}`}
                          className="text-sm sm:text-base font-bold text-foreground hover:text-primary transition-colors break-all"
                        >
                          {CONTACT_INFO.email}
                        </a>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          सभी संदेश इस ईमेल पर प्राप्त होते हैं
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(CONTACT_INFO.email, "email")}
                      className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors shrink-0"
                      title="ईमेल कॉपी करें"
                    >
                      {copiedEmail ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Phone Card */}
                <div className="p-4 rounded-xl bg-secondary/50 border border-border hover:border-primary/40 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          फ़ोन / व्हाट्सएप (Helpline)
                        </div>
                        <a
                          href={`tel:${CONTACT_INFO.phone}`}
                          className="text-sm sm:text-base font-bold text-foreground hover:text-primary transition-colors"
                        >
                          {CONTACT_INFO.phone}
                        </a>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          कॉल या व्हाट्सएप संदेश भेजें
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(CONTACT_INFO.phone, "phone")}
                      className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors shrink-0"
                      title="फ़ोन नंबर कॉपी करें"
                    >
                      {copiedPhone ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Address Card */}
                <div className="p-4 rounded-xl bg-secondary/50 border border-border hover:border-primary/40 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        कार्यालय पता (Office Address)
                      </div>
                      <p className="text-xs sm:text-sm text-foreground font-medium mt-1 leading-relaxed">
                        {CONTACT_INFO.address}
                      </p>
                      <a
                        href={CONTACT_INFO.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline mt-2"
                      >
                        <span>Google Maps पर देखें</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Commitments */}
              <div className="mt-6 pt-6 border-t border-border space-y-3">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <Clock className="w-4 h-4 text-primary shrink-0" />
                  <span>प्रतिक्रिया समय: <strong>24 से 48 घंटे के भीतर</strong></span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>आपकी व्यक्तिगत जानकारी पूर्णतः सुरक्षित एवं गोपनीय रखी जाएगी।</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <Building2 className="w-4 h-4 text-accent shrink-0" />
                  <span>नोहर विकास युवक संघ — मधेपुरा, बिहार</span>
                </div>
              </div>
            </div>

            {/* Quick Guidelines Card */}
            <div className="bg-secondary/40 rounded-2xl p-6 border border-border text-xs sm:text-sm space-y-2.5">
              <div className="font-semibold text-foreground flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-primary" />
                <span>आप किन विषयों पर संपर्क कर सकते हैं?</span>
              </div>
              <ul className="list-disc list-inside space-y-1.5 text-muted-foreground">
                <li>गाँव में सड़क, नाली, सफ़ाई या पानी की समस्या</li>
                <li>स्ट्रीट लाइट या बिजली आपूर्ति संबंधित शिकायतें</li>
                <li>रामनवमी मेला, खेल प्रतियोगिता या सांस्कृतिक आयोजन सुझाव</li>
                <li>पुस्तकालय एवं युवा क्लब में सहयोग</li>
                <li>वेबसाइट पर नई जानकारी या फ़ोटो/वीडियो जुड़वाने हेतु</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Contact Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-card rounded-2xl p-6 sm:p-10 border border-border shadow-card relative overflow-hidden">
              {/* Subtle decorative glow */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />

              <div className="mb-8">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>समस्या या संदेश प्रेषित करें</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
                  हमसे संपर्क करें
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                  कृपया अपना नाम, ईमेल, फ़ोन नंबर और अपनी समस्या नीचे भरें। आपका संदेश सीधे हमारे एडमिनिस्ट्रेशन को ईमेल के माध्यम से प्राप्त होगा।
                </p>
              </div>

              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="py-8 text-center space-y-6"
                  >
                    <div className="w-20 h-20 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center ring-8 ring-emerald-500/10">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xl sm:text-2xl font-bold text-foreground">
                        संदेश सफलतापूर्वक भेज दिया गया है!
                      </h4>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                        धन्यवाद, <strong>{formData.name}</strong> जी! आपका संदेश हमारे एडमिनिस्ट्रेशन (<strong>{CONTACT_INFO.email}</strong>) को ईमेल कर दिया गया है। हम शीघ्र ही आपसे संपर्क करेंगे।
                      </p>
                    </div>

                    <div className="bg-secondary/60 rounded-xl p-4 max-w-md mx-auto text-left text-xs space-y-2 border border-border">
                      <div className="font-semibold text-foreground border-b border-border pb-1">
                        आपके द्वारा भेजा गया विवरण:
                      </div>
                      <div><strong>श्रेणी:</strong> {formData.category}</div>
                      <div><strong>फ़ोन:</strong> {formData.phone}</div>
                      <div><strong>ईमेल:</strong> {formData.email}</div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>दूसरा संदेश भेजें</span>
                      </button>
                      <a
                        href={getWhatsAppLink()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors shadow-sm"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>WhatsApp पर भी भेजें</span>
                      </a>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-5"
                  >
                    {errorMsg && (
                      <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs sm:text-sm flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <div className="space-y-2">
                          <p className="font-semibold">{errorMsg}</p>
                          <div className="flex flex-wrap gap-2 pt-1">
                            <a
                              href={getWhatsAppLink()}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp पर भेजें</span>
                            </a>
                            <a
                              href={getMailtoLink()}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-foreground rounded-lg text-xs font-semibold border border-border hover:bg-secondary/80"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              <span>सीधे ईमेल ऐप में खोलें</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Name Field */}
                    <div className="space-y-2">
                      <label htmlFor="contact-name" className="block text-xs sm:text-sm font-semibold text-foreground">
                        आपका नाम (Full Name) <span className="text-destructive">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                          <User className="w-4 h-4" />
                        </div>
                        <input
                          id="contact-name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="उदा. रमेश कुमार / Amit Kumar"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    {/* Email and Phone Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Email Field */}
                      <div className="space-y-2">
                        <label htmlFor="contact-email" className="block text-xs sm:text-sm font-semibold text-foreground">
                          ईमेल पता (Email) <span className="text-destructive">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                            <Mail className="w-4 h-4" />
                          </div>
                          <input
                            id="contact-email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="yourname@gmail.com"
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                          />
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          इस ईमेल पर जवाब भेजा जाएगा
                        </p>
                      </div>

                      {/* Phone Field */}
                      <div className="space-y-2">
                        <label htmlFor="contact-phone" className="block text-xs sm:text-sm font-semibold text-foreground">
                          फ़ोन नंबर (Phone No.) <span className="text-destructive">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                            <Phone className="w-4 h-4" />
                          </div>
                          <input
                            id="contact-phone"
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="9876543210 (10 अंक)"
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                          />
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          व्हाट्सएप या कॉल संपर्क हेतु
                        </p>
                      </div>
                    </div>

                    {/* Category Dropdown */}
                    <div className="space-y-2">
                      <label htmlFor="contact-category" className="block text-xs sm:text-sm font-semibold text-foreground">
                        विषय / समस्या की श्रेणी (Category)
                      </label>
                      <select
                        id="contact-category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Problem / Message Field */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label htmlFor="contact-message" className="block text-xs sm:text-sm font-semibold text-foreground">
                          क्या समस्या है / विस्तृत संदेश (Problem / Message) <span className="text-destructive">*</span>
                        </label>
                        <span className="text-[11px] text-muted-foreground">
                          {formData.message.length} अक्षर
                        </span>
                      </div>
                      <div className="relative">
                        <textarea
                          id="contact-message"
                          required
                          rows={5}
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          placeholder="अपनी समस्या, गाँव का वार्ड/स्थान और आवश्यक विवरण विस्तार से लिखें..."
                          className="w-full p-4 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-y min-h-[120px]"
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        जितना अधिक विवरण देंगे, समस्या का निवारण उतना ही शीघ्र हो सकेगा।
                      </p>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 px-6 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-sm sm:text-base transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>संदेश भेजा जा रहा है...</span>
                          </>
                        ) : (
                          <>
                            <span>संदेश भेजें (Send Message)</span>
                            <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>
                    </div>

                    <div className="text-center pt-2">
                      <span className="text-xs text-muted-foreground">
                        संदेश सीधे <strong>{CONTACT_INFO.email}</strong> पर प्रेषित किया जाएगा।
                      </span>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
