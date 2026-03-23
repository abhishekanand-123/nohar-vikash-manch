import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Heart, QrCode } from "lucide-react";
import PageBanner from "@/components/layout/PageBanner";
import { supabase } from "@/integrations/supabase/client";

interface DonationItem {
  id: string;
  name: string | null;
  amount: number | null;
  message: string | null;
  created_at: string;
}

export default function Donation() {
  const [donations, setDonations] = useState<DonationItem[]>([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("donations").select("*").order("created_at", { ascending: false }).limit(10);
      setDonations((data as DonationItem[]) ?? []);
    }
    load();
  }, []);

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
          <div className="bg-card rounded-2xl p-8 shadow-card ring-1 ring-border text-center">
            <div className="w-52 h-52 bg-muted rounded-2xl mx-auto mb-6 flex items-center justify-center ring-1 ring-border">
              <QrCode className="w-24 h-24 text-muted-foreground/80" />
            </div>
            <p className="text-sm text-muted-foreground mb-2">Scan the QR code above to donate via UPI</p>
            <p className="font-display font-semibold text-foreground">UPI ID: noharvikas@upi</p>
            <p className="text-xs text-muted-foreground mt-3">पूजा, खेल आयोजनों और गाँव के विकास कार्यों को सहयोग करें।</p>
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
