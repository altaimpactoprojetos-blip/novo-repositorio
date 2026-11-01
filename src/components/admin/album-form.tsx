"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ExternalLink, Loader2, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteAlbum, saveAlbum, type AlbumInput } from "@/actions/albums";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { AlbumRow } from "@/lib/types";
import { formatDate, slugify } from "@/lib/utils";
import { ConfirmButton } from "./confirm-button";
import { Field, FormSection, SwitchRow } from "./field";

export function AlbumForm({ album, events }: { album: AlbumRow; events: { id: string; title: string; start_at: string }[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [v, setV] = useState<AlbumInput>({
    id: album.id,
    title: album.title,
    slug: album.slug,
    description: album.description ?? "",
    album_date: album.album_date,
    event_id: album.event_id ?? "",
    cover_url: album.cover_url ?? "",
    is_published: album.is_published,
  });
  const set = <K extends keyof AlbumInput>(k: K, val: AlbumInput[K]) => setV((s) => ({ ...s, [k]: val }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await saveAlbum(v);
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        return void toast.error(res.error);
      }
      setErrors({});
      toast.success(res.message);
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit}>
      <FormSection title="Dados do álbum">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Título *" htmlFor="title" error={errors.title}>
            <Input id="title" value={v.title} onChange={(e) => set("title", e.target.value)} />
          </Field>
          <Field label="Data" htmlFor="album_date" error={errors.album_date} hint="Os álbuns são organizados por data">
            <Input id="album_date" type="date" value={v.album_date} onChange={(e) => set("album_date", e.target.value)} />
          </Field>
        </div>
        <Field label="Descrição" htmlFor="description">
          <Textarea id="description" rows={3} value={v.description} onChange={(e) => set("description", e.target.value)} />
        </Field>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Evento associado" htmlFor="event_id">
            <NativeSelect id="event_id" value={v.event_id} onChange={(e) => set("event_id", e.target.value)}>
              <option value="">— Nenhum —</option>
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title} ({formatDate(e.start_at, { day: "2-digit", month: "2-digit", year: "numeric" })})
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Endereço (slug)" htmlFor="slug" hint={`/galeria/${slugify(v.slug || v.title)}`}>
            <Input id="slug" value={v.slug} onChange={(e) => set("slug", e.target.value)} />
          </Field>
        </div>
        <SwitchRow title="Publicado" description="Exibir este álbum na galeria do site">
          <Switch checked={v.is_published} onCheckedChange={(c) => set("is_published", c)} />
        </SwitchRow>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <Button type="submit" disabled={pending}>
              {pending ? <Loader2 className="animate-spin" /> : <Save />} Salvar álbum
            </Button>
            {album.is_published && (
              <Button asChild variant="ghost">
                <a href={`/galeria/${album.slug}`} target="_blank">
                  <ExternalLink /> Ver no site
                </a>
              </Button>
            )}
          </div>
          <ConfirmButton
            action={deleteAlbum.bind(null, album.id)}
            title="Excluir álbum?"
            description="O álbum e TODAS as suas fotos serão apagados permanentemente."
            size="sm"
            onDone={() => router.replace("/admin/galeria")}
          >
            <Trash2 /> Excluir álbum
          </ConfirmButton>
        </div>
      </FormSection>
    </form>
  );
}
