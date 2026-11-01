"use client";

import { createClient } from "./supabase/client";
import { MEDIA_BUCKET } from "./supabase/config";

export const MAX_UPLOAD_MB = 25;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
export const ACCEPT_ATTR = ACCEPTED.join(",");

export type UploadedImage = { url: string; width: number | null; height: number | null };

async function readDimensions(file: File): Promise<{ width: number | null; height: number | null }> {
  try {
    const bitmap = await createImageBitmap(file);
    const dims = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return dims;
  } catch {
    return await new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => resolve({ width: null, height: null });
      img.src = URL.createObjectURL(file);
    });
  }
}

/**
 * Envia a imagem ORIGINAL (sem recompressão) ao Supabase Storage.
 * A segurança é garantida pelas políticas RLS: só administradoras podem enviar.
 */
export async function uploadImage(file: File, folder: string): Promise<UploadedImage> {
  if (!ACCEPTED.includes(file.type)) throw new Error(`"${file.name}" não é uma imagem suportada (JPG, PNG, WEBP, AVIF ou GIF).`);
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) throw new Error(`"${file.name}" excede ${MAX_UPLOAD_MB} MB.`);

  const dims = await readDimensions(file);
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const now = new Date();
  const path = `${folder}/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${crypto.randomUUID()}.${ext}`;

  const supabase = createClient();
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false,
  });
  if (error)
    throw new Error(
      error.message.includes("row-level security") ? "Sem permissão para enviar arquivos." : `Falha no envio de "${file.name}": ${error.message}`,
    );

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, ...dims };
}
