import Image from "next/image";
import Link from "next/link";
import { MessageSquareHeart, Pencil, Plus } from "lucide-react";
import { deletePost, setPostFlag } from "@/actions/posts";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { EmptyState, PageHeader } from "@/components/admin/page-header";
import { ToggleAction } from "@/components/admin/toggle-action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { POST_TYPES, type PostRow } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Mensagens e testemunhos" };

export default async function AdminPostsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("mcv_posts").select("*").order("published_at", { ascending: false });
  const posts = (data ?? []) as PostRow[];
  return (
    <>
      <PageHeader
        title="Mensagens e testemunhos"
        description="Publique testemunhos, histórias de transformação, mensagens de fé, reflexões e vídeos. Testemunhos e histórias publicados aparecem no carrossel da página inicial."
      >
        <Button asChild>
          <Link href="/admin/mensagens/novo">
            <Plus /> Nova publicação
          </Link>
        </Button>
      </PageHeader>
      {posts.length ? (
        <div className="grid gap-3">
          {posts.map((p) => {
            const flag = setPostFlag.bind(null, p.id);
            return (
              <div key={p.id} className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-white p-4 md:flex-row md:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-blush">
                    {p.image_url ? (
                      <Image src={p.image_url} alt="" fill sizes="64px" className="object-cover" />
                    ) : (
                      <MessageSquareHeart className="absolute inset-0 m-auto size-6 text-rose-deep" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="soft">{POST_TYPES[p.type].label}</Badge>
                      {!p.is_published && <Badge variant="outline">Rascunho</Badge>}
                    </div>
                    <Link href={`/admin/mensagens/${p.id}`} className="mt-1 block truncate font-serif text-xl text-wine-800 hover:underline">
                      {p.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(p.published_at)}
                      {p.author_name && ` · ${p.author_name}`}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-border pt-3 md:border-0 md:pt-0">
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ToggleAction checked={p.is_published} action={flag.bind(null, "is_published")} label="Publicado" /> Publicado
                  </label>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ToggleAction checked={p.is_featured} action={flag.bind(null, "is_featured")} label="Destaque" /> Destaque
                  </label>
                  <div className="flex">
                    <Button asChild variant="ghost" size="icon-sm">
                      <Link href={`/admin/mensagens/${p.id}`} aria-label="Editar">
                        <Pencil />
                      </Link>
                    </Button>
                    <ConfirmButton
                      action={deletePost.bind(null, p.id)}
                      title="Excluir publicação?"
                      description={`"${p.title}" será removida permanentemente.`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={MessageSquareHeart} title="Nenhuma publicação ainda" text="Comece publicando um testemunho ou uma mensagem de fé.">
          <Button asChild>
            <Link href="/admin/mensagens/novo">
              <Plus /> Criar publicação
            </Link>
          </Button>
        </EmptyState>
      )}
    </>
  );
}
