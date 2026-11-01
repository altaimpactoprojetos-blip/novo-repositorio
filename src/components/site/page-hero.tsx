import Image from "next/image";
import { Emblem } from "@/components/brand/logo";
import { Reveal } from "./motion";
import { cn } from "@/lib/utils";

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string | null;
  image?: string | null;
  children?: React.ReactNode;
  className?: string;
};

/** Cabeçalho elegante das páginas internas (sempre escuro, para o menu transparente). */
export function PageHero({ eyebrow, title, subtitle, image, children, className }: Props) {
  return (
    <section className={cn("bg-wine-gradient grain relative isolate overflow-hidden pt-36 pb-20 md:pt-44 md:pb-28", className)}>
      {image && (
        <>
          <Image src={image} alt="" fill priority sizes="100vw" className="-z-10 object-cover opacity-35" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-wine-900/70 via-wine-800/60 to-wine-900/90" />
        </>
      )}
      <Emblem variant="light" className="pointer-events-none absolute -top-16 -right-16 h-72 w-auto animate-spin-slow opacity-[0.045] md:h-[28rem]" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 size-96 rounded-full bg-rose/20 blur-3xl" />
      <div className="container-site relative text-center">
        {eyebrow && (
          <Reveal>
            <p className="eyebrow !text-champagne-light">{eyebrow}</p>
          </Reveal>
        )}
        <Reveal delay={0.1}>
          <h1 className="mx-auto mt-5 max-w-4xl font-serif text-5xl leading-[1.02] text-balance !text-lilac-50 md:text-7xl">{title}</h1>
        </Reveal>
        {subtitle && (
          <Reveal delay={0.2}>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-balance text-lilac-100/80 md:text-lg">{subtitle}</p>
          </Reveal>
        )}
        {children && <Reveal delay={0.3}>{children}</Reveal>}
      </div>
      <svg className="absolute inset-x-0 -bottom-px w-full text-background" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden>
        <path fill="currentColor" d="M0 60V30C240 0 480 0 720 22s480 38 720 8v30H0Z" />
      </svg>
    </section>
  );
}
