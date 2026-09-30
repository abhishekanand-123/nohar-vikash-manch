import { useRegisterSW } from "virtual:pwa-register/react";
import { RefreshCw, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log("SW Registered:", r);
    },
    onRegisterError(error) {
      console.error("SW registration error", error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-20 right-4 z-50 max-w-sm bg-card/95 backdrop-blur-md border border-primary/30 text-card-foreground p-3.5 rounded-xl shadow-xl flex items-center gap-3"
      >
        <div className="flex-1 text-xs">
          {offlineReady ? (
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              ✓ App ऑफ़लाइन इस्तेमाल के लिए तैयार है!
            </span>
          ) : (
            <span className="font-medium text-foreground">
              ⚡ नया अपडेट उपलब्ध है!
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {needRefresh && (
            <button
              type="button"
              onClick={() => updateServiceWorker(true)}
              className="inline-flex items-center gap-1 text-xs font-semibold bg-primary text-primary-foreground px-2.5 py-1.5 rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
            >
              <RefreshCw className="w-3 h-3 animate-spin-reverse" /> Update
            </button>
          )}
          <button
            type="button"
            onClick={close}
            className="p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors"
            aria-label="Close prompt"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
