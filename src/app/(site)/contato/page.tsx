import type { Metadata } from "next";
import { Clock, Mail, MapPin } from "lucide-react";
import { InstagramIcon, WhatsAppIcon } from "@/components/icons";
import { ContactForm } from "@/components/site/contact-form";
import { Reveal } from "@/components/site/motion";
import { PageHero } from "@/components/site/page-hero";
import { getContent } from "@/lib/queries";
import { instagramHandle, whatsappLink } from "@/lib/utils";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Contato",
  description: "Fale com o Mulheres com Visão pelo Instagram, WhatsApp, e-mail ou formulário de contato.",
  alternates: { canonical: "/contato" },
};

export default async function ContatoPage() {
  const c = await getContent("contact");
  const wa = whatsappLink(c.whatsapp_number, c.whatsapp_message);

  const channels = [
    c.instagram_url && { icon: InstagramIcon, label: "Instagram oficial", value: instagramHandle(c.instagram_url), href: c.instagram_url },
    wa && { icon: WhatsAppIcon, label: "WhatsApp", value: c.phone || c.whatsapp_number, href: wa },
    c.email && { icon: Mail, label: "E-mail", value: c.email, href: `mailto:${c.email}` },
  ].filter(Boolean) as { icon: typeof Mail; label: string; value: string; href: string }[];
  const hasAside = channels.length > 0 || Boolean(c.address || c.city || c.office_hours);

  return (
    <>
      <PageHero eyebrow="Contato" title={c.title} subtitle={c.text} />
      <div className="container-site grid gap-12 py-20 md:py-28 lg:grid-cols-12">
        {hasAside && (
          <div className="space-y-4 lg:col-span-5">
            {channels.map((ch, i) => (
              <Reveal key={ch.label} delay={i * 0.08}>
                <a
                  href={ch.href}
                  target={ch.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="group flex items-center gap-5 rounded-3xl border border-border/70 bg-white p-6 transition duration-500 hover:-translate-y-0.5 hover:border-wine-800/25 hover:shadow-[0_25px_60px_-40px_rgba(76,15,40,0.55)]"
                >
                  <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-2xl bg-wine-800 text-lilac-100 transition group-hover:rotate-6">
                    <ch.icon className="size-6" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs tracking-[0.18em] text-muted-foreground uppercase">{ch.label}</span>
                    <span className="mt-1 block truncate font-serif text-2xl text-wine-800">{ch.value}</span>
                  </span>
                </a>
              </Reveal>
            ))}
            {(c.address || c.city || c.office_hours) && (
              <Reveal delay={0.25} className="space-y-4 rounded-3xl bg-blush/70 p-7">
                {(c.address || c.city) && (
                  <p className="flex gap-3 text-cocoa/80">
                    <MapPin className="mt-0.5 size-5 shrink-0 text-wine-700" />
                    <span>{[c.address, c.city].filter(Boolean).join(" — ")}</span>
                  </p>
                )}
                {c.office_hours && (
                  <p className="flex gap-3 text-cocoa/80">
                    <Clock className="mt-0.5 size-5 shrink-0 text-wine-700" />
                    <span>{c.office_hours}</span>
                  </p>
                )}
              </Reveal>
            )}
          </div>
        )}

        <Reveal delay={0.1} className={hasAside ? "lg:col-span-7" : "lg:col-span-8 lg:col-start-3"}>
          <div className="rounded-[2rem] border border-border/70 bg-white p-7 shadow-[0_40px_90px_-60px_rgba(76,15,40,0.6)] md:p-12">
            <h2 className="font-serif text-4xl">Envie uma mensagem</h2>
            <p className="mt-2 mb-8 text-muted-foreground">Preencha o formulário e responderemos o quanto antes.</p>
            <ContactForm />
          </div>
        </Reveal>
      </div>

      {c.map_embed_url && /^https:\/\/(www\.)?google\.[a-z.]+\/maps\/embed/.test(c.map_embed_url) && (
        <div className="container-site pb-24">
          <Reveal className="overflow-hidden rounded-[2rem] border border-border/70">
            <iframe
              src={c.map_embed_url}
              title="Localização"
              className="h-[420px] w-full grayscale-[30%]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Reveal>
        </div>
      )}
    </>
  );
}
