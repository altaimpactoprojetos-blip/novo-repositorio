"use server";

import { revalidatePath } from "next/cache";
import { authorize } from "@/lib/auth";
import type { ActionResult } from "@/lib/types";
import { dbError } from "./_helpers";

export async function setMessageRead(id: string, value: boolean): Promise<ActionResult> {
  const auth = await authorize();
  if ("error" in auth) return { ok: false, error: auth.error };
  const { error } = await auth.supabase.from("mcv_contact_messages").update({ is_read: value }).eq("id", id);
  if (error) return dbError("msg-read", error);
  revalidatePath("/admin", "layout");
  return { ok: true, message: value ? "Marcada como lida." : "Marcada como não lida." };
}

export async function deleteMessage(id: string): Promise<ActionResult> {
  const auth = await authorize();
  if ("error" in auth) return { ok: false, error: auth.error };
  const { error } = await auth.supabase.from("mcv_contact_messages").delete().eq("id", id);
  if (error) return dbError("msg-delete", error);
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Mensagem excluída." };
}
