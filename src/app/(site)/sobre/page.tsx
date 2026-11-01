import type { Metadata } from "next";
import Link from "next/link";
import { Compass, Eye, Heart, Target } from "lucide-react";
import { Emblem } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Media } from "@/components/site/media";
import { Reveal, Stagger, StaggerItem } from "@/components/site/motion";
import { PageHero } from "@/components/site/page-hero";
import { SectionHeading } from "@/components/site/section-heading";
import { getContent, getTeam } from "@/lib/queries";
import { paragraphs } from "@/lib/utils";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Sobre nós",
  description: "Conheça a história, a missão, a visão e os valores do Mulheres com Visão, movimento idealizado pela Pastora Elaine Aguiar.",
  alternates: { canonical: "/sobre" },
};

export default async function SobrePage() {
  const [about, team] = await Promise.all([getContent("about"), getTeam()]);

  const pillars = [
    { icon: Target, title: "Nossa missão", text: about.mission },
    { icon: Eye, title: "Nossa visão", text: about.vision },
    { icon: Compass, title: "Nosso propósito", text: about.purpose },
  ].filter((p) => p.text);

  return (
    <>
      <PageHero eyebrow="Sobre nós" title={about.hero_title} subtitle={about.hero_subtitle} image={about.hero_image} />

      {/* História */}
      <section className="py-24 md:py-32">
        <div className="container-site grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
          <div>
            <SectionHeading eyebrow="Nossa história" title={about.history_title} align="left" />
            <Reveal delay={0.1} className="prose-site mt-8 text-[1.02rem] text-cocoa/80">
              {paragraphs(about.history_text).map((p, i) => (
                <p
                  key={i}
                  className={
                    i === 0
                      ? "first-letter:float-left first-letter:mr-3 first-letter:font-serif first-letter:text-7xl first-letter:leading-[0.8] first-letter:text-wine-800"
                      : ""
                  }
                >
                  {p}
                </p>
              ))}
            </Reveal>
          </div>
          <Reveal className="relative mx-auto w-full max-w-md lg:max-w-none">
            <Media
              src={about.history_image}
              alt="A história do Mulheres com Visão"
              label="Nossa história"
              className="aspect-[4/5] rounded-[2rem] shadow-[0_40px_80px_-40px_rgba(76,15,40,0.5)]"
            />
            <Emblem className="absolute -bottom-10 -left-10 h-28 w-auto opacity-80 drop-shadow-xl" />
          </Reveal>
        </div>
      </section>

      {/* Missão, visão e propósito */}
      {pillars.length > 0 && (
        <section className="bg-blush/60 py-24 md:py-32">
          <div className="container-site">
            <SectionHeading eyebrow="O que nos move" title="Missão, visão e propósito" />
            <Stagger className="mt-14 grid gap-5 md:grid-cols-3">
              {pillars.map((p) => (
                <StaggerItem key={p.title}>
                  <div className="h-full rounded-[2rem] bg-white p-8 shadow-[0_30px_60px_-45px_rgba(76,15,40,0.5)] md:p-10">
                    <span className="inline-flex size-14 items-center justify-center rounded-full bg-wine-800 text-lilac-100">
                      <p.icon className="size-6" strokeWidth={1.4} />
                    </span>
                    <h3 className="mt-6 font-serif text-3xl">{p.title}</h3>
                    <p className="mt-4 leading-relaxed text-cocoa/75">{p.text}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      )}

      {/* Valores */}
      {about.values.length > 0 && (
        <section className="py-24 md:py-32">
          <div className="container-site">
            <SectionHeading eyebrow="Nossos valores" title="Aquilo que inegociavelmente somos" />
            <Stagger className="mx-auto mt-14 max-w-4xl divide-y divide-wine-800/10 border-y border-wine-800/10">
              {about.values.map((v, i) => (
                <StaggerItem key={i}>
                  <div className="group grid gap-2 py-7 md:grid-cols-12 md:items-baseline md:gap-8">
                    <span className="font-sans text-xs tracking-[0.3em] text-champagne md:col-span-1">0{i + 1}</span>
                    <h3 className="font-serif text-3xl transition group-hover:italic md:col-span-4 md:text-4xl">{v.title}</h3>
                    <p className="text-cocoa/75 md:col-span-7">{v.text}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      )}

      {/* Idealizadora */}
      <section className="bg-wine-gradient grain relative overflow-hidden py-24 text-lilac-100 md:py-32">
        <div className="container-site relative grid items-center gap-14 lg:grid-cols-12">
          <Reveal className="mx-auto w-full max-w-sm lg:col-span-5 lg:max-w-none">
            <Media
              src={about.founder_photo}
              alt={about.founder_name}
              label="Foto da idealizadora"
              className="aspect-[4/5] rounded-t-full rounded-b-[2rem] ring-1 ring-white/15"
            />
          </Reveal>
          <div className="lg:col-span-7">
            <SectionHeading eyebrow={about.founder_title} title={about.founder_name} align="left" light />
            <Reveal delay={0.1} className="prose-site mt-8 text-lg text-lilac-100/85">
              {paragraphs(about.founder_bio).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </Reveal>
            <Reveal delay={0.2} className="mt-10">
              <Button asChild variant="light" size="lg">
                <Link href="/contato">Fale com a gente</Link>
              </Button>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Equipe */}
      {team.length > 0 && (
        <section className="py-24 md:py-32">
          <div className="container-site">
            <SectionHeading eyebrow="Equipe" title={about.team_title} text={about.team_text} />
            <Stagger className="mt-14 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
              {team.map((m) => (
                <StaggerItem key={m.id} className="group text-center">
                  <Media
                    src={m.photo_url}
                    alt={m.name}
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="aspect-[3/4] rounded-t-full rounded-b-3xl"
                    imgClassName="transition duration-700 group-hover:scale-105"
                  />
                  <h3 className="mt-5 font-serif text-2xl">{m.name}</h3>
                  {m.role && <p className="mt-1 text-xs tracking-[0.18em] text-mauve uppercase">{m.role}</p>}
                  {m.bio && <p className="mt-3 text-sm text-muted-foreground">{m.bio}</p>}
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      )}

      <section className={team.length ? "pb-24 md:pb-32" : "py-24 md:py-32"}>
        <Reveal className="container-site text-center">
          <Heart className="mx-auto size-8 text-rose-deep" strokeWidth={1.3} />
          <p className="mx-auto mt-6 max-w-3xl font-serif text-3xl leading-snug text-balance text-wine-800 italic md:text-5xl">
            Você também faz parte desta história.
          </p>
          <Button asChild size="lg" className="mt-10">
            <Link href="/eventos">Participe do próximo encontro</Link>
          </Button>
        </Reveal>
      </section>
    </>
  );
}
