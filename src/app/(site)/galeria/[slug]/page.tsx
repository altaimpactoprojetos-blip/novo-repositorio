import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarHeart } from "lucide-react";
import { Gallery } from "@/components/site/gallery";
import { PageHero } from "@/components/site/page-hero";
import { ShareButton } from "@/components/site/share-button";
import { getAlbumBySlug } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export const revalidate = 60;

/** Páginas geradas sob demanda e mantidas em cache (ISR). */
export async function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getAlbumBySlug(slug);
  if (!data) return { title: "Álbum não encontrado" };
  const cover = data.album.cover_url || data.photos[0]?.url;
  return {
    title: data.album.title,
    description: data.album.description || `Fotos de ${data.album.title} — Mulheres com Visão`,
    alternates: { canonical: `/galeria/${slug}` },
    openGraph: { images: cover ? [cover] : undefined },
  };
}

export default async function AlbumPage({ params }: Props) {
  const { slug } = await params;
  const data = await getAlbumBySlug(slug);
  if (!data) notFound();
  const { album, photos, event } = data;

  return (
    <>
      <PageHero
        eyebrow={formatDate(`${album.album_date}T12:00:00Z`)}
        title={album.title}
        subtitle={album.description}
        image={album.cover_url || photos[0]?.url}
      >
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-lilac-100">
          <span className="text-xs tracking-[0.2em] uppercase">
            {photos.length} {photos.length === 1 ? "foto" : "fotos"}
          </span>
          {event && (
            <Link
              href={`/eventos/${event.slug}`}
              className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase underline-offset-4 hover:underline"
            >
              <CalendarHeart className="size-4" /> {event.title}
            </Link>
          )}
          <ShareButton title={album.title} url={`/galeria/${album.slug}`} className="text-lilac-100" label="Compartilhar álbum" />
        </div>
      </PageHero>
      <div className="container-site py-16 md:py-24">
        <Link href="/galeria" className="mb-10 inline-flex items-center gap-2 text-xs tracking-[0.2em] text-wine-800 uppercase hover:underline">
          <ArrowLeft className="size-4" /> Todos os álbuns
        </Link>
        {photos.length ? (
          <Gallery photos={photos} title={album.title} basePath={`/galeria/${album.slug}`} />
        ) : (
          <p className="py-20 text-center text-muted-foreground">As fotos deste álbum serão publicadas em breve.</p>
        )}
      </div>
    </>
  );
}
