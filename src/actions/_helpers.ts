import "server-only";
import { revalidatePath } from "next/cache";
import type { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { MEDIA_BUCKET } from "@/lib/supabase/config";

export function zodError(error: z.ZodError) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) fieldErrors[issue.path.join(".")] ??= issue.message;
  const first = error.issues[0];
  return { ok: false as const, error: first ? first.message : "Dados inválidos.", fieldErrors };
}

export function dbError(scope: string, error: { message: string; code?: string }) {
  console.error(`[admin:${scope}]`, error.message);
  if (error.code === "23505") return { ok: false as const, error: "Já existe um registro com este endereço (slug). Altere o título ou o slug." };
  if (error.code === "42501") return { ok: false as const, error: "Sem permissão para esta ação." };
  return { ok: false as const, error: "Não foi possível salvar. Tente novamente." };
}

/** Atualiza as páginas públicas imediatamente após qualquer alteração. */
export function refreshSite() {
  revalidatePath("/", "layout");
}

/** Extrai o caminho do arquivo no bucket a partir da URL pública. */
export function storagePathFromUrl(url: string | null | undefined) {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${MEDIA_BUCKET}/`;
  const i = url.indexOf(marker);
  return i >= 0 ? decodeURIComponent(url.slice(i + marker.length).split("?")[0]) : null;
}

export async function removeStorageFiles(supabase: SupabaseClient, urls: (string | null | undefined)[]) {
  const paths = urls.map(storagePathFromUrl).filter((p): p is string => Boolean(p));
  if (!paths.length) return;
  for (let i = 0; i < paths.length; i += 100) {
    const { error } = await supabase.storage.from(MEDIA_BUCKET).remove(paths.slice(i, i + 100));
    if (error) console.error("[storage:remove]", error.message);
  }
}

export const optionalText =
  (max = 5000) =>
  (v: unknown) =>
    typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;
