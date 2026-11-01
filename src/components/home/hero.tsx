"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";
import { Emblem } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

const ease = [0.22, 1, 0.36, 1] as const;

export function HomeHero({ eyebrow, title, subtitle, image, ctaLabel }: { eyebrow: string; title: string; subtitle: string; image: string; ctaLabel: string }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yImg = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "18%"]);
  const yText = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "30%"]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const words = title.split(" ");

  return (
    <section ref={ref} className="bg-wine-gradient grain relative isolate flex min-h-[100svh] items-center overflow-hidden pt-28 pb-20">
      {/* Luzes orgânicas */}
      <div className="pointer-events-none absolute top-[10%] -left-32 size-[28rem] animate-float rounded-full bg-mauve/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 size-[30rem] animate-float rounded-full bg-rose/15 blur-3xl [animation-delay:-4s]" />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -z-0 -translate-x-1/2 -translate-y-1/2 opacity-[0.04]"
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
      >
        <Emblem variant="light" className="size-[60rem] max-w-none" />
      </motion.div>

      <div className="container-site relative grid items-center gap-14 lg:grid-cols-12">
        <motion.div style={{ y: yText, opacity: fade }} className="text-center lg:col-span-7 lg:text-left">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.2 }}
            className="eyebrow inline-flex items-center gap-3 !text-champagne-light"
          >
            <span className="hidden h-px w-10 bg-champagne-light/70 sm:inline-block" /> {eyebrow}
          </motion.p>
          <h1 className="mt-6 font-serif text-[3.6rem] leading-[0.95] font-medium !text-lilac-50 sm:text-7xl md:text-8xl xl:text-[7.5rem]">
            {words.map((w, i) => (
              <span key={i} className="inline-block overflow-hidden pb-2 align-bottom">
                <motion.span
                  className={`inline-block ${i === words.length - 1 ? "text-lilac-200 italic" : ""}`}
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1.1, ease, delay: 0.35 + i * 0.12 }}
                >
                  {w}
                  {i < words.length - 1 ? " " : ""}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease, delay: 0.9 }}
            className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-balance text-lilac-100/85 md:text-lg lg:mx-0"
          >
            {subtitle}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease, delay: 1.1 }}
            className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start"
          >
            <Button asChild variant="light" size="lg">
              <Link href="/sobre">
                {ctaLabel} <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline-light" size="lg">
              <Link href="/eventos">Próximos eventos</Link>
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease, delay: 0.4 }}
          className="relative mx-auto w-full max-w-sm lg:col-span-5 lg:max-w-none"
        >
          <div className="absolute -inset-4 rounded-t-full border border-champagne-light/30" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-full rounded-b-[2rem] bg-wine-900/40 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.6)] ring-1 ring-white/10">
            {image ? (
              <motion.div style={{ y: yImg }} className="absolute inset-[-10%]">
                <Image src={image} alt="Mulheres com Visão" fill priority sizes="(min-width: 1024px) 40vw, 90vw" quality={85} className="object-cover" />
              </motion.div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_50%_35%,rgba(214,220,240,0.25),transparent_60%)]">
                <motion.div animate={reduce ? undefined : { rotate: 360 }} transition={{ duration: 80, repeat: Infinity, ease: "linear" }}>
                  <Emblem variant="light" className="size-52 opacity-90 md:size-64" />
                </motion.div>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-wine-950/60 to-transparent" />
          </div>
          <div className="glass absolute -bottom-6 -left-4 rounded-2xl px-5 py-4 shadow-xl md:-left-10">
            <p className="font-serif text-2xl leading-none text-wine-800 italic">Fé · União</p>
            <p className="mt-1 text-[0.6rem] font-semibold tracking-[0.25em] text-mauve uppercase">Transformação · Propósito</p>
          </div>
        </motion.div>
      </div>

      <motion.a
        href="#movimento"
        aria-label="Rolar para baixo"
        style={{ opacity: fade }}
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[0.6rem] tracking-[0.3em] text-lilac-100/70 uppercase md:flex"
      >
        Role
        <motion.span animate={reduce ? undefined : { y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <ArrowDown className="size-4" />
        </motion.span>
      </motion.a>
    </section>
  );
}
