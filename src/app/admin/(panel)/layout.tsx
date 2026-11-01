import { AdminSidebar } from "@/components/admin/sidebar";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  const supabase = await createClient();
  const { count } = await supabase.from("mcv_contact_messages").select("id", { count: "exact", head: true }).eq("is_read", false);

  return (
    <div className="min-h-dvh bg-[#f8f4f1]">
      <AdminSidebar name={session.admin.name ?? ""} email={session.email} role={session.admin.role} unread={count ?? 0} />
      <div className="lg:pl-72">
        <main className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-12">{children}</main>
      </div>
    </div>
  );
}
