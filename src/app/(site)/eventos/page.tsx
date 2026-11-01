import type { Metadata } from "next";
import { CalendarHeart } from "lucide-react";
import { EventCard } from "@/components/site/event-card";
import { Reveal, Stagger, StaggerItem } from "@/components/site/motion";
import { PageHero } from "@/components/site/page-hero";
import { SectionHeading } from "@/components/site/section-heading";
import { groupEvents } from "@/lib/events";
import { getPublishedEvents } from "@/lib/queries";
import type { EventRow } from "@/lib/types";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Eventos",
  description: "Conferências, encontros e momentos especiais do Mulheres com Visão. Veja os próximos eventos e reviva os que já aconteceram.",
  alternates: { canonical: "/eventos" },
};

function Group({ id, eyebrow, title, events }: { id: string; eyebrow: string; title: string; events: EventRow[] }) {
  if (!events.length) return null;
  return (
    <section id={id} className="scroll-mt-28">
      <SectionHeading eyebrow={eyebrow} title={title} align="left" />
      <Stagger className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((e, i) => (
          <StaggerItem key={e.id}>
            <EventCard event={e} priority={i < 3} />
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

export default async function EventosPage() {
  const events = await getPublishedEvents();
  const g = groupEvents(events);
  const anchors = [
    { id: "andamento", label: "Em andamento", count: g.andamento.length },
    { id: "proximos", label: "Próximos", count: g.proximo.length },
    { id: "realizados", label: "Realizados", count: g.realizado.length },
  ].filter((a) => a.count);

  return (
    <>
      <PageHero
        eyebrow="Agenda"
        title="Eventos"
        subtitle="Encontros preparados com amor para fortalecer a sua fé, renovar o seu coração e conectar você a outras mulheres com visão."
      >
        {anchors.length > 1 && (
          <nav aria-label="Seções de eventos" className="mt-10 flex flex-wrap justify-center gap-2">
            {anchors.map((a) => (
              <a
                key={a.id}
                href={`#${a.id}`}
                className="rounded-full border border-lilac-100/30 px-5 py-2 text-xs tracking-[0.15em] text-lilac-50 uppercase transition hover:bg-lilac-50 hover:text-wine-800"
              >
                {a.label} <span className="opacity-60">({a.count})</span>
              </a>
            ))}
          </nav>
        )}
      </PageHero>
      <div className="container-site space-y-24 py-20 md:py-28">
        <Group id="andamento" eyebrow="Acontecendo agora" title="Eventos em andamento" events={g.andamento} />
        <Group id="proximos" eyebrow="Separe a data" title="Próximos eventos" events={g.proximo} />
        <Group id="realizados" eyebrow="Memórias" title="Eventos realizados" events={g.realizado} />
        {!events.length && (
          <Reveal className="mx-auto max-w-lg text-center">
            <CalendarHeart className="mx-auto size-12 text-rose-deep" strokeWidth={1.2} />
            <h2 className="mt-6 font-serif text-4xl">Novos encontros em breve</h2>
            <p className="mt-4 text-muted-foreground">
              Estamos preparando os próximos eventos com muito carinho. Volte em breve ou fale com a gente para saber das novidades.
            </p>
          </Reveal>
        )}
      </div>
    </>
  );
}
