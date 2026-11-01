"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authorize } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import type { ActionResult } from "@/lib/types";
import { dbError, zodError } from "./_helpers";

const createSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome.").max(120),
  email: z.string().trim().toLowerCase().email("E-mail inválido."),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres.").max(72),
  role: z.enum(["admin", "editor"]),
});

export async function createAdminUser(input: z.input<typeof createSchema>): Promise<ActionResult> {
  const auth = await authorize("admin");
  if ("error" in auth) return { ok: false, error: auth.error };
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return zodError(parsed.error);
  const service = createServiceClient();
  if (!service) return { ok: false, error: "Configure SUPABASE_SERVICE_ROLE_KEY no servidor para criar usuários pelo painel." };
  const { name, email, password, role } = parsed.data;

  let userId: string | undefined;
  const { data: created, error } = await service.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { name } });
  if (error) {
    if (!/already|registered|exists/i.test(error.message)) return { ok: false, error: `Não foi possível criar o usuário: ${error.message}` };
    // Usuário já existe no Auth: apenas concede acesso ao painel
    const { data: list } = await service.auth.admin.listUsers({ perPage: 1000 });
    userId = list?.users.find((u) => u.email?.toLowerCase() === email)?.id;
    if (!userId) return { ok: false, error: "Este e-mail já está cadastrado, mas não foi possível localizá-lo." };
  } else userId = created.user?.id;

  const { error: e2 } = await service.from("mcv_admin_users").upsert({ user_id: userId, email, name, role }, { onConflict: "user_id" });
  if (e2) return dbError("admin-create", e2);
  revalidatePath("/admin/usuarios");
  return { ok: true, message: `Acesso criado para ${email}.` };
}

export async function updateAdminRole(userId: string, role: "admin" | "editor"): Promise<ActionResult> {
  const auth = await authorize("admin");
  if ("error" in auth) return { ok: false, error: auth.error };
  if (userId === auth.session.userId) return { ok: false, error: "Você não pode alterar a sua própria permissão." };
  if (role !== "admin" && role !== "editor") return { ok: false, error: "Permissão inválida." };
  const { error } = await auth.supabase.from("mcv_admin_users").update({ role }).eq("user_id", userId);
  if (error) return dbError("admin-role", error);
  revalidatePath("/admin/usuarios");
  return { ok: true, message: "Permissão atualizada." };
}

export async function removeAdminUser(userId: string): Promise<ActionResult> {
  const auth = await authorize("admin");
  if ("error" in auth) return { ok: false, error: auth.error };
  if (userId === auth.session.userId) return { ok: false, error: "Você não pode remover o seu próprio acesso." };
  const { error } = await auth.supabase.from("mcv_admin_users").delete().eq("user_id", userId);
  if (error) return dbError("admin-remove", error);
  const service = createServiceClient();
  if (service) await service.auth.admin.deleteUser(userId);
  revalidatePath("/admin/usuarios");
  return { ok: true, message: "Acesso removido." };
}

const pwSchema = z
  .object({ password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres.").max(72), confirm: z.string() })
  .refine((v) => v.password === v.confirm, { message: "As senhas não conferem.", path: ["confirm"] });

export async function changeOwnPassword(input: z.input<typeof pwSchema>): Promise<ActionResult> {
  const auth = await authorize();
  if ("error" in auth) return { ok: false, error: auth.error };
  const parsed = pwSchema.safeParse(input);
  if (!parsed.success) return zodError(parsed.error);
  const { error } = await auth.supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { ok: false, error: `Não foi possível alterar a senha: ${error.message}` };
  return { ok: true, message: "Senha alterada com sucesso!" };
}

export async function updateOwnName(name: string): Promise<ActionResult> {
  const auth = await authorize();
  if ("error" in auth) return { ok: false, error: auth.error };
  const n = name.trim().slice(0, 120);
  if (n.length < 2) return { ok: false, error: "Informe o nome." };
  // admin_users só pode ser alterado por super admin via RLS; usamos service role apenas para o próprio registro
  const service = createServiceClient();
  const client = service ?? auth.supabase;
  const { error } = await client.from("mcv_admin_users").update({ name: n }).eq("user_id", auth.session.userId);
  if (error) return dbError("admin-name", error);
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Nome atualizado." };
}
