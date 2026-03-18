import { motion } from "framer-motion";
import { Heart, QrCode } from "lucide-react";

export default function Donation() {
  return (
    <div className="py-20">
      <div className="container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <span className="text-accent font-semibold uppercase text-sm tracking-wide">Support Us</span>
          <h1 className="text-section font-display font-bold mt-2 text-foreground">Donate for Village Events</h1>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Your generous donations help us organize festivals, maintain the temple, and support community activities.
            Every contribution makes a difference.
          </p>
        </motion.div>

        <div className="max-w-xl mx-auto">
          {/* QR Code Card */}
          <div className="bg-card rounded-2xl p-8 shadow-card ring-1 ring-border text-center mb-8">
            <div className="w-48 h-48 bg-muted rounded-xl mx-auto mb-6 flex items-center justify-center">
              <QrCode className="w-24 h-24 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-2">Scan the QR code above to donate via UPI</p>
            <p className="font-display font-semibold text-foreground">UPI ID: noharvikas@upi</p>
          </div>

          {/* Thank You */}
          <div className="bg-primary/5 rounded-2xl p-8 text-center ring-1 ring-primary/10">
            <Heart className="w-10 h-10 text-accent mx-auto mb-4" />
            <h3 className="font-display font-bold text-xl mb-2 text-foreground">Thank You!</h3>
            <p className="text-muted-foreground leading-relaxed">
              We are grateful to every donor who supports our village events. Your contributions fund Ramnavami Puja,
              Chhath celebrations, sports tournaments, and village development. Together, we make Nohar a better place.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
