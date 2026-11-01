"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, GripVertical, ImagePlus, Loader2, Star, Trash2, UploadCloud, XCircle } from "lucide-react";
import { toast } from "sonner";
import { addPhotos, deletePhotos, reorderPhotos, setAlbumCover, updatePhotoCaption } from "@/actions/albums";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PhotoRow } from "@/lib/types";
import { ACCEPT_ATTR, uploadImage, type UploadedImage } from "@/lib/upload";
import { cn } from "@/lib/utils";
import { ConfirmButton } from "./confirm-button";

type Job = { id: string; name: string; status: "pending" | "uploading" | "done" | "error"; error?: string };

export function PhotoManager({ albumId, photos: initial, coverUrl }: { albumId: string; photos: PhotoRow[]; coverUrl: string | null }) {
  const router = useRouter();
  const [photos, setPhotos] = useState(initial);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [, start] = useTransition();
  const input = useRef<HTMLInputElement>(null);
  const uploading = jobs.some((j) => j.status === "pending" || j.status === "uploading");

  useEffect(() => setPhotos(initial), [initial]);

  async function handleFiles(list: FileList | File[] | null) {
    const files = Array.from(list ?? []).filter((f) => f.type.startsWith("image/"));
    if (!files.length) return;
    const newJobs: Job[] = files.map((f) => ({ id: crypto.randomUUID(), name: f.name, status: "pending" }));
    setJobs((j) => [...newJobs, ...j.filter((x) => x.status !== "done")]);
    const results: (UploadedImage | null)[] = new Array(files.length).fill(null);
    let cursor = 0;
    const worker = async () => {
      while (cursor < files.length) {
        const i = cursor++;
        const jobId = newJobs[i].id;
        setJobs((js) => js.map((j) => (j.id === jobId ? { ...j, status: "uploading" } : j)));
        try {
          results[i] = await uploadImage(files[i], `albums/${albumId}`);
          setJobs((js) => js.map((j) => (j.id === jobId ? { ...j, status: "done" } : j)));
        } catch (e) {
          setJobs((js) => js.map((j) => (j.id === jobId ? { ...j, status: "error", error: (e as Error).message } : j)));
        }
      }
    };
    await Promise.all(Array.from({ length: Math.min(3, files.length) }, worker));
    const ok = results.filter((r): r is UploadedImage => r !== null);
    if (ok.length) {
      const res = await addPhotos(albumId, ok);
      if (res.ok) toast.success(res.message);
      else toast.error(res.error);
      router.refresh();
    }
    const failed = files.length - ok.length;
    if (failed) toast.error(`${failed} ${failed === 1 ? "arquivo não foi enviado" : "arquivos não foram enviados"}.`);
    if (input.current) input.current.value = "";
  }

  function persistOrder(next: PhotoRow[]) {
    setPhotos(next);
    start(async () => {
      const res = await reorderPhotos(
        albumId,
        next.map((p) => p.id),
      );
      if (!res.ok) toast.error(res.error);
      else toast.success(res.message);
    });
  }

  function move(index: number, delta: number) {
    const j = index + delta;
    if (j < 0 || j >= photos.length) return;
    const next = [...photos];
    [next[index], next[j]] = [next[j], next[index]];
    persistOrder(next);
  }

  function dropOn(targetId: string) {
    if (!dragId || dragId === targetId) return;
    const next = [...photos];
    const from = next.findIndex((p) => p.id === dragId);
    const to = next.findIndex((p) => p.id === targetId);
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setDragId(null);
    persistOrder(next);
  }

  const toggleSelect = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <div className="grid gap-6">
      <div
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes("Files")) {
            e.preventDefault();
            setDragOver(true);
          }
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          if (!e.dataTransfer.files.length) return;
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cn("rounded-2xl border-2 border-dashed p-8 text-center transition", dragOver ? "border-wine-500 bg-wine-50" : "border-input bg-white")}
      >
        <UploadCloud className="mx-auto size-10 text-wine-700" strokeWidth={1.3} />
        <p className="mt-3 font-serif text-2xl text-wine-800">Arraste as fotos aqui</p>
        <p className="mt-1 text-sm text-muted-foreground">
          ou selecione vários arquivos de uma vez. As imagens são enviadas em qualidade original (até 25 MB cada).
        </p>
        <Button type="button" className="mt-5" onClick={() => input.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="animate-spin" /> : <ImagePlus />} {uploading ? "Enviando..." : "Selecionar fotos"}
        </Button>
        <input ref={input} type="file" accept={ACCEPT_ATTR} multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
        {jobs.length > 0 && (
          <ul className="mx-auto mt-6 max-h-48 max-w-lg space-y-1.5 overflow-y-auto text-left text-sm">
            {jobs.map((j) => (
              <li key={j.id} className="flex items-center gap-2">
                {j.status === "done" ? (
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                ) : j.status === "error" ? (
                  <XCircle className="size-4 shrink-0 text-destructive" />
                ) : (
                  <Loader2 className={cn("size-4 shrink-0", j.status === "uploading" && "animate-spin")} />
                )}
                <span className="truncate">{j.name}</span>
                {j.error && <span className="truncate text-xs text-destructive">— {j.error}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>

      {photos.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {photos.length} {photos.length === 1 ? "foto" : "fotos"} · arraste para reordenar
          </p>
          <div className="flex gap-2">
            {selected.size > 0 && (
              <>
                <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
                  Limpar seleção
                </Button>
                <ConfirmButton
                  action={() => deletePhotos([...selected])}
                  title={`Excluir ${selected.size} ${selected.size === 1 ? "foto" : "fotos"}?`}
                  description="As fotos serão apagadas do site e do armazenamento."
                  variant="destructive"
                  size="sm"
                  onDone={() => {
                    setPhotos((p) => p.filter((x) => !selected.has(x.id)));
                    setSelected(new Set());
                    router.refresh();
                  }}
                >
                  <Trash2 /> Excluir selecionadas ({selected.size})
                </ConfirmButton>
              </>
            )}
            {selected.size === 0 && (
              <Button variant="outline" size="sm" onClick={() => setSelected(new Set(photos.map((p) => p.id)))}>
                Selecionar todas
              </Button>
            )}
          </div>
        </div>
      )}

      <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {photos.map((p, i) => (
          <li
            key={p.id}
            draggable
            onDragStart={(e) => {
              setDragId(p.id);
              e.dataTransfer.effectAllowed = "move";
            }}
            onDragOver={(e) => {
              if (dragId) e.preventDefault();
            }}
            onDrop={(e) => {
              if (!dragId) return;
              e.preventDefault();
              dropOn(p.id);
            }}
            onDragEnd={() => setDragId(null)}
            className={cn(
              "group overflow-hidden rounded-2xl border bg-white transition",
              dragId === p.id && "opacity-40",
              selected.has(p.id) ? "border-wine-600 ring-2 ring-wine-300" : "border-border/70",
            )}
          >
            <div className="relative aspect-square bg-blush">
              <Image src={p.url} alt={p.caption ?? ""} fill sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 45vw" className="object-cover" />
              <label className="absolute top-2 left-2 inline-flex size-7 cursor-pointer items-center justify-center rounded-md bg-white/90 shadow">
                <input
                  type="checkbox"
                  checked={selected.has(p.id)}
                  onChange={() => toggleSelect(p.id)}
                  className="size-4 accent-wine-800"
                  aria-label="Selecionar foto"
                />
              </label>
              <span
                className="absolute top-2 right-2 inline-flex cursor-grab items-center rounded-md bg-white/90 p-1 text-muted-foreground shadow active:cursor-grabbing"
                title="Arraste para mover"
              >
                <GripVertical className="size-4" />
              </span>
              {coverUrl === p.url && (
                <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-champagne px-2.5 py-1 text-[0.65rem] font-bold tracking-wider text-wine-950 uppercase">
                  <Star className="size-3 fill-current" /> Capa
                </span>
              )}
              {p.width && p.height && (
                <span className="absolute right-2 bottom-2 rounded bg-black/50 px-1.5 py-0.5 text-[0.6rem] text-white">
                  {p.width}×{p.height}
                </span>
              )}
            </div>
            <div className="grid gap-2 p-3">
              <CaptionInput photo={p} />
              <div className="flex items-center justify-between">
                <div className="flex">
                  <Button type="button" variant="ghost" size="icon-sm" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Mover para trás">
                    <ArrowLeft />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => move(i, 1)}
                    disabled={i === photos.length - 1}
                    aria-label="Mover para frente"
                  >
                    <ArrowRight />
                  </Button>
                </div>
                <div className="flex">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    title="Definir como capa"
                    aria-label="Definir como capa"
                    className={coverUrl === p.url ? "text-champagne" : ""}
                    onClick={() =>
                      start(async () => {
                        const res = await setAlbumCover(albumId, p.url);
                        if (res.ok) {
                          toast.success(res.message);
                          router.refresh();
                        } else toast.error(res.error);
                      })
                    }
                  >
                    <Star className={coverUrl === p.url ? "fill-current" : ""} />
                  </Button>
                  <ConfirmButton
                    action={() => deletePhotos([p.id])}
                    title="Excluir foto?"
                    description="A foto será apagada do site e do armazenamento."
                    onDone={() => {
                      setPhotos((ps) => ps.filter((x) => x.id !== p.id));
                      router.refresh();
                    }}
                  />
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CaptionInput({ photo }: { photo: PhotoRow }) {
  const [value, setValue] = useState(photo.caption ?? "");
  const [saved, setSaved] = useState(photo.caption ?? "");
  const [pending, start] = useTransition();
  const save = () => {
    if (value === saved) return;
    start(async () => {
      const res = await updatePhotoCaption(photo.id, value);
      if (res.ok) {
        setSaved(value);
        toast.success(res.message);
      } else toast.error(res.error);
    });
  };
  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            save();
          }
        }}
        placeholder="Legenda (opcional)"
        maxLength={500}
        className="h-9 rounded-lg pr-8 text-xs"
        aria-label="Legenda"
      />
      {pending && <Loader2 className="absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 animate-spin text-muted-foreground" />}
    </div>
  );
}
