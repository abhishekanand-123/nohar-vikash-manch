import { useEffect, useState } from "react";
import { useNavigate, Link, useLocation, Outlet } from "react-router-dom";
import { LayoutDashboard, FileText, Users, Image, Calendar, Heart, LogOut, Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const sidebarLinks = [
  { to: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/blogs", label: "Blog Posts", icon: FileText },
  { to: "/admin/members", label: "Members", icon: Users },
  { to: "/admin/gallery", label: "Gallery", icon: Image },
  { to: "/admin/events", label: "Events", icon: Calendar },
  { to: "/admin/donations", label: "Donations", icon: Heart },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAdmin, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/admin/login");
    }
  }, [loading, user, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-background">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-[260px] bg-sidebar text-sidebar-foreground flex flex-col transform transition-transform duration-200 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        <div className="p-6 border-b border-sidebar-border">
          <h2 className="font-display font-bold text-lg text-sidebar-primary-foreground">
            Nohar<span className="text-accent">Admin</span>
          </h2>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/50 mb-2 px-4 truncate">{user.email}</p>
          {!isAdmin && <p className="text-xs text-destructive px-4 mb-2">Not admin — read-only access</p>}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-card">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-secondary">
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-display font-semibold text-lg text-foreground">Admin Dashboard</h1>
          <Link to="/" className="text-sm text-primary hover:underline">View Site</Link>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
