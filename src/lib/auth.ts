import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/config";
import type { AdminUserRow } from "./types";

export type AdminSession = {
  userId: string;
  email: string;
  admin: AdminUserRow | null;
};

/** Usuário logado + registro em admin_users (validado no servidor de Auth). */
export const getSession = cache(async (): Promise<AdminSession | null> => {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  const { data: admin } = await supabase.from("mcv_admin_users").select("*").eq("user_id", data.user.id).maybeSingle();
  return { userId: data.user.id, email: data.user.email ?? "", admin: (admin as AdminUserRow) ?? null };
});

/** Para páginas do painel: exige login e permissão; redireciona caso contrário. */
export async function requireAdmin(role?: "admin") {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!session.admin) redirect("/admin/login?erro=sem-permissao");
  if (role === "admin" && session.admin.role !== "admin") redirect("/admin?erro=sem-permissao");
  return session as AdminSession & { admin: AdminUserRow };
}

/** Para Server Actions: devolve o cliente autenticado ou um erro amigável. */
type Authorized = { supabase: Awaited<ReturnType<typeof createClient>>; session: AdminSession & { admin: AdminUserRow } };

export async function authorize(role?: "admin"): Promise<Authorized | { error: string }> {
  const session = await getSession();
  if (!session?.admin) return { error: "Sessão expirada ou sem permissão. Entre novamente." };
  if (role === "admin" && session.admin.role !== "admin") return { error: "Apenas administradoras principais podem fazer isso." };
  const supabase = await createClient();
  return { supabase, session: session as AdminSession & { admin: AdminUserRow } };
}
