import { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FileText, Users, Image, Calendar, Heart, LogOut, Menu, X } from "lucide-react";

const sidebarLinks = [
  { to: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/blogs", label: "Blog Posts", icon: FileText },
  { to: "/admin/members", label: "Members", icon: Users },
  { to: "/admin/gallery", label: "Gallery", icon: Image },
  { to: "/admin/events", label: "Events", icon: Calendar },
  { to: "/admin/donations", label: "Donations", icon: Heart },
];

const stats = [
  { label: "Blog Posts", value: "5", icon: FileText },
  { label: "Members", value: "10", icon: Users },
  { label: "Events", value: "3", icon: Calendar },
  { label: "Gallery Items", value: "8", icon: Image },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("nohar_admin")) {
      navigate("/admin/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("nohar_admin");
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-[280px] bg-sidebar text-sidebar-foreground flex flex-col transform transition-transform duration-200 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        <div className="p-6 border-b border-sidebar-border">
          <h2 className="font-display font-bold text-lg text-sidebar-primary-foreground">
            Nohar<span className="text-accent">Admin</span>
          </h2>
        </div>
        <nav className="flex-1 p-4 space-y-1">
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
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-card">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-secondary">
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-display font-semibold text-lg text-foreground">Dashboard Overview</h1>
          <Link to="/" className="text-sm text-primary hover:underline">View Site</Link>
        </header>

        <main className="flex-1 p-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((s) => (
              <div key={s.label} className="bg-card rounded-xl p-6 shadow-card ring-1 ring-border">
                <div className="flex items-center justify-between mb-3">
                  <s.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="font-display text-3xl font-bold text-foreground">{s.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="bg-card rounded-xl p-8 shadow-card ring-1 ring-border text-center">
            <p className="text-muted-foreground">
              Welcome to the NoharVikashManch Admin Dashboard. Use the sidebar to manage content.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Connect Lovable Cloud to enable full CRUD operations with database, authentication, and file storage.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
