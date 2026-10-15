import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isEditor: boolean;
  role: "admin" | "editor" | "user" | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditor, setIsEditor] = useState(false);
  const [role, setRole] = useState<"admin" | "editor" | "user" | null>(null);
  const [loading, setLoading] = useState(true);

  const checkRoles = async (userId: string) => {
    try {
      // 1. Direct table query (allowed by own user policy)
      const { data: userRoles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      const roles = (userRoles ?? []).map((r: any) => String(r.role).toLowerCase());
      let hasAdmin = roles.includes("admin");
      let hasEditor = roles.includes("editor");

      // 2. Fallback to RPC if table query didn't find them
      if (!hasAdmin) {
        const { data: adminRpc } = await supabase.rpc("has_role", {
          _user_id: userId,
          _role: "admin",
        });
        if (adminRpc) hasAdmin = true;
      }

      if (!hasEditor) {
        const { data: editorRpc } = await supabase.rpc("has_role", {
          _user_id: userId,
          _role: "editor",
        });
        if (editorRpc) hasEditor = true;
      }

      setIsAdmin(hasAdmin);
      setIsEditor(hasEditor);
      if (hasAdmin) {
        setRole("admin");
      } else if (hasEditor) {
        setRole("editor");
      } else {
        setRole("user");
      }
    } catch (err) {
      console.error("Error checking roles:", err);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => checkRoles(session.user.id), 0);
        } else {
          setIsAdmin(false);
          setIsEditor(false);
          setRole(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkRoles(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, name?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setIsEditor(false);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAdmin,
        isEditor,
        role,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
