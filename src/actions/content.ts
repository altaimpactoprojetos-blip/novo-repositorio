"use server";

import { authorize } from "@/lib/auth";
import { CONTENT_KEYS, defaultContent, type ContentKey } from "@/lib/content";
import type { ActionResult } from "@/lib/types";
import { dbError, refreshSite } from "./_helpers";

function clean(s: unknown, max = 20000) {
  return typeof s === "string" ? s.trim().slice(0, max) : "";
}

export async function saveContent(key: ContentKey, data: Record<string, unknown>): Promise<ActionResult> {
  const auth = await authorize();
  if ("error" in auth) return { ok: false, error: auth.error };
  if (!CONTENT_KEYS.includes(key)) return { ok: false, error: "Seção inválida." };

  const base = defaultContent[key] as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  const fieldErrors: Record<string, string> = {};

  for (const field of Object.keys(base)) {
    const value = data[field];
    if (Array.isArray(base[field])) {
      out[field] = (Array.isArray(value) ? value : [])
        .slice(0, 24)
        .map((item) => ({ title: clean((item as { title?: unknown })?.title, 120), text: clean((item as { text?: unknown })?.text, 600) }))
        .filter((i) => i.title);
      continue;
    }
    const v = clean(value);
    if (v && /_url$/.test(field) && !/^https:\/\//i.test(v)) fieldErrors[field] = "O link deve começar com https://";
    if (v && field === "map_embed_url" && !/^https:\/\/(www\.)?google\.[a-z.]+\/maps\/embed/.test(v))
      fieldErrors[field] = "Use o link de incorporação do Google Maps (google.com/maps/embed...).";
    if (v && field === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) fieldErrors[field] = "E-mail inválido.";
    out[field] = v;
  }

  if (Object.keys(fieldErrors).length) return { ok: false, error: "Confira os campos destacados.", fieldErrors };

  const { error } = await auth.supabase.from("mcv_site_content").upsert({ key, data: out, updated_by: auth.session.userId }, { onConflict: "key" });
  if (error) return dbError("content", error);
  refreshSite();
  return { ok: true, message: "Conteúdo salvo e publicado no site!" };
}
