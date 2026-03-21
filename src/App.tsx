import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import PublicLayout from "@/components/layout/PublicLayout";
import AdminLayout from "@/components/admin/AdminLayout";
import Index from "./pages/Index";
import About from "./pages/About";
import Festivals from "./pages/Festivals";
import FestivalDetails from "./pages/FestivalDetails";
import Ramnavami from "./pages/Ramnavami";
import Sports from "./pages/Sports";
import Gallery from "./pages/Gallery";
import Donation from "./pages/Donation";
import AdminLogin from "./pages/admin/Login";
import AdminOverview from "./pages/admin/Overview";
import ManageMembers from "./pages/admin/ManageMembers";
import ManageBlogs from "./pages/admin/ManageBlogs";
import ManageGallery from "./pages/admin/ManageGallery";
import ManageEvents from "./pages/admin/ManageEvents";
import ManageDonations from "./pages/admin/ManageDonations";
import ManageSports from "./pages/admin/ManageSports";
import ManageBanners from "./pages/admin/ManageBanners";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/festivals" element={<Festivals />} />
              <Route path="/festivals/:id" element={<FestivalDetails />} />
              <Route path="/ramnavami" element={<Ramnavami />} />
              <Route path="/sports" element={<Sports />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/donation" element={<Donation />} />
            </Route>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminOverview />} />
              <Route path="/admin/blogs" element={<ManageBlogs />} />
              <Route path="/admin/members" element={<ManageMembers />} />
              <Route path="/admin/gallery" element={<ManageGallery />} />
              <Route path="/admin/events" element={<ManageEvents />} />
              <Route path="/admin/sports" element={<ManageSports />} />
              <Route path="/admin/banners" element={<ManageBanners />} />
              <Route path="/admin/donations" element={<ManageDonations />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
