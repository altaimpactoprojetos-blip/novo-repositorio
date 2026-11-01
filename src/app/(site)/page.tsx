import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import { HomeHero } from "@/components/home/hero";
import { Marquee } from "@/components/home/marquee";
import { Testimonials } from "@/components/home/testimonials";
import { Emblem } from "@/components/brand/logo";
import { InstagramIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/site/event-card";
import { Media } from "@/components/site/media";
import { Reveal, Stagger, StaggerItem } from "@/components/site/motion";
import { SectionHeading } from "@/components/site/section-heading";
import { groupEvents } from "@/lib/events";
import { getAllContent, getFeaturedTestimonials, getPublishedEvents, getRecentPhotos } from "@/lib/queries";
import { instagramHandle, paragraphs } from "@/lib/utils";

export const revalidate = 60;

export default async function HomePage() {
  const [{ home, contact }, events, photos, testimonials] = await Promise.all([
    getAllContent(),
    getPublishedEvents(),
    getRecentPhotos(7),
    getFeaturedTestimonials(),
  ]);
  const groups = groupEvents(events);
  const upcoming = [...groups.andamento, ...groups.proximo].slice(0, 3);
  const showcase = upcoming.length ? upcoming : groups.realizado.slice(0, 3);

  return (
    <>
      <HomeHero eyebrow={home.hero_eyebrow} title={home.hero_title} subtitle={home.hero_subtitle} image={home.hero_image} ctaLabel={home.hero_cta_label} />

      {/* Apresentação do movimento */}
      <section id="movimento" className="relative overflow-hidden py-24 md:py-36">
        <div className="pointer-events-none absolute top-20 -right-40 size-[32rem] rounded-full bg-blush blur-3xl" />
        <div className="container-site relative grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
          <Reveal className="relative order-2 mx-auto w-full max-w-md lg:order-1 lg:max-w-none">
            <div className="absolute -top-6 -left-6 h-full w-full rounded-t-full rounded-b-3xl border border-champagne/50" />
            <Media
              src={home.intro_image}
              alt="Mulheres reunidas no Mulheres com Visão"
              label="Foto do movimento"
              className="aspect-[4/5] rounded-t-full rounded-b-3xl shadow-[0_40px_80px_-40px_rgba(76,15,40,0.5)]"
            />
            <div className="absolute -right-4 -bottom-8 max-w-[15rem] rounded-2xl bg-wine-800 p-6 text-lilac-50 shadow-2xl md:-right-10">
              <Sparkles className="size-5 text-champagne-light" />
              <p className="mt-3 font-serif text-xl leading-snug italic">“{home.quote_text}”</p>
              <p className="mt-2 text-[0.65rem] tracking-[0.2em] text-lilac-200/70 uppercase">{home.quote_reference}</p>
            </div>
          </Reveal>
          <div className="order-1 lg:order-2">
            <SectionHeading eyebrow={home.intro_eyebrow} title={home.intro_title} align="left" />
            <Reveal delay={0.1} className="prose-site mt-8 text-[1.02rem] text-cocoa/80">
              {paragraphs(home.intro_text).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </Reveal>
            <Reveal delay={0.2} className="mt-10">
              <Button asChild size="lg">
                <Link href="/sobre">
                  {home.hero_cta_label} <ArrowRight />
                </Link>
              </Button>
            </Reveal>
          </div>
        </div>

        {home.highlights.length > 0 && (
          <Stagger className="container-site relative mt-24 grid gap-4 sm:grid-cols-2 lg:mt-32 lg:grid-cols-4">
            {home.highlights.map((h, i) => (
              <StaggerItem key={i}>
                <div className="group h-full rounded-3xl border border-border/70 bg-white/70 p-7 transition duration-500 hover:-translate-y-1 hover:border-wine-800/20 hover:bg-white hover:shadow-[0_30px_60px_-40px_rgba(76,15,40,0.5)]">
                  <span className="font-serif text-5xl text-champagne/80 italic">0{i + 1}</span>
                  <h3 className="mt-4 font-serif text-3xl">{h.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{h.text}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </section>

      <Marquee />

      {/* Próximos eventos */}
      <section className="py-24 md:py-32">
        <div className="container-site">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row md:items-end">
            <SectionHeading
              eyebrow="Agenda"
              title={upcoming.length ? "Próximos encontros" : "Encontros que marcaram"}
              text={
                upcoming.length
                  ? "Separe a data, chame suas amigas e venha viver esse momento com a gente."
                  : "Novos encontros estão sendo preparados com muito carinho. Acompanhe nosso Instagram para não perder nenhuma novidade."
              }
              align="left"
              className="text-center md:text-left"
            />
            <Reveal>
              <Button asChild variant="outline">
                <Link href="/eventos">
                  Ver todos os eventos <ArrowUpRight />
                </Link>
              </Button>
            </Reveal>
          </div>
          {showcase.length > 0 ? (
            <Stagger className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {showcase.map((e) => (
                <StaggerItem key={e.id}>
                  <EventCard event={e} />
                </StaggerItem>
              ))}
            </Stagger>
          ) : (
            <Reveal className="mt-14 rounded-[2rem] border border-dashed border-wine-800/20 bg-white/60 p-12 text-center">
              <Emblem className="mx-auto h-14 w-auto opacity-40" />
              <p className="mt-6 font-serif text-3xl text-wine-800">Em breve, novos encontros</p>
              <p className="mx-auto mt-3 max-w-md text-muted-foreground">Estamos preparando algo especial para você.</p>
            </Reveal>
          )}
        </div>
      </section>

      {/* Galeria */}
      {photos.length > 0 && (
        <section className="bg-blush/60 py-24 md:py-32">
          <div className="container-site">
            <SectionHeading
              eyebrow="Galeria"
              title="Momentos que guardamos no coração"
              text="Cada abraço, cada lágrima e cada sorriso contam a história de mulheres que escolheram caminhar juntas."
            />
            <Stagger className="mt-14 grid auto-rows-[11rem] grid-cols-2 gap-3 md:auto-rows-[14rem] md:grid-cols-4 md:gap-4">
              {photos.map((p, i) => (
                <StaggerItem key={p.id} className={i === 0 ? "col-span-2 row-span-2" : i === 3 ? "md:row-span-2" : ""}>
                  <Link href={`/galeria/${p.album_slug}?foto=${p.id}`} className="group relative block h-full overflow-hidden rounded-2xl">
                    <Image
                      src={p.url}
                      alt={p.caption || p.album_title}
                      fill
                      sizes="(min-width: 768px) 33vw, 50vw"
                      className="object-cover transition duration-[1.2s] ease-[var(--ease-soft)] group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-wine-950/60 to-transparent opacity-0 transition group-hover:opacity-100" />
                    <span className="absolute bottom-3 left-4 text-xs font-medium tracking-wider text-white opacity-0 transition group-hover:opacity-100">
                      {p.album_title}
                    </span>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
            <Reveal className="mt-12 text-center">
              <Button asChild variant="outline">
                <Link href="/galeria">
                  Ver galeria completa <ArrowUpRight />
                </Link>
              </Button>
            </Reveal>
          </div>
        </section>
      )}

      {/* Mensagem da idealizadora */}
      <section className="bg-wine-gradient grain relative overflow-hidden py-24 text-lilac-100 md:py-36">
        <Emblem variant="light" className="pointer-events-none absolute -bottom-40 -left-40 h-[34rem] w-auto opacity-[0.05]" />
        <div className="container-site relative grid items-center gap-14 lg:grid-cols-12">
          <Reveal className="mx-auto w-full max-w-sm lg:col-span-5 lg:max-w-none">
            <div className="relative">
              <Media
                src={home.founder_photo}
                alt={home.founder_name}
                label="Foto da idealizadora"
                className="aspect-[4/5] rounded-[2rem] ring-1 ring-white/15"
              />
              <div className="absolute -right-3 -bottom-3 -z-10 h-full w-full rounded-[2rem] border border-champagne-light/40" />
            </div>
          </Reveal>
          <div className="lg:col-span-7">
            <SectionHeading eyebrow={home.founder_eyebrow} title={home.founder_title} align="left" light />
            <Reveal delay={0.1} className="prose-site mt-8 font-serif text-xl text-lilac-100/90 italic md:text-2xl [&_p]:leading-[1.55]">
              {paragraphs(home.founder_message).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </Reveal>
            <Reveal delay={0.2} className="mt-10 flex items-center gap-5">
              <span className="h-px w-14 bg-champagne-light" />
              <div>
                <p className="font-serif text-3xl text-lilac-50">{home.founder_name}</p>
                <p className="text-xs tracking-[0.2em] text-champagne-light uppercase">{home.founder_role}</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      {testimonials.length > 0 && (
        <section className="py-24 md:py-32">
          <div className="container-site">
            <SectionHeading eyebrow="Depoimentos" title="Vidas que foram tocadas" />
            <Reveal className="mt-12">
              <Testimonials items={testimonials} />
            </Reveal>
            <Reveal className="mt-12 text-center">
              <Link href="/mensagens" className="text-[0.72rem] font-semibold tracking-[0.2em] text-wine-800 uppercase underline-offset-8 hover:underline">
                Ler todos os testemunhos
              </Link>
            </Reveal>
          </div>
        </section>
      )}

      {/* Instagram */}
      {contact.instagram_url && (
        <section className={testimonials.length ? "pb-24 md:pb-32" : "py-24 md:py-32"}>
          <div className="container-site">
            <Reveal>
              <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blush via-white to-lilac-100 p-10 text-center md:p-20">
                <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-rose/40 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -left-24 size-72 rounded-full bg-lilac-200/70 blur-3xl" />
                <div className="relative">
                  <span className="mx-auto inline-flex size-16 items-center justify-center rounded-full bg-wine-800 text-lilac-50 shadow-xl">
                    <InstagramIcon className="size-7" />
                  </span>
                  <h2 className="mt-6 font-serif text-4xl text-balance md:text-6xl">{home.instagram_title}</h2>
                  <p className="mx-auto mt-4 max-w-xl text-muted-foreground md:text-lg">{home.instagram_text}</p>
                  <Button asChild size="lg" className="mt-9">
                    <a href={contact.instagram_url} target="_blank" rel="noopener noreferrer">
                      Seguir {instagramHandle(contact.instagram_url)}
                    </a>
                  </Button>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      )}
    </>
  );
}
