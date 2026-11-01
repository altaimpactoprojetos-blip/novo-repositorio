"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Expand, Share2, X } from "lucide-react";
import { shareUrl } from "./share-button";

export type GalleryPhoto = { id: string; url: string; width: number | null; height: number | null; caption: string | null };

/** Galeria editorial em colunas (preserva a proporção original) + visualização ampliada. */
export function Gallery({ photos, title, basePath }: { photos: GalleryPhoto[]; title: string; basePath: string }) {
  const [index, setIndex] = useState<number | null>(null);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("foto");
    if (id) {
      const i = photos.findIndex((p) => p.id === id);
      if (i >= 0) setIndex(i);
    }
  }, [photos]);

  return (
    <>
      <div className="masonry">
        {photos.map((p, i) => (
          <motion.button
            key={p.id}
            type="button"
            onClick={() => setIndex(i)}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: (i % 3) * 0.08 }}
            className="group relative block w-full cursor-zoom-in overflow-hidden rounded-2xl bg-blush text-left"
            aria-label={`Ampliar foto ${i + 1}${p.caption ? `: ${p.caption}` : ""}`}
          >
            <Image
              src={p.url}
              alt={p.caption || `${title} — foto ${i + 1}`}
              width={p.width || 1200}
              height={p.height || 900}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="h-auto w-full transition duration-[1.2s] ease-[var(--ease-soft)] group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-wine-950/70 via-transparent to-transparent p-4 opacity-0 transition duration-500 group-hover:opacity-100">
              <div className="flex w-full items-end justify-between gap-3 text-lilac-50">
                <span className="line-clamp-2 text-sm">{p.caption}</span>
                <Expand className="size-5 shrink-0" />
              </div>
            </div>
          </motion.button>
        ))}
      </div>
      <Lightbox photos={photos} index={index} onChange={setIndex} title={title} basePath={basePath} />
    </>
  );
}

export function Lightbox({
  photos,
  index,
  onChange,
  title,
  basePath,
}: {
  photos: GalleryPhoto[];
  index: number | null;
  onChange: (i: number | null) => void;
  title: string;
  basePath: string;
}) {
  const [dir, setDir] = useState(0);
  const total = photos.length;
  const go = useCallback(
    (delta: number) => {
      if (index === null) return;
      setDir(delta);
      onChange((index + delta + total) % total);
    },
    [index, total, onChange],
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onChange(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, go, onChange]);

  const photo = index !== null ? photos[index] : null;

  return (
    <AnimatePresence>
      {photo && index !== null && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`Foto ${index + 1} de ${total}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex flex-col bg-wine-950/95 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between gap-4 px-4 py-3 text-lilac-100 md:px-6">
            <p className="text-xs tracking-[0.25em] uppercase">
              {index + 1} / {total}
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => shareUrl(`${basePath}?foto=${photo.id}`, title)}
                className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full transition hover:bg-white/10"
                aria-label="Compartilhar foto"
              >
                <Share2 className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => onChange(null)}
                className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full transition hover:bg-white/10"
                aria-label="Fechar"
                autoFocus
              >
                <X className="size-6" />
              </button>
            </div>
          </div>

          <div className="relative flex-1 overflow-hidden">
            <AnimatePresence initial={false} custom={dir} mode="popLayout">
              <motion.div
                key={photo.id}
                custom={dir}
                initial={{ opacity: 0, x: dir * 80 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: dir * -80 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                drag={total > 1 ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.4}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -80) go(1);
                  else if (info.offset.x > 80) go(-1);
                }}
                className="absolute inset-0 mx-3 md:mx-20"
              >
                <Image
                  src={photo.url}
                  alt={photo.caption || `${title} — foto ${index + 1}`}
                  fill
                  sizes="100vw"
                  quality={90}
                  priority
                  draggable={false}
                  className="object-contain select-none"
                />
              </motion.div>
            </AnimatePresence>

            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  className="absolute top-1/2 left-3 hidden size-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/10 text-lilac-50 backdrop-blur transition hover:bg-white/20 md:inline-flex"
                  aria-label="Foto anterior"
                >
                  <ChevronLeft className="size-6" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  className="absolute top-1/2 right-3 hidden size-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/10 text-lilac-50 backdrop-blur transition hover:bg-white/20 md:inline-flex"
                  aria-label="Próxima foto"
                >
                  <ChevronRight className="size-6" />
                </button>
              </>
            )}
          </div>

          <div className="min-h-16 px-6 py-4 text-center">
            {photo.caption && <p className="mx-auto max-w-2xl font-serif text-lg text-lilac-100 italic">{photo.caption}</p>}
            {total > 1 && <p className="mt-1 text-[0.65rem] tracking-[0.25em] text-lilac-100/50 uppercase md:hidden">Deslize para navegar</p>}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
