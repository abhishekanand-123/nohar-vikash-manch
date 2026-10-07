import React, { useEffect, useState, useRef } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";

export interface LanguageOption {
  code: string;
  name: string;
  shortLabel: string;
  nativeName: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: "hi", name: "Hindi", shortLabel: "हिं", nativeName: "हिंदी" },
  { code: "en", name: "English", shortLabel: "EN", nativeName: "English" },
  { code: "mai", name: "Maithili", shortLabel: "मै", nativeName: "मैथिली" },
];

function getSavedLanguage(): string {
  if (typeof window === "undefined") return "hi";
  
  // 1. Check localStorage
  const local = localStorage.getItem("user_selected_lang");
  if (local && ["hi", "en", "mai"].includes(local)) return local;

  // 2. Check googtrans cookie: /hi/en or /auto/mai
  const match = document.cookie.match(/(?:^|;\s*)googtrans=([^;]+)/);
  if (match && match[1]) {
    const parts = match[1].split("/");
    const lang = parts[parts.length - 1];
    if (["hi", "en", "mai"].includes(lang)) return lang;
  }

  return "hi";
}

function applyGoogleTranslation(targetLang: string) {
  const hostname = window.location.hostname;

  if (targetLang === "hi") {
    // Clear cookie to revert to default page language (Hindi)
    const cookieString = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = cookieString;
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${hostname};`;
    if (hostname.includes(".")) {
      const rootDomain = hostname.split(".").slice(-2).join(".");
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${rootDomain};`;
    }
    localStorage.setItem("user_selected_lang", "hi");
  } else {
    const val = `/hi/${targetLang}`;
    document.cookie = `googtrans=${val}; path=/;`;
    document.cookie = `googtrans=${val}; path=/; domain=${hostname};`;
    if (hostname.includes(".")) {
      const rootDomain = hostname.split(".").slice(-2).join(".");
      document.cookie = `googtrans=${val}; path=/; domain=.${rootDomain};`;
    }
    localStorage.setItem("user_selected_lang", targetLang);
  }

  // Trigger combo if already in DOM
  const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
  if (combo) {
    combo.value = targetLang;
    combo.dispatchEvent(new Event("change"));
  }

  // Reload window for fresh DOM translation cycle
  window.location.reload();
}

interface LanguageSwitcherProps {
  variant?: "desktop" | "mobile";
}

export default function LanguageSwitcher({ variant = "desktop" }: LanguageSwitcherProps) {
  const [currentLang, setCurrentLang] = useState<string>("hi");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentLang(getSavedLanguage());

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectLanguage = (langCode: string) => {
    if (langCode === currentLang) {
      setIsOpen(false);
      return;
    }
    setCurrentLang(langCode);
    setIsOpen(false);
    applyGoogleTranslation(langCode);
  };

  const selectedOption = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  // Mobile full-width segmented switcher
  if (variant === "mobile") {
    return (
      <div className="notranslate flex flex-col gap-2 p-3 bg-secondary/50 rounded-2xl border border-border/50">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground px-1">
          <Globe className="w-4 h-4 text-primary" />
          <span>भाषा चुनें / Select Language</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {LANGUAGES.map((lang) => {
            const isSelected = lang.code === currentLang;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelectLanguage(lang.code)}
                className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/30"
                    : "bg-card text-foreground hover:bg-card/80 border border-border/40"
                }`}
              >
                <span className="text-sm font-bold">{lang.nativeName}</span>
                <span className="text-[10px] opacity-80">{lang.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Desktop elegant dropdown
  return (
    <div className="notranslate relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select Language"
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-secondary/80 hover:bg-secondary border border-border/60 text-foreground transition-all duration-150 shadow-sm"
      >
        <Globe className="w-4 h-4 text-primary" />
        <span className="tracking-wide">{selectedOption.nativeName}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-xl bg-card border border-border/80 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/40">
            Language / भाषा
          </div>
          <div className="py-1">
            {LANGUAGES.map((lang) => {
              const isSelected = lang.code === currentLang;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-colors ${
                    isSelected
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-foreground hover:bg-secondary font-medium"
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="leading-tight">{lang.nativeName}</span>
                    <span className="text-[10px] text-muted-foreground">{lang.name}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
