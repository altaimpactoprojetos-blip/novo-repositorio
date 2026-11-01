import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const TZ = "America/Sao_Paulo";

export function formatDate(value: string | Date | null | undefined, opts: Intl.DateTimeFormatOptions = {}) {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, day: "2-digit", month: "long", year: "numeric", ...opts }).format(d);
}

export function formatTime(value: string | Date | null | undefined) {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).format(d);
}

export function dateParts(value: string) {
  const d = new Date(value);
  const day = new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, day: "2-digit" }).format(d);
  const month = new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, month: "short" }).format(d).replace(".", "");
  const year = new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, year: "numeric" }).format(d);
  const weekday = new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, weekday: "long" }).format(d);
  return { day, month, year, weekday };
}

/** Converte ISO (UTC) para o valor aceito por <input type="datetime-local"> no fuso de Brasília. */
export function toLocalInput(value: string | null | undefined) {
  if (!value) return "";
  const d = new Date(value);
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
  return parts.replace(" ", "T");
}

/** Interpreta o valor de um datetime-local como horário de Brasília (UTC-3). */
export function fromLocalInput(value: string | null | undefined) {
  if (!value) return null;
  const d = new Date(`${value}:00-03:00`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export function whatsappLink(number: string | null | undefined, message?: string) {
  const digits = (number ?? "").replace(/\D/g, "");
  if (!digits) return null;
  const full = digits.startsWith("55") || digits.length > 11 ? digits : `55${digits}`;
  return `https://wa.me/${full}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

export function instagramHandle(url: string | null | undefined) {
  if (!url) return "";
  const m = url.match(/instagram\.com\/([^/?#]+)/i);
  return m ? `@${m[1].replace(/^@/, "")}` : url.startsWith("@") ? url : `@${url}`;
}

export function youtubeEmbed(url: string | null | undefined) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
  if (m) return `https://www.youtube-nocookie.com/embed/${m[1]}`;
  const v = url.match(/vimeo\.com\/(\d+)/);
  if (v) return `https://player.vimeo.com/video/${v[1]}`;
  return null;
}

export function paragraphs(text: string | null | undefined) {
  return (text ?? "")
    .split(/\n{2,}|\r\n\r\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
