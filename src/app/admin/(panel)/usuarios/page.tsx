import { PageHeader } from "@/components/admin/page-header";
import { UsersManager } from "@/components/admin/users-manager";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { AdminUserRow } from "@/lib/types";

export const metadata = { title: "Usuários e acesso" };

export default async function UsersPage() {
  const session = await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase.from("mcv_admin_users").select("*").order("created_at");
  return (
    <>
      <PageHeader title="Usuários e acesso" description="Gerencie quem pode entrar no painel e altere a sua senha." />
      <UsersManager
        users={(data ?? []) as AdminUserRow[]}
        currentId={session.userId}
        isSuper={session.admin.role === "admin"}
        currentName={session.admin.name ?? ""}
      />
    </>
  );
}
