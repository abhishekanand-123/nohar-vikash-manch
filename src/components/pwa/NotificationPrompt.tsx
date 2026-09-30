import { useState, useEffect } from "react";
import { Bell, BellRing, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  isPushNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
} from "@/lib/pushNotifications";
import { toast } from "sonner";

export default function NotificationPrompt() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [showPrompt, setShowPrompt] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (!isPushNotificationSupported()) return;

    const current = getNotificationPermission();
    setPermission(current);

    const hasSeenPrompt = localStorage.getItem("nvm_notif_prompt_seen");
    if (current === "default" && !hasSeenPrompt) {
      // Delay showing prompt slightly for friendly UX
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleEnableNotifications = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
    setShowPrompt(false);
    localStorage.setItem("nvm_notif_prompt_seen", "true");

    if (result === "granted") {
      toast.success("🔔 सूचनाएँ सक्रिय हो गईं! (Notifications Enabled)");
    } else if (result === "denied") {
      toast.error("ब्राउज़र सेटिंग्स में नोटिफिकेशन्स ब्लॉक हैं।");
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    setShowPrompt(false);
    localStorage.setItem("nvm_notif_prompt_seen", "true");
  };

  if (!isPushNotificationSupported()) return null;

  return (
    <>
      {/* Floating Prompt Banner for First-time visitors */}
      <AnimatePresence>
        {showPrompt && !isDismissed && permission === "default" && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 bg-card/95 backdrop-blur-md border border-primary/30 shadow-2xl rounded-2xl p-4 text-card-foreground"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <BellRing className="w-5 h-5 animate-bounce" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-foreground">
                  गाँव के नए अपडेट्स पाएँ
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  रामनवमी, दुर्गा पूजा, क्रिकेट टूर्नामेंट व आयोजनों की त्वरित सूचना (Push Notification) पाने के लिए ऑन करें।
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    type="button"
                    onClick={handleEnableNotifications}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-3 py-2 rounded-lg transition-all shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    सूचना ऑन करें (Allow)
                  </button>
                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors"
                    aria-label="Dismiss notification prompt"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
