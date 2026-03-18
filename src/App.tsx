import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import PublicLayout from "@/components/layout/PublicLayout";
import Index from "./pages/Index";
import About from "./pages/About";
import Festivals from "./pages/Festivals";
import Ramnavami from "./pages/Ramnavami";
import Sports from "./pages/Sports";
import Gallery from "./pages/Gallery";
import Donation from "./pages/Donation";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/festivals" element={<Festivals />} />
            <Route path="/ramnavami" element={<Ramnavami />} />
            <Route path="/sports" element={<Sports />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/donation" element={<Donation />} />
          </Route>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/blogs" element={<AdminDashboard />} />
          <Route path="/admin/members" element={<AdminDashboard />} />
          <Route path="/admin/gallery" element={<AdminDashboard />} />
          <Route path="/admin/events" element={<AdminDashboard />} />
          <Route path="/admin/donations" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
