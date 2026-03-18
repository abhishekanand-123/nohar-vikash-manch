import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login — will be replaced with Supabase auth
    if (email === "admin@nohar.com" && password === "admin123") {
      localStorage.setItem("nohar_admin", "true");
      navigate("/admin/dashboard");
    } else {
      setError("Invalid credentials. Try admin@nohar.com / admin123");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-card rounded-2xl p-8 shadow-card ring-1 ring-border">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Lock className="w-6 h-6 text-primary" />
            </div>
          </div>
          <h1 className="font-display font-bold text-2xl text-center mb-2 text-foreground">Admin Login</h1>
          <p className="text-sm text-muted-foreground text-center mb-6">NoharVikashManch Dashboard</p>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg p-3 mb-4 text-center">{error}</p>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-background border border-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="admin@nohar.com"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-background border border-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Sign In
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-4">
          Demo: admin@nohar.com / admin123
        </p>
      </motion.div>
    </div>
  );
}
