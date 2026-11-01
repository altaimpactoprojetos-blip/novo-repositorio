"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { createPublicClient } from "@/lib/supabase/public";

export type ContactState = { ok: boolean; message: string; fieldErrors?: Record<string, string> } | null;

const schema = z.object({
  name: z.string().trim().min(2, "Informe seu nome.").max(120),
  email: z.string().trim().email("Informe um e-mail válido.").max(160),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  subject: z.string().trim().max(160).optional().or(z.literal("")),
  message: z.string().trim().min(5, "Escreva sua mensagem.").max(5000, "Mensagem muito longa."),
});

// Limite simples por IP (melhor esforço, por instância do servidor)
const hits = new Map<string, number[]>();

export async function sendContact(_: ContactState, formData: FormData): Promise<ContactState> {
  // Honeypot anti-spam: campo invisível que pessoas não preenchem
  if (formData.get("website")) return { ok: true, message: "Mensagem enviada com sucesso!" };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  if (recent.length >= 5) return { ok: false, message: "Muitas mensagens em pouco tempo. Tente novamente em alguns minutos." };

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { ok: false, message: "Confira os campos destacados.", fieldErrors };
  }

  const sb = createPublicClient();
  if (!sb) return { ok: false, message: "O formulário ainda não está configurado. Fale conosco pelo WhatsApp ou Instagram." };

  const { name, email, phone, subject, message } = parsed.data;
  const { error } = await sb.from("mcv_contact_messages").insert({ name, email, phone: phone || null, subject: subject || null, message });
  if (error) {
    console.error("[contato]", error.message);
    return { ok: false, message: "Não foi possível enviar agora. Tente novamente em instantes." };
  }
  hits.set(ip, [...recent, now]);
  return { ok: true, message: "Mensagem enviada com sucesso! Em breve entraremos em contato." };
}
