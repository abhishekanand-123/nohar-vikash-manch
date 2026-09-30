import { useState, useEffect } from "react";
import { Download, X, Smartphone, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);

  useEffect(() => {
    // Check if already in standalone / installed mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = async () => {
      setIsInstalled(true);
      setDeferredPrompt(null);

      // 1. Send push notification to user's screen
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("🎉 Nohar Vikash Manch App Installed!", {
          body: "नोहर विकास मंच ॲप इनस्टॉल करने के लिए धन्यवाद! अब आप बिना ब्राउज़र के सीधे ॲप चला सकते हैं।",
          icon: "/pwa-192x192.png",
          badge: "/pwa-64x64.png",
        });
      }

      // 2. Track install event in Supabase Analytics
      try {
        await supabase.from("analytics_events").insert({
          event_type: "app_installed",
          session_id: crypto.randomUUID(),
          visitor_id: localStorage.getItem("nvm_visitor_id") || crypto.randomUUID(),
          visitor_key: "visitor_" + Date.now(),
          page_path: window.location.pathname,
          device_type: /mobile/i.test(navigator.userAgent) ? "mobile" : "desktop",
          browser: navigator.userAgent,
          occurred_at: new Date().toISOString(),
          metadata: {
            installed_at: new Date().toISOString(),
            platform: navigator.platform,
            userAgent: navigator.userAgent,
          },
        });
      } catch (err) {
        console.warn("Could not log app_installed event:", err);
      }
    };

    const handleCustomTrigger = () => {
      handleInstallClick();
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("trigger-pwa-install", handleCustomTrigger);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("trigger-pwa-install", handleCustomTrigger);
    };
  }, [deferredPrompt, isIOS]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSPrompt(true);
    }
  };

  if (isInstalled || isDismissed) {
    return null;
  }

  // Only show if prompt is available or it's iOS
  if (!deferredPrompt && !isIOS) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 bg-card/95 backdrop-blur-md border border-primary/20 shadow-2xl rounded-2xl p-4 text-card-foreground"
        >
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-white shrink-0 shadow-md">
              <img src="/pwa-icon.svg" alt="Nohar Vikash Manch" className="w-10 h-10 rounded-lg object-contain" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 font-semibold text-sm text-foreground">
                <span>Nohar Vikash Manch</span>
                <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" /> App
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                फोन या डेस्कटॉप पर तेजी से चलाने के लिए ॲप इनस्टॉल करें।
              </p>

              <div className="flex items-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-3 py-2 rounded-lg transition-all shadow-sm active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  Install App
                </button>
                <button
                  type="button"
                  onClick={() => setIsDismissed(true)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  aria-label="Dismiss install prompt"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* iOS Instructions Modal */}
      {showIOSPrompt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border p-6 rounded-2xl max-w-sm w-full shadow-2xl text-center space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg text-foreground">iPhone / iPad पर Install करें</h3>
            <div className="text-xs text-muted-foreground text-left space-y-2 bg-secondary/50 p-3 rounded-xl">
              <p>1. Safari के नीचे <strong>Share</strong> बटन ( <span className="font-mono">⎋</span> ) दबाएँ।</p>
              <p>2. नीचे स्क्रॉल करके <strong>&quot;Add to Home Screen&quot; (होम स्क्रीन पर जोड़ें)</strong> चुनें।</p>
              <p>3. ऊपर दाएँ कोने में <strong>Add</strong> पर क्लिक करें।</p>
            </div>
            <button
              type="button"
              onClick={() => setShowIOSPrompt(false)}
              className="w-full bg-primary text-primary-foreground py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              समझ गया (Got it)
            </button>
          </motion.div>
        </div>
      )}
    </>
  );
}
