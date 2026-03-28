import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import PageRouteAndGlobalVideos from "./PageRouteAndGlobalVideos";
import { useEffect } from "react";
import { AnalyticsConsentProvider } from "@/contexts/AnalyticsConsentContext";
import AnalyticsProvider from "@/components/analytics/AnalyticsProvider";
import CookieConsentBanner from "@/components/analytics/CookieConsentBanner";

export default function PublicLayout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [location.pathname]);

  return (
    <AnalyticsConsentProvider>
      <AnalyticsProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1 pt-[calc(4rem+env(safe-area-inset-top,0px))]">
            <Outlet />
            <PageRouteAndGlobalVideos />
          </main>
          <Footer />
        </div>
      </AnalyticsProvider>
      <CookieConsentBanner />
    </AnalyticsConsentProvider>
  );
}
