import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { QrCode, Download, Copy, Check, Share2, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface WebsiteQrModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function WebsiteQrModal({ open, onOpenChange }: WebsiteQrModalProps) {
  const [copied, setCopied] = useState(false);
  const siteUrl = "https://noharvikashmanch.in";

  const handleCopy = () => {
    navigator.clipboard.writeText(siteUrl);
    setCopied(true);
    toast({ title: "लिंक कॉपी हो गया!", description: siteUrl });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Nohar Vikash Manch — ग्राम नौहर डिजिटल पोर्टल",
          text: "ग्राम नौहर, मधेपुरा (बिहार) के आधिकारिक डिजिटल पोर्टल पर जुड़ें:",
          url: siteUrl,
        });
      } catch {
        // user cancelled share
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[92vw] rounded-2xl p-6 sm:p-7 text-center">
        <DialogHeader className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center mb-2 ring-4 ring-primary/15">
            <QrCode className="w-6 h-6" />
          </div>
          <DialogTitle className="text-xl font-display font-bold text-foreground">
            वेबसाइट QR Code
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            किसी भी फ़ोन के कैमरा या Google Lens से स्कैन करके वेबसाइट तुरंत खोलें
          </DialogDescription>
        </DialogHeader>

        {/* QR Code Graphic Card */}
        <div className="my-4 bg-gradient-to-b from-card to-secondary/30 rounded-2xl p-6 border border-border shadow-sm flex flex-col items-center">
          <div className="relative p-3 bg-white rounded-2xl shadow-md border border-slate-200">
            <img
              src="/qr-code.png"
              alt="Nohar Vikash Manch Website QR Code"
              className="w-56 h-56 sm:w-60 sm:h-60 object-contain rounded-lg"
              loading="lazy"
            />
          </div>

          <div className="mt-3 text-center">
            <p className="font-display font-bold text-sm text-foreground">
              noharvikashmanch.in
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              ग्राम नौहर, ग्वालपाड़ा (मधेपुरा, बिहार)
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          <a
            href="/qr-code.png"
            download="nohar-vikash-manch-qr.png"
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:opacity-90 transition-opacity shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PNG</span>
          </a>

          <a
            href="/qr-code.svg"
            download="nohar-vikash-manch-qr.svg"
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-secondary text-secondary-foreground font-semibold text-xs hover:bg-secondary/80 border border-border transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-accent" />
            <span>Print Vector (SVG)</span>
          </a>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-card border border-border text-foreground hover:bg-secondary text-xs font-medium transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "कॉपी हो गया!" : "वेबसाइट लिंक कॉपी"}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-card border border-border text-foreground hover:bg-secondary text-xs font-medium transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-primary" />
            <span>शेयर करें</span>
          </button>
        </div>

        <div className="mt-2 text-center">
          <a
            href="https://api.whatsapp.com/send?text=%E0%A4%97%E0%A5%8D%E0%A4%B0%E0%A4%BE%E0%A4%AE%20%E0%A4%A8%E0%A5%8C%E0%A4%B9%E0%A4%B0%20%E0%A4%95%E0%A4%BE%20%E0%A4%A1%E0%A4%BF%E0%A4%9C%E0%A4%BF%E0%A4%9F%E0%A4%B2%20%E0%A4%AA%E0%A5%8B%E0%A4%B0%E0%A5%8D%E0%A4%9F%E0%A4%B2%3A%20https%3A%2F%2Fnoharvikashmanch.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-primary hover:underline font-medium inline-flex items-center gap-1"
          >
            व्हाट्सएप (WhatsApp) पर शेयर करें <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
