import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Heart, Copy, Check, ExternalLink, Download, AlertCircle } from "lucide-react";
import PageBanner from "@/components/layout/PageBanner";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import SEO from "@/components/common/SEO";

interface DonationItem {
  id: string;
  name: string | null;
  amount: number | null;
  message: string | null;
  created_at: string;
}

const DEFAULT_UPI_ID = "8770824752@ybl";
const DEFAULT_BANK_NAME = "State Bank of India - 4588";
const DEFAULT_QR_URL = "/upi-qr-code.png";

export default function Donation() {
  const [donations, setDonations] = useState<DonationItem[]>([]);
  const [copied, setCopied] = useState(false);
  const [upiSettings, setUpiSettings] = useState({
    upiId: DEFAULT_UPI_ID,
    bankName: DEFAULT_BANK_NAME,
    qrImageUrl: DEFAULT_QR_URL,
    isActive: true,
  });

  useEffect(() => {
    async function load() {
      // 1. Load donations list
      const { data } = await supabase
        .from("donations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      setDonations((data as DonationItem[]) ?? []);

      // 2. Load dynamic UPI settings from page_banners
      const { data: banner } = await supabase
        .from("page_banners")
        .select("*")
        .eq("page_key", "donation_upi")
        .maybeSingle();

      if (banner) {
        setUpiSettings({
          upiId: banner.title?.trim() || DEFAULT_UPI_ID,
          bankName: banner.subtitle?.trim() || DEFAULT_BANK_NAME,
          qrImageUrl: banner.bg_image?.trim() || DEFAULT_QR_URL,
          isActive: banner.is_active ?? true,
        });
      }
    }
    load();
  }, []);

  const upiId = upiSettings.upiId || DEFAULT_UPI_ID;
  const bankName = upiSettings.bankName || DEFAULT_BANK_NAME;
  const qrImageUrl = upiSettings.qrImageUrl || DEFAULT_QR_URL;
  const upiPayUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=Nohar%20Vikash%20Manch&cu=INR`;

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    toast.success("UPI ID क्लिपबोर्ड में कॉपी हो गया!");
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div>
      <SEO
        title="सहयोग एवं दान (Support & Donation)"
        description={`ग्राम नौहर के विकास, त्योहारों, मंदिर जीर्णोद्धार, पुस्तकालय एवं खेल गतिविधियों के लिए पारदर्शी ऑनलाइन दान व UPI सहयोग। UPI ID: ${upiId}`}
        keywords={`नोहर दान, ऑनलाइन सहयोग, Donation Nohar, UPI ${upiId}, ${bankName}`}
      />
      <PageBanner
        pageKey="donation"
        icon={Heart}
        title="Donate for Village Events"
        subtitle="Your generous donations help us organize festivals, maintain the temple, and support community activities."
      />

      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-8">
          {/* QR Code Card */}
          <div className="bg-card rounded-2xl p-8 shadow-card ring-1 ring-border text-center flex flex-col items-center">
            {upiSettings.isActive ? (
              <>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span>{bankName}</span>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-md ring-1 ring-border/80 mb-5 max-w-[260px]">
                  <img
                    src={qrImageUrl}
                    alt="Donation UPI QR Code"
                    className="w-56 h-56 object-contain rounded-xl"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_QR_URL;
                    }}
                  />
                </div>

                <p className="text-sm font-medium text-muted-foreground mb-3">
                  Scan the QR code above to donate via PhonePe, GPay, Paytm, or any UPI app
                </p>

                <div className="flex items-center gap-2 bg-secondary/70 hover:bg-secondary border border-border px-4 py-2 rounded-xl text-sm transition-colors mb-4">
                  <span className="text-muted-foreground">UPI ID:</span>
                  <span className="font-semibold font-mono text-foreground">{upiId}</span>
                  <button
                    onClick={handleCopyUPI}
                    title="Copy UPI ID"
                    className="ml-1 p-1 rounded-md text-primary hover:bg-primary/10 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 justify-center w-full">
                  <a
                    href={upiPayUrl}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <span>Open UPI App</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={qrImageUrl}
                    download="nohar-vikas-manch-qr.png"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-secondary text-secondary-foreground text-xs font-medium rounded-lg hover:bg-secondary/80 transition-colors border border-border"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Save QR</span>
                  </a>
                </div>

                <p className="text-xs text-muted-foreground mt-4">
                  पूजा, खेल आयोजनों और गाँव के विकास कार्यों को सहयोग करें।
                </p>
              </>
            ) : (
              <div className="py-12 px-4 flex flex-col items-center justify-center text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground/60 mb-3" />
                <h3 className="font-bold text-base text-foreground mb-1">
                  ऑनलाइन दान सेवा अस्थायी रूप से बंद है
                </h3>
                <p className="text-xs text-muted-foreground max-w-xs">
                  वर्तमान में ऑनलाइन UPI भुगतान स्वीकार नहीं किया जा रहा है। कृपया किसी भी जानकारी के लिए संपर्क पृष्ठ पर जाएँ।
                </p>
              </div>
            )}
          </div>

          <div>
            <div className="bg-primary/5 rounded-2xl p-8 text-center ring-1 ring-primary/10">
              <Heart className="w-10 h-10 text-accent mx-auto mb-4" />
              <h3 className="font-display font-bold text-xl mb-2 text-foreground">Thank You!</h3>
              <p className="text-muted-foreground leading-relaxed">
                हम अपने गाँव के सभी दानदाताओं के प्रति आभारी हैं, जो हमारे कार्यक्रमों का समर्थन करते हैं। आपके सहयोग से रामनवमी पूजा, छठ पर्व, खेल प्रतियोगिताएँ और गाँव के विकास कार्य संभव हो पाते हैं। मिलकर हम नोहर को एक बेहतर स्थान बना रहे हैं।
              </p>
            </div>
            <div className="mt-6 bg-card rounded-2xl p-6 shadow-card ring-1 ring-border">
              <h3 className="font-display font-bold text-xl text-foreground mb-4">Recent Contributions</h3>
              {donations.length === 0 ? (
                <p className="text-muted-foreground text-sm">अभी तक कोई दान रिकॉर्ड उपलब्ध नहीं है।</p>
              ) : (
                <div className="space-y-3">
                  {donations.map((d) => (
                    <motion.div
                      key={d.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-secondary/50"
                    >
                      <div>
                        <p className="font-semibold text-sm text-foreground">{d.name || "Anonymous"}</p>
                        {d.message && <p className="text-xs text-muted-foreground">{d.message}</p>}
                      </div>
                      <span className="font-bold text-primary text-sm">₹{d.amount ?? 0}</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
