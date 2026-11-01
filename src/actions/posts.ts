"use server";

import { z } from "zod";
import { authorize } from "@/lib/auth";
import type { ActionResult } from "@/lib/types";
import { fromLocalInput, slugify } from "@/lib/utils";
import { dbError, refreshSite, removeStorageFiles, zodError } from "./_helpers";

const postSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.enum(["testemunho", "historia", "mensagem", "reflexao", "video"]),
  title: z.string().trim().min(2, "Informe o título.").max(200),
  slug: z.string().trim().max(80).optional(),
  excerpt: z.string().trim().max(600),
  content: z.string().trim().max(30000),
  author_name: z.string().trim().max(120),
  author_role: z.string().trim().max(160),
  image_url: z.string().trim().max(1000),
  video_url: z.string().trim().url("Informe um link de vídeo válido.").max(1000).or(z.literal("")),
  is_published: z.boolean(),
  is_featured: z.boolean(),
  published_at: z.string(),
});
export type PostInput = z.input<typeof postSchema>;

export async function savePost(input: PostInput): Promise<ActionResult<{ id: string }>> {
  const auth = await authorize();
  if ("error" in auth) return { ok: false, error: auth.error };
  const parsed = postSchema.safeParse(input);
  if (!parsed.success) return zodError(parsed.error);
  const v = parsed.data;
  if (v.type === "video" && !v.video_url) return { ok: false, error: "Informe o link do vídeo.", fieldErrors: { video_url: "Obrigatório para vídeos." } };
  const row = {
    type: v.type,
    title: v.title,
    slug: slugify(v.slug || v.title) || `post-${Date.now()}`,
    excerpt: v.excerpt || null,
    content: v.content || null,
    author_name: v.author_name || null,
    author_role: v.author_role || null,
    image_url: v.image_url || null,
    video_url: v.video_url || null,
    is_published: v.is_published,
    is_featured: v.is_featured,
    published_at: fromLocalInput(v.published_at) ?? new Date().toISOString(),
  };
  const q = v.id
    ? auth.supabase.from("mcv_posts").update(row).eq("id", v.id).select("id").single()
    : auth.supabase.from("mcv_posts").insert(row).select("id").single();
  const { data, error } = await q;
  if (error) return dbError("post", error);
  refreshSite();
  return { ok: true, message: v.id ? "Publicação atualizada!" : "Publicação criada!", data: { id: data.id } };
}

export async function setPostFlag(id: string, flag: "is_published" | "is_featured", value: boolean): Promise<ActionResult> {
  const auth = await authorize();
  if ("error" in auth) return { ok: false, error: auth.error };
  if (flag !== "is_published" && flag !== "is_featured") return { ok: false, error: "Campo inválido." };
  const { error } = await auth.supabase
    .from("mcv_posts")
    .update({ [flag]: value })
    .eq("id", id);
  if (error) return dbError("post-flag", error);
  refreshSite();
  return {
    ok: true,
    message: flag === "is_published" ? (value ? "Publicado no site." : "Ocultado do site.") : value ? "Destacado na página inicial." : "Destaque removido.",
  };
}

export async function deletePost(id: string): Promise<ActionResult> {
  const auth = await authorize();
  if ("error" in auth) return { ok: false, error: auth.error };
  const { data } = await auth.supabase.from("mcv_posts").select("image_url").eq("id", id).maybeSingle();
  const { error } = await auth.supabase.from("mcv_posts").delete().eq("id", id);
  if (error) return dbError("post-delete", error);
  await removeStorageFiles(auth.supabase, [data?.image_url]);
  refreshSite();
  return { ok: true, message: "Publicação excluída." };
}
