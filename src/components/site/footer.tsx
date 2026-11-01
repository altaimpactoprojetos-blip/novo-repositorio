import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo, Emblem } from "@/components/brand/logo";
import { FacebookIcon, InstagramIcon, WhatsAppIcon, YouTubeIcon } from "@/components/icons";
import type { SiteContent } from "@/lib/content";
import { instagramHandle, whatsappLink } from "@/lib/utils";
import { NAV } from "@/lib/nav";

export function Footer({ contact, settings }: { contact: SiteContent["contact"]; settings: SiteContent["settings"] }) {
  const wa = whatsappLink(contact.whatsapp_number, contact.whatsapp_message);
  const socials = [
    contact.instagram_url && { href: contact.instagram_url, label: "Instagram", icon: InstagramIcon },
    wa && { href: wa, label: "WhatsApp", icon: WhatsAppIcon },
    contact.youtube_url && { href: contact.youtube_url, label: "YouTube", icon: YouTubeIcon },
    contact.facebook_url && { href: contact.facebook_url, label: "Facebook", icon: FacebookIcon },
  ].filter(Boolean) as { href: string; label: string; icon: typeof InstagramIcon }[];

  return (
    <footer className="bg-wine-gradient grain relative overflow-hidden text-lilac-100">
      <Emblem variant="light" className="pointer-events-none absolute -right-24 -bottom-24 h-[26rem] w-auto animate-spin-slow opacity-[0.045]" />
      <div className="container-site relative grid gap-12 py-16 md:grid-cols-12 md:py-20">
        <div className="md:col-span-5">
          <Logo variant="light" className="h-12 md:h-14" />
          <p className="mt-6 max-w-sm font-serif text-xl leading-relaxed text-lilac-100/85 italic">{settings.footer_text}</p>
          {socials.length > 0 && (
            <div className="mt-8 flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="inline-flex size-11 items-center justify-center rounded-full border border-lilac-100/25 transition hover:-translate-y-0.5 hover:bg-lilac-50 hover:text-wine-800"
                >
                  <s.icon className="size-[18px]" />
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="md:col-span-3">
          <p className="text-[0.68rem] font-semibold tracking-[0.3em] text-champagne-light uppercase">Navegue</p>
          <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm md:grid-cols-1">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="text-lilac-100/80 transition hover:text-white">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {(contact.instagram_url || wa || contact.email || contact.address || contact.city) && (
          <div className="md:col-span-4">
            <p className="text-[0.68rem] font-semibold tracking-[0.3em] text-champagne-light uppercase">Contato</p>
            <ul className="mt-5 space-y-4 text-sm text-lilac-100/80">
              {contact.instagram_url && (
                <li className="flex items-start gap-3">
                  <InstagramIcon className="mt-0.5 size-4 shrink-0 text-champagne-light" />
                  <a href={contact.instagram_url} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                    {instagramHandle(contact.instagram_url)}
                  </a>
                </li>
              )}
              {wa && (
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 size-4 shrink-0 text-champagne-light" />
                  <a href={wa} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                    {contact.phone || contact.whatsapp_number}
                  </a>
                </li>
              )}
              {contact.email && (
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 size-4 shrink-0 text-champagne-light" />
                  <a href={`mailto:${contact.email}`} className="break-all hover:text-white">
                    {contact.email}
                  </a>
                </li>
              )}
              {(contact.address || contact.city) && (
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-champagne-light" />
                  <span>{[contact.address, contact.city].filter(Boolean).join(" — ")}</span>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
      <div className="relative border-t border-white/10">
        <div className="container-site flex flex-col items-center justify-between gap-3 py-6 text-xs text-lilac-100/60 md:flex-row">
          <p>© {new Date().getFullYear()} Mulheres com Visão · Idealizado pela Pastora Elaine Aguiar. Todos os direitos reservados.</p>
          <Link href="/admin" className="transition hover:text-lilac-100" rel="nofollow">
            Área administrativa
          </Link>
        </div>
      </div>
    </footer>
  );
}
