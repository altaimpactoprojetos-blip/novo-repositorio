import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, CalendarPlus, Clock, Images, MapPin, Ticket } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/motion";
import { ShareButton } from "@/components/site/share-button";
import { EVENT_STATUS_LABEL, eventStatus } from "@/lib/events";
import { getAlbumsByEvent, getContent, getEventBySlug } from "@/lib/queries";
import { formatDate, formatTime, paragraphs, siteUrl, whatsappLink } from "@/lib/utils";

export const revalidate = 60;

/** Páginas geradas sob demanda e mantidas em cache (ISR). */
export async function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const e = await getEventBySlug(slug);
  if (!e) return { title: "Evento não encontrado" };
  const description = e.subtitle || e.description?.slice(0, 160) || `${e.title} — ${formatDate(e.start_at)}`;
  return {
    title: e.title,
    description,
    alternates: { canonical: `/eventos/${e.slug}` },
    openGraph: { title: e.title, description, images: e.banner_url ? [e.banner_url] : undefined, type: "article" },
  };
}

function googleCalendarUrl(e: { title: string; start_at: string; end_at: string | null; location_name: string | null; address: string | null; slug: string }) {
  const fmt = (d: Date) =>
    d
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  const start = new Date(e.start_at);
  const end = e.end_at ? new Date(e.end_at) : new Date(start.getTime() + 3 * 3600_000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: `${siteUrl}/eventos/${e.slug}`,
    location: [e.location_name, e.address].filter(Boolean).join(" — "),
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

export default async function EventoPage({ params }: Props) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();
  const [contact, albums] = await Promise.all([getContent("contact"), getAlbumsByEvent(event.id)]);

  const status = eventStatus(event);
  const wa = whatsappLink(contact.whatsapp_number, event.whatsapp_message || `Olá! Gostaria de mais informações sobre o evento "${event.title}".`);
  const sameDay = !event.end_at || formatDate(event.start_at) === formatDate(event.end_at);
  const dateLabel = sameDay
    ? formatDate(event.start_at, { weekday: "long" })
    : `${formatDate(event.start_at, { day: "2-digit", month: "long" })} a ${formatDate(event.end_at)}`;
  const timeLabel = event.end_at && sameDay ? `${formatTime(event.start_at)} às ${formatTime(event.end_at)}` : formatTime(event.start_at);
  const schedule = Array.isArray(event.schedule) ? event.schedule.filter((s) => s.title) : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.subtitle || event.description,
    startDate: event.start_at,
    endDate: event.end_at || undefined,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    image: event.banner_url ? [event.banner_url] : undefined,
    location: event.location_name ? { "@type": "Place", name: event.location_name, address: event.address || event.location_name } : undefined,
    organizer: { "@type": "Organization", name: "Mulheres com Visão", url: siteUrl },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <section className="bg-wine-gradient grain relative isolate overflow-hidden pt-32 pb-40 md:pt-40 md:pb-52">
        {event.banner_url && (
          <>
            <Image src={event.banner_url} alt="" fill priority sizes="100vw" className="-z-10 scale-110 object-cover opacity-40 blur-sm" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-wine-900/80 via-wine-800/70 to-wine-900" />
          </>
        )}
        <div className="container-site">
          <Link href="/eventos" className="inline-flex items-center gap-2 text-xs tracking-[0.2em] text-lilac-100/80 uppercase transition hover:text-white">
            <ArrowLeft className="size-4" /> Todos os eventos
          </Link>
          <Reveal className="mt-8 max-w-4xl">
            <Badge variant={status === "proximo" ? "gold" : "glass"}>{EVENT_STATUS_LABEL[status]}</Badge>
            <h1 className="mt-5 font-serif text-5xl leading-[1.02] text-balance !text-lilac-50 md:text-7xl">{event.title}</h1>
            {event.subtitle && <p className="mt-5 max-w-2xl text-lg text-lilac-100/85">{event.subtitle}</p>}
          </Reveal>
        </div>
      </section>

      <div className="container-site relative -mt-28 pb-24 md:-mt-36 md:pb-32">
        {event.banner_url && (
          <Reveal className="relative overflow-hidden rounded-[2rem] bg-blush shadow-[0_50px_100px_-50px_rgba(76,15,40,0.6)]">
            <Image
              src={event.banner_url}
              alt={event.title}
              width={1600}
              height={900}
              priority
              quality={90}
              sizes="(min-width: 1280px) 1216px, 100vw"
              className="h-auto max-h-[70vh] w-full object-cover"
            />
          </Reveal>
        )}

        <div className={`grid gap-12 lg:grid-cols-12 ${event.banner_url ? "mt-14" : "mt-0"}`}>
          <div className="space-y-14 lg:col-span-7">
            {event.description && (
              <Reveal>
                <p className="eyebrow">Sobre o evento</p>
                <div className="prose-site mt-5 text-[1.05rem] text-cocoa/85">
                  {paragraphs(event.description).map((p, i) => (
                    <p key={i} className="whitespace-pre-line">
                      {p}
                    </p>
                  ))}
                </div>
              </Reveal>
            )}

            {schedule.length > 0 && (
              <Reveal>
                <p className="eyebrow">Programação</p>
                <ol className="relative mt-8 space-y-8 border-l border-champagne/50 pl-8">
                  {schedule.map((s, i) => (
                    <li key={i} className="relative">
                      <span className="absolute top-1.5 -left-[2.32rem] size-3 rounded-full bg-wine-800 ring-4 ring-background" />
                      {s.time && <p className="text-xs font-semibold tracking-[0.2em] text-mauve uppercase">{s.time}</p>}
                      <h3 className="mt-1 font-serif text-2xl">{s.title}</h3>
                      {s.description && <p className="mt-1 text-muted-foreground">{s.description}</p>}
                    </li>
                  ))}
                </ol>
              </Reveal>
            )}

            {event.additional_info && (
              <Reveal className="rounded-3xl bg-blush/70 p-8">
                <p className="eyebrow">Informações adicionais</p>
                <div className="prose-site mt-4 text-cocoa/80">
                  {paragraphs(event.additional_info).map((p, i) => (
                    <p key={i} className="whitespace-pre-line">
                      {p}
                    </p>
                  ))}
                </div>
              </Reveal>
            )}

            {albums.length > 0 && (
              <Reveal>
                <p className="eyebrow">Fotos do evento</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  {albums.map((a) => (
                    <Button key={a.id} asChild variant="outline">
                      <Link href={`/galeria/${a.slug}`}>
                        <Images /> {a.title}
                      </Link>
                    </Button>
                  ))}
                </div>
              </Reveal>
            )}
          </div>

          <aside className="lg:col-span-5">
            <Reveal className="sticky top-28 rounded-[2rem] border border-border/70 bg-white p-7 shadow-[0_30px_70px_-45px_rgba(76,15,40,0.55)] md:p-9">
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <CalendarDays className="mt-0.5 size-5 shrink-0 text-champagne" />
                  <div>
                    <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">Data</p>
                    <p className="mt-1 font-medium capitalize">{dateLabel}</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <Clock className="mt-0.5 size-5 shrink-0 text-champagne" />
                  <div>
                    <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">Horário</p>
                    <p className="mt-1 font-medium">{timeLabel}</p>
                  </div>
                </li>
                {(event.location_name || event.address) && (
                  <li className="flex gap-4">
                    <MapPin className="mt-0.5 size-5 shrink-0 text-champagne" />
                    <div>
                      <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">Local</p>
                      {event.location_name && <p className="mt-1 font-medium">{event.location_name}</p>}
                      {event.address && <p className="mt-0.5 text-sm text-muted-foreground">{event.address}</p>}
                      {event.map_url && (
                        <a
                          href={event.map_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-block text-sm font-medium text-wine-700 underline underline-offset-4"
                        >
                          Abrir no mapa
                        </a>
                      )}
                    </div>
                  </li>
                )}
                {event.price && (
                  <li className="flex gap-4">
                    <Ticket className="mt-0.5 size-5 shrink-0 text-champagne" />
                    <div>
                      <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">Investimento</p>
                      <p className="mt-1 font-medium">{event.price}</p>
                    </div>
                  </li>
                )}
              </ul>

              <div className="gold-line my-7" />

              <div className="flex flex-col gap-3">
                {status !== "realizado" && event.registration_url && (
                  <Button asChild size="lg" className="w-full">
                    <a href={event.registration_url} target="_blank" rel="noopener noreferrer">
                      Quero me inscrever
                    </a>
                  </Button>
                )}
                {wa && (
                  <Button asChild size="lg" variant={status !== "realizado" && event.registration_url ? "outline" : "default"} className="w-full">
                    <a href={wa} target="_blank" rel="noopener noreferrer">
                      <WhatsAppIcon /> {status === "realizado" ? "Falar com a equipe" : "Informações pelo WhatsApp"}
                    </a>
                  </Button>
                )}
                {status === "proximo" && (
                  <Button asChild variant="ghost" className="w-full">
                    <a href={googleCalendarUrl(event)} target="_blank" rel="noopener noreferrer">
                      <CalendarPlus /> Adicionar à agenda
                    </a>
                  </Button>
                )}
              </div>
              <div className="mt-6 flex justify-center">
                <ShareButton title={event.title} url={`/eventos/${event.slug}`} className="text-wine-800" label="Compartilhar evento" />
              </div>
            </Reveal>
          </aside>
        </div>
      </div>
    </>
  );
}
