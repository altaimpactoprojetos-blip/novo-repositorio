import { PageHeader } from "@/components/admin/page-header";
import { TeamManager } from "@/components/admin/team-manager";
import { createClient } from "@/lib/supabase/server";
import type { TeamMemberRow } from "@/lib/types";

export const metadata = { title: "Equipe" };

export default async function TeamPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("mcv_team_members").select("*").order("position").order("created_at");
  return (
    <>
      <PageHeader
        title="Equipe"
        description="Fotos e nomes da equipe exibidos na página Sobre nós. A foto e o texto da idealizadora ficam em Conteúdo do site → Sobre nós."
      />
      <TeamManager members={(data ?? []) as TeamMemberRow[]} />
    </>
  );
}
