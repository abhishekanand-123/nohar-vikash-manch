import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Instagram, Facebook } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import { useSocialLinks } from "@/hooks/useSocialLinks";

const navLinks = [
  { to: "/", label: "मुख्य पृष्ठ" },
  { to: "/about", label: "हमारे बारे में" },
  { to: "/gram-udyog", label: "ग्राम उद्योग" },
  { to: "/lekha-jokha", label: "लेखा-जोखा" },
  { to: "/festivals", label: "त्योहार" },
  { to: "/ramnavami", label: "रामनवमी" },
  { to: "/sports", label: "खेल क्लब" },
  { to: "/gallery", label: "गैलरी" },
  { to: "/videos", label: "वीडियो" },
  { to: "/donation", label: "दान" },
  { to: "/contact", label: "संपर्क करें" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { data: socialLinks } = useSocialLinks();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/85 backdrop-blur-xl shadow-card border-b border-border/40 [padding-top:env(safe-area-inset-top,0px)]">
      <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between min-h-16">
        <Link to="/" className="font-display text-xl font-bold text-primary notranslate" translate="no" title="Home">
          Nohar<span className="text-accent">Vikash</span>Manch
        </Link>

        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-1 xl:gap-1.5">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-2 xl:px-3 py-1.5 xl:py-2 rounded-lg text-xs xl:text-sm font-medium transition-colors whitespace-nowrap ${
                location.pathname === link.to
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-secondary"
              }`}
            >
              {link.label}
            </Link>
          ))}
          
          {/* Language Switcher */}
          <div className="ml-1">
            <LanguageSwitcher variant="desktop" />
          </div>

          {/* Social Links (Instagram & Facebook) */}
          {socialLinks?.is_active && (socialLinks.instagram || socialLinks.facebook) && (
            <div className="flex items-center gap-1 ml-1 border-l border-border/60 pl-1.5">
              {socialLinks.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  title="Instagram पर फॉलो करें"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-pink-600 hover:bg-pink-500/10 transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {socialLinks.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  title="Facebook पर फॉलो करें"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-blue-600 hover:bg-blue-600/10 transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
            </div>
          )}

          <Link
            to="/admin/login"
            className="ml-1 px-3.5 py-2 rounded-lg text-sm font-medium bg-accent text-accent-foreground hover:opacity-90 transition-opacity"
          >
            Admin
          </Link>
        </div>

        {/* Mobile toggle & language preview */}
        <div className="lg:hidden flex items-center gap-2">
          <LanguageSwitcher variant="desktop" />
          <button
            type="button"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen(!open)}
            className="p-2.5 min-h-[44px] min-w-[44px] rounded-xl hover:bg-secondary flex items-center justify-center"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-card border-t border-border max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain shadow-2xl [webkit-overflow-scrolling:touch]"
          >
            <div className="container mx-auto px-4 sm:px-6 py-4 pb-12 flex flex-col gap-1.5">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={`px-4 py-3 min-h-[44px] rounded-xl text-sm font-medium transition-colors flex items-center ${
                    location.pathname === link.to
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-secondary"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Mobile Social Links */}
              {socialLinks?.is_active && (socialLinks.instagram || socialLinks.facebook) && (
                <div className="flex items-center gap-2 pt-2 border-t border-border/50 mt-1">
                  {socialLinks.instagram && (
                    <a
                      href={socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 px-3 rounded-xl border border-border bg-secondary/40 hover:bg-pink-500/10 text-foreground hover:text-pink-600 flex items-center justify-center gap-2 text-xs font-semibold transition-colors"
                    >
                      <Instagram className="w-4 h-4 text-pink-600" />
                      <span>Instagram</span>
                    </a>
                  )}
                  {socialLinks.facebook && (
                    <a
                      href={socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 px-3 rounded-xl border border-border bg-secondary/40 hover:bg-blue-600/10 text-foreground hover:text-blue-600 flex items-center justify-center gap-2 text-xs font-semibold transition-colors"
                    >
                      <Facebook className="w-4 h-4 text-blue-600" />
                      <span>Facebook</span>
                    </a>
                  )}
                </div>
              )}

              <div className="pt-2 flex flex-col gap-2 border-t border-border/50 mt-1">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    window.dispatchEvent(new CustomEvent("trigger-pwa-install"));
                  }}
                  className="px-4 py-3 min-h-[44px] rounded-xl text-sm font-semibold border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 transition-colors flex items-center justify-center gap-2"
                >
                  📲 App Install करें
                </button>
                <Link
                  to="/admin/login"
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 min-h-[44px] rounded-xl text-sm font-semibold bg-accent text-accent-foreground flex items-center justify-center shadow-sm hover:opacity-95 transition-opacity"
                >
                  🔐 Admin Login
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
