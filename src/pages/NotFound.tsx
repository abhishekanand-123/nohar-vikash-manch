import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import SEO from "@/components/common/SEO";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <SEO
        title="404 — पृष्ठ उपलब्ध नहीं है (Page Not Found)"
        description="क्षमा करें, आपके द्वारा खोजा गया पेज उपलब्ध नहीं है या हटा दिया गया है।"
      />
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
