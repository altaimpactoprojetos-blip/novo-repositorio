import type { Metadata } from "next";
import { Feather } from "lucide-react";
import { Reveal } from "@/components/site/motion";
import { PageHero } from "@/components/site/page-hero";
import { PostsBrowser } from "@/components/site/posts-browser";
import { getPublishedPosts } from "@/lib/queries";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Mensagens e testemunhos",
  description: "Testemunhos, histórias de transformação, mensagens de fé, reflexões e vídeos especiais do Mulheres com Visão.",
  alternates: { canonical: "/mensagens" },
};

export default async function MensagensPage() {
  const posts = await getPublishedPosts();
  return (
    <>
      <PageHero
        eyebrow="Mensagens e testemunhos"
        title="Palavras que florescem"
        subtitle="Testemunhos, histórias de transformação, mensagens de fé, reflexões e vídeos para alimentar o seu coração."
      />
      <div className="container-site py-20 md:py-28">
        {posts.length ? (
          <PostsBrowser posts={posts} />
        ) : (
          <Reveal className="mx-auto max-w-lg text-center">
            <Feather className="mx-auto size-12 text-rose-deep" strokeWidth={1.2} />
            <h2 className="mt-6 font-serif text-4xl">Em breve</h2>
            <p className="mt-4 text-muted-foreground">Novas mensagens e testemunhos serão publicados aqui.</p>
          </Reveal>
        )}
      </div>
    </>
  );
}
