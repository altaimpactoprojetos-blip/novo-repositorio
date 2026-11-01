"use server";

import { z } from "zod";
import { authorize } from "@/lib/auth";
import type { ActionResult } from "@/lib/types";
import { slugify } from "@/lib/utils";
import { dbError, refreshSite, removeStorageFiles, zodError } from "./_helpers";

const albumSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(2, "Informe o título do álbum.").max(160),
  slug: z.string().trim().max(80).optional(),
  description: z.string().trim().max(3000),
  album_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe a data."),
  event_id: z.string().uuid().or(z.literal("")),
  cover_url: z.string().trim().max(1000),
  is_published: z.boolean(),
});
export type AlbumInput = z.input<typeof albumSchema>;

export async function saveAlbum(input: AlbumInput): Promise<ActionResult<{ id: string }>> {
  const auth = await authorize();
  if ("error" in auth) return { ok: false, error: auth.error };
  const parsed = albumSchema.safeParse(input);
  if (!parsed.success) return zodError(parsed.error);
  const v = parsed.data;
  const row = {
    title: v.title,
    slug: slugify(v.slug || v.title) || `album-${Date.now()}`,
    description: v.description || null,
    album_date: v.album_date,
    event_id: v.event_id || null,
    is_published: v.is_published,
  };
  // A capa é definida pela galeria (estrela); só é gravada aqui na criação.
  const q = v.id
    ? auth.supabase.from("mcv_albums").update(row).eq("id", v.id).select("id").single()
    : auth.supabase
        .from("mcv_albums")
        .insert({ ...row, cover_url: v.cover_url || null })
        .select("id")
        .single();
  const { data, error } = await q;
  if (error) return dbError("album", error);
  refreshSite();
  return { ok: true, message: v.id ? "Álbum atualizado!" : "Álbum criado! Agora envie as fotos.", data: { id: data.id } };
}

export async function setAlbumPublished(id: string, value: boolean): Promise<ActionResult> {
  const auth = await authorize();
  if ("error" in auth) return { ok: false, error: auth.error };
  const { error } = await auth.supabase.from("mcv_albums").update({ is_published: value }).eq("id", id);
  if (error) return dbError("album-pub", error);
  refreshSite();
  return { ok: true, message: value ? "Álbum publicado." : "Álbum ocultado do site." };
}

export async function deleteAlbum(id: string): Promise<ActionResult> {
  const auth = await authorize();
  if ("error" in auth) return { ok: false, error: auth.error };
  const { data: photos } = await auth.supabase.from("mcv_photos").select("url").eq("album_id", id);
  const { data: album } = await auth.supabase.from("mcv_albums").select("cover_url").eq("id", id).maybeSingle();
  const { error } = await auth.supabase.from("mcv_albums").delete().eq("id", id);
  if (error) return dbError("album-delete", error);
  const urls = (photos ?? []).map((p) => p.url);
  if (album?.cover_url && !urls.includes(album.cover_url)) urls.push(album.cover_url);
  await removeStorageFiles(auth.supabase, urls);
  refreshSite();
  return { ok: true, message: "Álbum e fotos excluídos." };
}

const photosSchema = z
  .array(z.object({ url: z.string().url().max(1000), width: z.number().int().positive().nullable(), height: z.number().int().positive().nullable() }))
  .min(1)
  .max(200);

export async function addPhotos(albumId: string, photos: z.input<typeof photosSchema>): Promise<ActionResult<{ count: number }>> {
  const auth = await authorize();
  if ("error" in auth) return { ok: false, error: auth.error };
  const parsed = photosSchema.safeParse(photos);
  if (!parsed.success) return zodError(parsed.error);
  const { data: last } = await auth.supabase
    .from("mcv_photos")
    .select("position")
    .eq("album_id", albumId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const base = (last?.position ?? -1) + 1;
  const rows = parsed.data.map((p, i) => ({ album_id: albumId, url: p.url, width: p.width, height: p.height, position: base + i }));
  const { error } = await auth.supabase.from("mcv_photos").insert(rows);
  if (error) return dbError("photos-add", error);
  refreshSite();
  return { ok: true, message: `${rows.length} ${rows.length === 1 ? "foto adicionada" : "fotos adicionadas"}!`, data: { count: rows.length } };
}

export async function updatePhotoCaption(id: string, caption: string): Promise<ActionResult> {
  const auth = await authorize();
  if ("error" in auth) return { ok: false, error: auth.error };
  const { error } = await auth.supabase
    .from("mcv_photos")
    .update({ caption: caption.trim().slice(0, 500) || null })
    .eq("id", id);
  if (error) return dbError("photo-caption", error);
  refreshSite();
  return { ok: true, message: "Legenda salva." };
}

export async function deletePhotos(ids: string[]): Promise<ActionResult> {
  const auth = await authorize();
  if ("error" in auth) return { ok: false, error: auth.error };
  if (!ids.length) return { ok: false, error: "Nenhuma foto selecionada." };
  const { data } = await auth.supabase.from("mcv_photos").select("url").in("id", ids);
  const { error } = await auth.supabase.from("mcv_photos").delete().in("id", ids);
  if (error) return dbError("photo-delete", error);
  const urls = (data ?? []).map((p) => p.url);
  if (urls.length) await auth.supabase.from("mcv_albums").update({ cover_url: null }).in("cover_url", urls);
  await removeStorageFiles(auth.supabase, urls);
  refreshSite();
  return { ok: true, message: ids.length === 1 ? "Foto excluída." : `${ids.length} fotos excluídas.` };
}

export async function reorderPhotos(albumId: string, ids: string[]): Promise<ActionResult> {
  const auth = await authorize();
  if ("error" in auth) return { ok: false, error: auth.error };
  const results = await Promise.all(ids.map((id, position) => auth.supabase.from("mcv_photos").update({ position }).eq("id", id).eq("album_id", albumId)));
  const failed = results.find((r) => r.error);
  if (failed?.error) return dbError("photo-order", failed.error);
  refreshSite();
  return { ok: true, message: "Ordem salva." };
}

export async function setAlbumCover(albumId: string, url: string): Promise<ActionResult> {
  const auth = await authorize();
  if ("error" in auth) return { ok: false, error: auth.error };
  const { error } = await auth.supabase.from("mcv_albums").update({ cover_url: url }).eq("id", albumId);
  if (error) return dbError("album-cover", error);
  refreshSite();
  return { ok: true, message: "Foto de capa definida." };
}
