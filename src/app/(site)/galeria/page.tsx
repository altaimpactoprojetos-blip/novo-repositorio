import type { Metadata } from "next";
import Link from "next/link";
import { Camera, ImageIcon } from "lucide-react";
import { Media } from "@/components/site/media";
import { Reveal, Stagger, StaggerItem } from "@/components/site/motion";
import { PageHero } from "@/components/site/page-hero";
import { getPublishedAlbums } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Galeria",
  description: "Álbuns de fotos dos encontros e eventos do Mulheres com Visão.",
  alternates: { canonical: "/galeria" },
};

export default async function GaleriaPage() {
  const albums = await getPublishedAlbums();
  return (
    <>
      <PageHero
        eyebrow="Galeria de fotos"
        title="Momentos especiais"
        subtitle="Registros de fé, alegria e comunhão. Reviva cada encontro através dos nossos álbuns."
      />
      <div className="container-site py-20 md:py-28">
        {albums.length ? (
          <Stagger className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {albums.map((a, i) => {
              const cover = a.cover_url || a.preview[0]?.url;
              return (
                <StaggerItem key={a.id} className={i % 3 === 1 ? "lg:mt-16" : ""}>
                  <Link href={`/galeria/${a.slug}`} className="group block">
                    <div className="relative">
                      <Media
                        src={cover}
                        alt={a.title}
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="aspect-[4/5] rounded-[1.75rem]"
                        imgClassName="transition duration-[1.4s] ease-[var(--ease-soft)] group-hover:scale-105"
                      />
                      <div className="absolute inset-0 rounded-[1.75rem] bg-gradient-to-t from-wine-950/50 via-transparent to-transparent" />
                      <span className="glass absolute right-4 bottom-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-wine-800">
                        <Camera className="size-3.5" /> {a.photo_count} {a.photo_count === 1 ? "foto" : "fotos"}
                      </span>
                    </div>
                    <p className="mt-5 text-xs tracking-[0.2em] text-mauve uppercase">{formatDate(`${a.album_date}T12:00:00Z`)}</p>
                    <h2 className="mt-2 font-serif text-3xl leading-tight transition group-hover:italic">{a.title}</h2>
                    {a.description && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{a.description}</p>}
                  </Link>
                </StaggerItem>
              );
            })}
          </Stagger>
        ) : (
          <Reveal className="mx-auto max-w-lg text-center">
            <ImageIcon className="mx-auto size-12 text-rose-deep" strokeWidth={1.2} />
            <h2 className="mt-6 font-serif text-4xl">Álbuns em breve</h2>
            <p className="mt-4 text-muted-foreground">As fotos dos nossos encontros serão publicadas aqui.</p>
          </Reveal>
        )}
      </div>
    </>
  );
}
