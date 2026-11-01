import { Emblem } from "@/components/brand/logo";

const WORDS = ["Fé", "Acolhimento", "Transformação", "Propósito", "União", "Espiritualidade", "Feminilidade", "Visão"];

export function Marquee() {
  const items = [...WORDS, ...WORDS];
  return (
    <div className="relative overflow-hidden border-y border-wine-800/10 bg-blush py-6" aria-hidden>
      <div className="flex w-max animate-marquee items-center gap-10 whitespace-nowrap">
        {items.map((w, i) => (
          <span key={i} className="flex items-center gap-10 font-serif text-3xl text-wine-800 italic md:text-4xl">
            {w}
            <Emblem className="h-6 w-auto opacity-60" />
          </span>
        ))}
      </div>
    </div>
  );
}
