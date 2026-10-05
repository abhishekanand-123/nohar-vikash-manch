import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Heart, Copy, Check, ExternalLink, Download } from "lucide-react";
import PageBanner from "@/components/layout/PageBanner";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DonationItem {
  id: string;
  name: string | null;
  amount: number | null;
  message: string | null;
  created_at: string;
}

const UPI_ID = "8770824752@ybl";
const BANK_NAME = "State Bank of India - 4588";
const UPI_PAY_URL = `upi://pay?pa=${UPI_ID}&pn=Nohar%20Vikash%20Manch&cu=INR`;

export default function Donation() {
  const [donations, setDonations] = useState<DonationItem[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("donations").select("*").order("created_at", { ascending: false }).limit(10);
      setDonations((data as DonationItem[]) ?? []);
    }
    load();
  }, []);

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    toast.success("UPI ID copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div>
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>{BANK_NAME}</span>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-md ring-1 ring-border/80 mb-5 max-w-[260px]">
              <img
                src="/upi-qr-code.png"
                alt="Donation UPI QR Code"
                className="w-56 h-56 object-contain rounded-xl"
              />
            </div>
            
            <p className="text-sm font-medium text-muted-foreground mb-3">
              Scan the QR code above to donate via PhonePe, GPay, Paytm, or any UPI app
            </p>

            <div className="flex items-center gap-2 bg-secondary/70 hover:bg-secondary border border-border px-4 py-2 rounded-xl text-sm transition-colors mb-4">
              <span className="text-muted-foreground">UPI ID:</span>
              <span className="font-semibold font-mono text-foreground">{UPI_ID}</span>
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
                href={UPI_PAY_URL}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                <span>Open UPI App</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href="/upi-qr-code.png"
                download="nohar-vikas-manch-qr.png"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-secondary text-secondary-foreground text-xs font-medium rounded-lg hover:bg-secondary/80 transition-colors border border-border"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save QR</span>
              </a>
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              पूजा, खेल आयोजनों और गाँव के विकास कार्यों को सहयोग करें।
            </p>
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
                <p className="text-sm text-muted-foreground">No donations listed yet.</p>
              ) : (
                <div className="space-y-3 max-h-[360px] overflow-auto pr-1">
                  {donations.map((donation) => (
                    <motion.div
                      key={donation.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-xl bg-secondary/50 ring-1 ring-border"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-foreground">{donation.name || "Anonymous"}</p>
                          {donation.message && <p className="text-xs text-muted-foreground mt-1">{donation.message}</p>}
                        </div>
                        <p className="text-sm font-semibold text-primary">Rs {donation.amount ?? 0}</p>
                      </div>
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
