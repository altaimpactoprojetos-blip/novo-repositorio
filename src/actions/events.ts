"use server";

import { z } from "zod";
import { authorize } from "@/lib/auth";
import type { ActionResult } from "@/lib/types";
import { fromLocalInput, slugify } from "@/lib/utils";
import { dbError, refreshSite, removeStorageFiles, zodError } from "./_helpers";

const url = z.string().trim().url("Informe um link válido (começando com https://).").max(1000).or(z.literal(""));

const eventSchema = z
  .object({
    id: z.string().uuid().optional(),
    title: z.string().trim().min(2, "Informe o nome do evento.").max(160),
    slug: z.string().trim().max(80).optional(),
    subtitle: z.string().trim().max(300),
    description: z.string().trim().max(20000),
    banner_url: z.string().trim().max(1000),
    start_at: z.string().min(1, "Informe a data e o horário de início."),
    end_at: z.string(),
    location_name: z.string().trim().max(200),
    address: z.string().trim().max(400),
    map_url: url,
    schedule: z
      .array(z.object({ time: z.string().trim().max(40), title: z.string().trim().max(200), description: z.string().trim().max(1000).optional() }))
      .max(60),
    additional_info: z.string().trim().max(10000),
    price: z.string().trim().max(120),
    registration_url: url,
    whatsapp_message: z.string().trim().max(500),
    is_published: z.boolean(),
    is_finished: z.boolean(),
    is_featured: z.boolean(),
  })
  .superRefine((v, ctx) => {
    const s = fromLocalInput(v.start_at);
    const e = fromLocalInput(v.end_at);
    if (!s) ctx.addIssue({ code: "custom", path: ["start_at"], message: "Data de início inválida." });
    if (v.end_at && !e) ctx.addIssue({ code: "custom", path: ["end_at"], message: "Data de término inválida." });
    if (s && e && e < s) ctx.addIssue({ code: "custom", path: ["end_at"], message: "O término deve ser depois do início." });
  });

export type EventInput = z.input<typeof eventSchema>;

const nil = (v: string) => (v ? v : null);

export async function saveEvent(input: EventInput): Promise<ActionResult<{ id: string }>> {
  const auth = await authorize();
  if ("error" in auth) return { ok: false, error: auth.error };
  const parsed = eventSchema.safeParse(input);
  if (!parsed.success) return zodError(parsed.error);
  const v = parsed.data;

  const row = {
    title: v.title,
    slug: slugify(v.slug || v.title) || `evento-${Date.now()}`,
    subtitle: nil(v.subtitle),
    description: nil(v.description),
    banner_url: nil(v.banner_url),
    start_at: fromLocalInput(v.start_at)!,
    end_at: fromLocalInput(v.end_at),
    location_name: nil(v.location_name),
    address: nil(v.address),
    map_url: nil(v.map_url),
    schedule: v.schedule.filter((s) => s.title),
    additional_info: nil(v.additional_info),
    price: nil(v.price),
    registration_url: nil(v.registration_url),
    whatsapp_message: nil(v.whatsapp_message),
    is_published: v.is_published,
    is_finished: v.is_finished,
    is_featured: v.is_featured,
  };

  const q = v.id
    ? auth.supabase.from("mcv_events").update(row).eq("id", v.id).select("id").single()
    : auth.supabase.from("mcv_events").insert(row).select("id").single();
  const { data, error } = await q;
  if (error) return dbError("event", error);
  refreshSite();
  return { ok: true, message: v.id ? "Evento atualizado!" : "Evento criado!", data: { id: data.id } };
}

export async function setEventFlag(id: string, flag: "is_published" | "is_finished" | "is_featured", value: boolean): Promise<ActionResult> {
  const auth = await authorize();
  if ("error" in auth) return { ok: false, error: auth.error };
  if (!["is_published", "is_finished", "is_featured"].includes(flag)) return { ok: false, error: "Campo inválido." };
  const { error } = await auth.supabase
    .from("mcv_events")
    .update({ [flag]: value })
    .eq("id", id);
  if (error) return dbError("event-flag", error);
  refreshSite();
  const msg = {
    is_published: value ? "Evento publicado no site." : "Evento ocultado do site.",
    is_finished: value ? "Evento marcado como realizado." : "Evento reaberto.",
    is_featured: value ? "Evento destacado." : "Destaque removido.",
  }[flag];
  return { ok: true, message: msg };
}

export async function deleteEvent(id: string): Promise<ActionResult> {
  const auth = await authorize();
  if ("error" in auth) return { ok: false, error: auth.error };
  const { data } = await auth.supabase.from("mcv_events").select("banner_url").eq("id", id).maybeSingle();
  const { error } = await auth.supabase.from("mcv_events").delete().eq("id", id);
  if (error) return dbError("event-delete", error);
  await removeStorageFiles(auth.supabase, [data?.banner_url]);
  refreshSite();
  return { ok: true, message: "Evento excluído." };
}
