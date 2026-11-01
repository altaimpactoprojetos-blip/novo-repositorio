"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ExternalLink, Loader2, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deletePost, savePost, type PostInput } from "@/actions/posts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { POST_TYPES, type PostRow, type PostType } from "@/lib/types";
import { slugify, toLocalInput, youtubeEmbed } from "@/lib/utils";
import { ConfirmButton } from "./confirm-button";
import { Field, FormSection, SwitchRow } from "./field";
import { ImageField } from "./image-field";

export function PostForm({ post, defaultType }: { post?: PostRow; defaultType?: PostType }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [v, setV] = useState<PostInput>({
    id: post?.id,
    type: post?.type ?? defaultType ?? "testemunho",
    title: post?.title ?? "",
    slug: post?.slug ?? "",
    excerpt: post?.excerpt ?? "",
    content: post?.content ?? "",
    author_name: post?.author_name ?? "",
    author_role: post?.author_role ?? "",
    image_url: post?.image_url ?? "",
    video_url: post?.video_url ?? "",
    is_published: post?.is_published ?? true,
    is_featured: post?.is_featured ?? false,
    published_at: toLocalInput(post?.published_at ?? new Date().toISOString()),
  });
  const set = <K extends keyof PostInput>(k: K, val: PostInput[K]) => setV((s) => ({ ...s, [k]: val }));
  const text = (k: keyof PostInput) => ({
    id: k,
    value: (v[k] as string) ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(k, e.target.value as never),
    "aria-invalid": !!errors[k],
  });
  const embed = youtubeEmbed(v.video_url);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await savePost(v);
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        return void toast.error(res.error);
      }
      setErrors({});
      toast.success(res.message);
      if (!post && res.data) router.replace(`/admin/mensagens/${res.data.id}`);
      else router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3" noValidate>
      <div className="grid content-start gap-6 lg:col-span-2">
        <FormSection title="Conteúdo">
          <Field label="Tipo de publicação" htmlFor="type">
            <NativeSelect id="type" value={v.type} onChange={(e) => set("type", e.target.value as PostType)}>
              {(Object.keys(POST_TYPES) as PostType[]).map((t) => (
                <option key={t} value={t}>
                  {POST_TYPES[t].label}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Título *" htmlFor="title" error={errors.title}>
            <Input {...text("title")} />
          </Field>
          <Field label="Resumo" htmlFor="excerpt" hint="Aparece nos cards e no carrossel de depoimentos da página inicial." error={errors.excerpt}>
            <Textarea {...text("excerpt")} rows={3} maxLength={600} />
          </Field>
          <Field label="Texto completo" htmlFor="content" hint="Separe parágrafos com uma linha em branco." error={errors.content}>
            <Textarea {...text("content")} rows={12} />
          </Field>
          {(v.type === "video" || v.video_url) && (
            <Field label="Link do vídeo (YouTube ou Vimeo)" htmlFor="video_url" error={errors.video_url}>
              <Input {...text("video_url")} placeholder="https://www.youtube.com/watch?v=..." />
            </Field>
          )}
          {embed && (
            <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
              <iframe src={embed} title="Pré-visualização" className="absolute inset-0 size-full" allowFullScreen />
            </div>
          )}
        </FormSection>
        <FormSection title="Autoria">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nome" htmlFor="author_name">
              <Input {...text("author_name")} placeholder="Quem escreveu ou testemunhou" />
            </Field>
            <Field label="Descrição" htmlFor="author_role">
              <Input {...text("author_role")} placeholder="Ex.: participante da edição 2026" />
            </Field>
          </div>
        </FormSection>
      </div>
      <div className="grid content-start gap-6 lg:sticky lg:top-6">
        <FormSection title="Publicação">
          <SwitchRow title="Publicado" description="Visível no site">
            <Switch checked={v.is_published} onCheckedChange={(c) => set("is_published", c)} />
          </SwitchRow>
          <SwitchRow title="Destaque" description="Prioridade na página inicial">
            <Switch checked={v.is_featured} onCheckedChange={(c) => set("is_featured", c)} />
          </SwitchRow>
          <Field label="Data de publicação" htmlFor="published_at">
            <Input type="datetime-local" {...text("published_at")} />
          </Field>
          <Field label="Endereço (slug)" htmlFor="slug" hint={`/mensagens/${slugify(v.slug || v.title) || "..."}`}>
            <Input {...text("slug")} placeholder="gerado automaticamente" />
          </Field>
          <Button type="submit" size="lg" disabled={pending} className="w-full">
            {pending ? <Loader2 className="animate-spin" /> : <Save />} Salvar
          </Button>
          {post && (
            <div className="flex items-center justify-between">
              {post.is_published ? (
                <a href={`/mensagens/${post.slug}`} target="_blank" className="inline-flex items-center gap-1.5 text-sm text-wine-700 hover:underline">
                  <ExternalLink className="size-4" /> Ver no site
                </a>
              ) : (
                <span />
              )}
              <ConfirmButton action={deletePost.bind(null, post.id)} title="Excluir publicação?" size="sm" onDone={() => router.replace("/admin/mensagens")}>
                <Trash2 /> Excluir
              </ConfirmButton>
            </div>
          )}
        </FormSection>
        <FormSection title="Imagem">
          <ImageField
            value={v.image_url}
            onChange={(u) => set("image_url", u)}
            folder="posts"
            label="Foto ou capa"
            hint="Para testemunhos, pode ser a foto da pessoa."
          />
        </FormSection>
      </div>
    </form>
  );
}
