import { supabase } from "@/integrations/supabase/client";

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: {
    url?: string;
    [key: string]: unknown;
  };
}

/**
 * Check if browser supports Notifications and Service Workers
 */
export function isPushNotificationSupported(): boolean {
  return "Notification" in window && "serviceWorker" in navigator;
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!("Notification" in window)) {
    return "denied";
  }
  return Notification.permission;
}

/**
 * Request notification permission from the user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushNotificationSupported()) {
    return "denied";
  }

  try {
    const permission = await Notification.requestPermission();
    
    if (permission === "granted") {
      localStorage.setItem("nvm_notifications_enabled", "true");
      
      // Send instant welcome notification
      await sendAppNotification({
        title: "🔔 Notifications Active — Nohar Vikash Manch",
        body: "आपकी सूचनाएँ सक्रिय हैं! गाँव के नए त्योहारों, खेल व आयोजनों की जानकारी आपको मिलती रहेगी।",
        icon: "/pwa-192x192.png",
        data: { url: "/" },
      });

      // Log subscription in analytics
      try {
        await supabase.from("analytics_events").insert({
          event_type: "push_notification_subscribed",
          session_id: crypto.randomUUID(),
          visitor_id: localStorage.getItem("nvm_visitor_id") || crypto.randomUUID(),
          visitor_key: "visitor_" + Date.now(),
          page_path: window.location.pathname,
          device_type: /mobile/i.test(navigator.userAgent) ? "mobile" : "desktop",
          browser: navigator.userAgent,
          occurred_at: new Date().toISOString(),
          metadata: {
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (err) {
        console.warn("Could not log push notification subscription to analytics:", err);
      }
    }
    
    return permission;
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return "denied";
  }
}

/**
 * Show a notification to the user
 */
export async function sendAppNotification(payload: NotificationPayload): Promise<boolean> {
  if (!isPushNotificationSupported() || Notification.permission !== "granted") {
    return false;
  }

  try {
    // Try via ServiceWorkerRegistration first (Best for Mobile / PWA)
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration && "showNotification" in registration) {
        await registration.showNotification(payload.title, {
          body: payload.body,
          icon: payload.icon || "/pwa-192x192.png",
          badge: payload.badge || "/pwa-64x64.png",
          data: payload.data || { url: "/" },
          vibrate: [200, 100, 200],
          tag: "nvm-announcement",
        } as NotificationOptions);
        return true;
      }
    }

    // Fallback to standard Notification
    new Notification(payload.title, {
      body: payload.body,
      icon: payload.icon || "/pwa-192x192.png",
      badge: payload.badge || "/pwa-64x64.png",
      data: payload.data || { url: "/" },
    });
    return true;
  } catch (err) {
    console.error("Failed to display notification:", err);
    return false;
  }
}
