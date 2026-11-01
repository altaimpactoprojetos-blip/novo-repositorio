import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Reveal } from "@/components/site/motion";
import { PageHero } from "@/components/site/page-hero";
import { ShareButton } from "@/components/site/share-button";
import { getPostBySlug } from "@/lib/queries";
import { POST_TYPES } from "@/lib/types";
import { formatDate, paragraphs, youtubeEmbed } from "@/lib/utils";

export const revalidate = 60;

/** Páginas geradas sob demanda e mantidas em cache (ISR). */
export async function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPostBySlug(slug);
  if (!p) return { title: "Mensagem não encontrada" };
  return {
    title: p.title,
    description: p.excerpt || p.content?.slice(0, 160),
    alternates: { canonical: `/mensagens/${p.slug}` },
    openGraph: { type: "article", images: p.image_url ? [p.image_url] : undefined },
  };
}

export default async function MensagemPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  const embed = youtubeEmbed(post.video_url);

  return (
    <>
      <PageHero eyebrow={POST_TYPES[post.type].label} title={post.title} subtitle={post.excerpt}>
        <p className="mt-8 text-xs tracking-[0.2em] text-lilac-100/80 uppercase">
          {post.author_name && <>{post.author_name} · </>}
          {formatDate(post.published_at)}
        </p>
      </PageHero>
      <article className="container-site max-w-3xl py-16 md:py-24">
        {embed ? (
          <Reveal className="relative mb-12 aspect-video overflow-hidden rounded-[1.75rem] bg-wine-950 shadow-2xl">
            <iframe
              src={embed}
              title={post.title}
              className="absolute inset-0 size-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </Reveal>
        ) : post.video_url ? (
          <Reveal className="mb-12 text-center">
            <a href={post.video_url} target="_blank" rel="noopener noreferrer" className="text-wine-800 underline underline-offset-4">
              Assistir ao vídeo
            </a>
          </Reveal>
        ) : (
          post.image_url && (
            <Reveal className="mb-12 overflow-hidden rounded-[1.75rem]">
              <Image
                src={post.image_url}
                alt={post.title}
                width={1400}
                height={900}
                quality={90}
                sizes="(min-width: 768px) 768px, 100vw"
                className="h-auto w-full"
              />
            </Reveal>
          )
        )}
        <Reveal
          className={`prose-site text-[1.08rem] text-cocoa/85 ${post.type === "testemunho" || post.type === "reflexao" ? "font-serif text-[1.35rem] leading-relaxed" : ""}`}
        >
          {paragraphs(post.content).map((p, i) => (
            <p key={i} className="whitespace-pre-line">
              {p}
            </p>
          ))}
        </Reveal>
        {post.author_name && (
          <div className="mt-12 flex items-center gap-4 border-t border-border pt-8">
            {post.image_url && post.type === "testemunho" && (
              <span className="relative size-14 overflow-hidden rounded-full">
                <Image src={post.image_url} alt={post.author_name} fill sizes="56px" className="object-cover" />
              </span>
            )}
            <div>
              <p className="font-serif text-2xl text-wine-800">{post.author_name}</p>
              {post.author_role && <p className="text-sm text-muted-foreground">{post.author_role}</p>}
            </div>
          </div>
        )}
        <div className="mt-12 flex items-center justify-between">
          <Link href="/mensagens" className="inline-flex items-center gap-2 text-xs tracking-[0.2em] text-wine-800 uppercase hover:underline">
            <ArrowLeft className="size-4" /> Todas as mensagens
          </Link>
          <ShareButton title={post.title} url={`/mensagens/${post.slug}`} className="text-wine-800" />
        </div>
      </article>
    </>
  );
}
