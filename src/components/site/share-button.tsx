"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export async function shareUrl(url: string, title: string) {
  const full = url.startsWith("http") ? url : `${window.location.origin}${url}`;
  if (navigator.share) {
    try {
      await navigator.share({ title, url: full });
      return;
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
    }
  }
  try {
    await navigator.clipboard.writeText(full);
    toast.success("Link copiado!", { description: "Agora é só colar e compartilhar." });
  } catch {
    toast.error("Não foi possível copiar o link.");
  }
}

export function ShareButton({ url, title, className, label = "Compartilhar" }: { url?: string; title: string; className?: string; label?: string }) {
  return (
    <button
      type="button"
      onClick={() => shareUrl(url ?? window.location.href, title)}
      className={cn(
        "inline-flex cursor-pointer items-center gap-2 text-[0.72rem] font-semibold tracking-[0.18em] uppercase transition hover:opacity-75",
        className,
      )}
    >
      <Share2 className="size-4" /> {label}
    </button>
  );
}
