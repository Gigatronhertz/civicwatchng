import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type StaffRole = "admin" | "officer" | null;

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<StaffRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadRole = (userId: string) => {
      void supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .order("role", { ascending: true })
        .then(({ data }) => {
          if (!active) return;
          const roles = (data ?? []).map((r) => r.role as Exclude<StaffRole, null>);
          setRole(roles.includes("admin") ? "admin" : (roles[0] ?? null));
          setLoading(false);
        });
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      if (nextSession?.user) {
        loadRole(nextSession.user.id);
      } else {
        setRole(null);
        setLoading(false);
      }
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        loadRole(data.session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { session, user, role, isStaff: role !== null, loading };
}
