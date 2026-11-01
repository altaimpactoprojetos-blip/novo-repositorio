"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import Image from "next/image";

type T = {
  id: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  author_name: string | null;
  author_role: string | null;
  image_url: string | null;
};

export function Testimonials({ items }: { items: T[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = items.length;

  useEffect(() => {
    if (paused || total < 2) return;
    const t = setInterval(() => setI((v) => (v + 1) % total), 8000);
    return () => clearInterval(t);
  }, [paused, total]);

  const t = items[i];
  const text = t.excerpt || (t.content ?? "").slice(0, 420) + ((t.content ?? "").length > 420 ? "…" : "");

  return (
    <div className="relative mx-auto max-w-4xl text-center" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <Quote className="mx-auto size-12 text-champagne" strokeWidth={1} />
      <div className="relative mt-6 min-h-[16rem] md:min-h-[14rem]" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.figure
            key={t.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <blockquote className="font-serif text-2xl leading-snug text-balance text-wine-800 italic md:text-[2.1rem]">“{text}”</blockquote>
            <figcaption className="mt-8 flex items-center justify-center gap-4">
              {t.image_url && (
                <span className="relative size-14 overflow-hidden rounded-full ring-2 ring-champagne-light">
                  <Image src={t.image_url} alt={t.author_name ?? ""} fill sizes="56px" className="object-cover" />
                </span>
              )}
              <span className="text-left">
                <span className="block text-sm font-semibold tracking-[0.15em] text-wine-800 uppercase">{t.author_name || t.title}</span>
                {t.author_role && <span className="block text-sm text-muted-foreground">{t.author_role}</span>}
              </span>
            </figcaption>
          </motion.figure>
        </AnimatePresence>
      </div>
      {total > 1 && (
        <div className="mt-10 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setI((i - 1 + total) % total)}
            className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full border border-wine-800/20 text-wine-800 transition hover:bg-wine-800 hover:text-lilac-50"
            aria-label="Depoimento anterior"
          >
            <ChevronLeft className="size-5" />
          </button>
          <div className="flex gap-2">
            {items.map((x, k) => (
              <button
                key={x.id}
                type="button"
                onClick={() => setI(k)}
                aria-label={`Ir para depoimento ${k + 1}`}
                aria-current={k === i}
                className={`h-1.5 cursor-pointer rounded-full transition-all ${k === i ? "w-8 bg-wine-800" : "w-1.5 bg-wine-800/25"}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setI((i + 1) % total)}
            className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full border border-wine-800/20 text-wine-800 transition hover:bg-wine-800 hover:text-lilac-50"
            aria-label="Próximo depoimento"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      )}
    </div>
  );
}
