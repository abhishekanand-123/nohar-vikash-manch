import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";

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
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/85 backdrop-blur-xl shadow-card border-b border-border/40 [padding-top:env(safe-area-inset-top,0px)]">
      <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between min-h-16">
        <Link to="/" className="font-display text-xl font-bold text-primary notranslate" translate="no" title="Home">
          Nohar<span className="text-accent">Vikash</span>Manch
        </Link>

        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-1.5">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
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
            className="lg:hidden bg-card border-t border-border overflow-hidden"
          >
            <div className="container mx-auto px-4 sm:px-6 py-3 pb-5 flex flex-col gap-1.5">
              {/* Mobile Language Selector */}
              <div className="mb-2">
                <LanguageSwitcher variant="mobile" />
              </div>

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
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  window.dispatchEvent(new CustomEvent("trigger-pwa-install"));
                }}
                className="px-4 py-3 min-h-[44px] rounded-xl text-sm font-medium border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 transition-colors flex items-center justify-center gap-2 mt-1"
              >
                📲 App Install करें
              </button>
              <Link
                to="/admin/login"
                onClick={() => setOpen(false)}
                className="px-4 py-3 min-h-[44px] rounded-xl text-sm font-medium bg-accent text-accent-foreground flex items-center justify-center mt-1"
              >
                Admin
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
