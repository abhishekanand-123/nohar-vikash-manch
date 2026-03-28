import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import PageRouteAndGlobalVideos from "./PageRouteAndGlobalVideos";
import { useEffect } from "react";

export default function PublicLayout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-[calc(4rem+env(safe-area-inset-top,0px))]">
        <Outlet />
        <PageRouteAndGlobalVideos />
      </main>
      <Footer />
    </div>
  );
}
