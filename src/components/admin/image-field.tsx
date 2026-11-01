"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImagePlus, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ACCEPT_ATTR, uploadImage } from "@/lib/upload";
import { cn } from "@/lib/utils";

/** Campo de imagem única: envia ao Storage e devolve a URL pública. */
export function ImageField({
  value,
  onChange,
  folder,
  label = "Imagem",
  hint,
  aspect = "aspect-video",
}: {
  value: string;
  onChange: (url: string) => void;
  folder: string;
  label?: string;
  hint?: string;
  aspect?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);

  async function handle(file?: File | null) {
    if (!file) return;
    setBusy(true);
    try {
      const res = await uploadImage(file, folder);
      onChange(res.url);
      toast.success("Imagem enviada! Lembre-se de salvar.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="grid gap-2">
      <span className="text-[0.8rem] font-medium text-cocoa/90">{label}</span>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          handle(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "group relative overflow-hidden rounded-2xl border-2 border-dashed bg-white/70 transition",
          aspect,
          drag ? "border-wine-500 bg-wine-50" : "border-input",
        )}
      >
        {value ? (
          <>
            <Image src={value} alt="" fill sizes="480px" className="object-cover" />
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-wine-950/50 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
              <button
                type="button"
                onClick={() => input.current?.click()}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-medium text-wine-800"
              >
                <RefreshCw className="size-3.5" /> Trocar
              </button>
              <button
                type="button"
                onClick={() => onChange("")}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-medium text-destructive"
              >
                <Trash2 className="size-3.5" /> Remover
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-2 p-4 text-center text-muted-foreground transition hover:text-wine-800"
          >
            <ImagePlus className="size-8" strokeWidth={1.4} />
            <span className="text-sm font-medium">Clique ou arraste uma imagem</span>
            <span className="text-xs">JPG, PNG, WEBP · até 25 MB</span>
          </button>
        )}
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <Loader2 className="size-7 animate-spin text-wine-800" />
          </div>
        )}
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <input ref={input} type="file" accept={ACCEPT_ATTR} className="hidden" onChange={(e) => handle(e.target.files?.[0])} />
    </div>
  );
}
