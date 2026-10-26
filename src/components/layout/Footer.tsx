import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Mail, Phone, Instagram, Facebook, QrCode } from "lucide-react";
import { useSocialLinks } from "@/hooks/useSocialLinks";
import WebsiteQrModal from "@/components/common/WebsiteQrModal";

export default function Footer() {
  const { data: socialLinks } = useSocialLinks();
  const [showQrModal, setShowQrModal] = useState(false);

  return (
    <footer className="bg-foreground text-background py-12 sm:py-16 pb-[max(3rem,env(safe-area-inset-bottom))]">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-3 gap-10 md:gap-12 text-left">
          <div>
            <Link to="/" className="inline-block font-display text-xl font-bold mb-4 hover:text-accent transition-colors">
              Nohar<span className="text-accent">Vikash</span>Manch
            </Link>
            <p className="text-background/70 text-sm leading-relaxed">
            नोहर विकास युवक संघ द्वारा संचालित। यह एक समुदाय है जो कृषि, शांति और मधेपुरा की जीवंत संस्कृति को समर्पित है।
            </p>

            {socialLinks?.is_active && (socialLinks.instagram || socialLinks.facebook) && (
              <div className="mt-6">
                <span className="block text-xs uppercase tracking-wider text-background/60 font-semibold mb-2.5">
                  सोशल मीडिया पर जुड़ें (Follow Us)
                </span>
                <div className="flex flex-wrap items-center gap-2.5">
                  {socialLinks.instagram && (
                    <a
                      href={socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram"
                      title="Follow us on Instagram"
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-background/10 hover:bg-pink-500/20 border border-background/15 hover:border-pink-500/40 text-background text-xs font-medium transition-all duration-200 group"
                    >
                      <Instagram className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform" />
                      <span>Instagram</span>
                    </a>
                  )}
                  {socialLinks.facebook && (
                    <a
                      href={socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Facebook"
                      title="Follow us on Facebook"
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-background/10 hover:bg-blue-600/20 border border-background/15 hover:border-blue-500/40 text-background text-xs font-medium transition-all duration-200 group"
                    >
                      <Facebook className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                      <span>Facebook</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
          <div>
            <h4 className="font-display font-semibold mb-4">महत्वपूर्ण लिंक</h4>
            <ul className="space-y-2.5 text-sm text-background/70">
              <li><Link to="/" className="hover:text-accent transition-colors">मुख्य पृष्ठ</Link></li>
              <li><Link to="/about" className="hover:text-accent transition-colors">हमारे बारे में</Link></li>
              <li><Link to="/gram-udyog" className="hover:text-accent transition-colors">ग्राम उद्योग एवं विकास</Link></li>
              <li><Link to="/lekha-jokha" className="hover:text-accent transition-colors">लेखा-जोखा एवं रिपोर्ट</Link></li>
              <li><Link to="/festivals" className="hover:text-accent transition-colors">त्योहार</Link></li>
              <li><Link to="/sports" className="hover:text-accent transition-colors">खेल क्लब</Link></li>
              <li><Link to="/gallery" className="hover:text-accent transition-colors">गैलरी</Link></li>
              <li><Link to="/videos" className="hover:text-accent transition-colors">वीडियो</Link></li>
              <li><Link to="/donation" className="hover:text-accent transition-colors">दान</Link></li>
              <li><Link to="/contact" className="hover:text-accent text-accent/95 transition-colors font-semibold">हमसे संपर्क करें (Contact Us)</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-accent transition-colors">गोपनीयता नीति (Privacy Policy)</Link></li>
              <li><Link to="/terms-conditions" className="hover:text-accent transition-colors">नियम एवं शर्तें (Terms & Conditions)</Link></li>
              <li>
                <button
                  type="button"
                  onClick={() => setShowQrModal(true)}
                  className="text-primary-foreground/90 hover:text-accent transition-colors flex items-center gap-1.5 font-medium"
                >
                  <QrCode className="w-4 h-4 text-accent" />
                  <span>वेबसाइट QR Code (स्कैन व डाउनलोड)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent("trigger-pwa-install"))}
                  className="text-accent hover:underline flex items-center gap-1 font-medium"
                >
                  📲 App Install करें (PWA)
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-background/70">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span>ग्राम – नोहर, पोस्ट – ग्वालपाड़ा (Nohar, Gwalpara), जिला – मधेपुरा, बिहार, भारत</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0 text-accent" />
                <a href="mailto:abhi96anand@gmail.com" className="hover:text-accent transition-colors font-medium">
                  abhi96anand@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0 text-accent" />
                <a href="tel:+918770824752" className="hover:text-accent transition-colors font-medium">
                  +91 8770824752
                </a>
              </li>
              <li className="pt-2">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-accent-foreground text-xs font-bold hover:opacity-95 transition-opacity shadow-sm"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>हमसे संपर्क करें (Contact Us)</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-background/10 text-center text-xs sm:text-sm text-background/60">
          © {new Date().getFullYear()} अभिषेक आनंद (Administration) नोहर विकास युवक संघ। सभी अधिकार सुरक्षित।
        </div>
      </div>
      <WebsiteQrModal open={showQrModal} onOpenChange={setShowQrModal} />
    </footer>
  );
}
