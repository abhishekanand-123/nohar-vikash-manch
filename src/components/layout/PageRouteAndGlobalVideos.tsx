import { useLocation } from "react-router-dom";
import ManagedVideosSection from "@/components/common/ManagedVideosSection";
import { pathnameToVideoPageKey } from "@/lib/page-video-routes";

/**
 * Page-scoped videos (admin: placement "Specific page") and videos shown on every route (placement "All pages").
 */
export default function PageRouteAndGlobalVideos() {
  const { pathname } = useLocation();
  const pageKey = pathnameToVideoPageKey(pathname);

  return (
    <>
      {pageKey && <ManagedVideosSection placement="page" pageKey={pageKey} heading="Videos" />}
      <ManagedVideosSection placement="global" heading="Featured videos" />
    </>
  );
}
