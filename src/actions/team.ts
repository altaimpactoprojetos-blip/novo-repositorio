"use server";

import { z } from "zod";
import { authorize } from "@/lib/auth";
import type { ActionResult } from "@/lib/types";
import { dbError, refreshSite, removeStorageFiles, zodError } from "./_helpers";

const schema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2, "Informe o nome.").max(120),
  role: z.string().trim().max(160),
  bio: z.string().trim().max(1000),
  photo_url: z.string().trim().max(1000),
  is_published: z.boolean(),
});
export type TeamInput = z.input<typeof schema>;

export async function saveMember(input: TeamInput): Promise<ActionResult> {
  const auth = await authorize();
  if ("error" in auth) return { ok: false, error: auth.error };
  const parsed = schema.safeParse(input);
  if (!parsed.success) return zodError(parsed.error);
  const { id, ...v } = parsed.data;
  const row = { name: v.name, role: v.role || null, bio: v.bio || null, photo_url: v.photo_url || null, is_published: v.is_published };
  let error;
  if (id) ({ error } = await auth.supabase.from("mcv_team_members").update(row).eq("id", id));
  else {
    const { count } = await auth.supabase.from("mcv_team_members").select("id", { count: "exact", head: true });
    ({ error } = await auth.supabase.from("mcv_team_members").insert({ ...row, position: count ?? 0 }));
  }
  if (error) return dbError("team", error);
  refreshSite();
  return { ok: true, message: id ? "Membro atualizado!" : "Membro adicionado!" };
}

export async function deleteMember(id: string): Promise<ActionResult> {
  const auth = await authorize();
  if ("error" in auth) return { ok: false, error: auth.error };
  const { data } = await auth.supabase.from("mcv_team_members").select("photo_url").eq("id", id).maybeSingle();
  const { error } = await auth.supabase.from("mcv_team_members").delete().eq("id", id);
  if (error) return dbError("team-delete", error);
  await removeStorageFiles(auth.supabase, [data?.photo_url]);
  refreshSite();
  return { ok: true, message: "Membro removido." };
}

export async function reorderTeam(ids: string[]): Promise<ActionResult> {
  const auth = await authorize();
  if ("error" in auth) return { ok: false, error: auth.error };
  const res = await Promise.all(ids.map((id, position) => auth.supabase.from("mcv_team_members").update({ position }).eq("id", id)));
  const failed = res.find((r) => r.error);
  if (failed?.error) return dbError("team-order", failed.error);
  refreshSite();
  return { ok: true, message: "Ordem atualizada." };
}
