import Image from "next/image";
import Link from "next/link";
import { Camera, Images } from "lucide-react";
import { setAlbumPublished } from "@/actions/albums";
import { AlbumCreateDialog } from "@/components/admin/album-create-dialog";
import { EmptyState, PageHeader } from "@/components/admin/page-header";
import { ToggleAction } from "@/components/admin/toggle-action";
import { createClient } from "@/lib/supabase/server";
import type { AlbumRow } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Galeria" };

export default async function AdminGalleryPage() {
  const supabase = await createClient();
  const [{ data }, { data: events }] = await Promise.all([
    supabase
      .from("mcv_albums")
      .select("*, photos:mcv_photos(count), first:mcv_photos(url)")
      .order("album_date", { ascending: false })
      .limit(1, { referencedTable: "first" }),
    supabase.from("mcv_events").select("id, title, start_at").order("start_at", { ascending: false }),
  ]);
  const albums = (data ?? []) as (AlbumRow & { photos: { count: number }[]; first: { url: string }[] })[];

  return (
    <>
      <PageHeader title="Galeria de fotos" description="Crie álbuns por evento, envie várias fotos de uma vez, escolha a capa e organize a ordem de exibição.">
        <AlbumCreateDialog events={events ?? []} />
      </PageHeader>
      {albums.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((a) => {
            const cover = a.cover_url || a.first?.[0]?.url;
            const count = a.photos?.[0]?.count ?? 0;
            return (
              <div key={a.id} className="overflow-hidden rounded-2xl border border-border/70 bg-white">
                <Link href={`/admin/galeria/${a.id}`} className="group relative block aspect-[4/3] bg-blush">
                  {cover ? (
                    <Image
                      src={cover}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 33vw, 50vw"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <Images className="absolute inset-0 m-auto size-10 text-rose-deep" strokeWidth={1.3} />
                  )}
                  <span className="glass absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-wine-800">
                    <Camera className="size-3.5" /> {count}
                  </span>
                </Link>
                <div className="flex items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <Link href={`/admin/galeria/${a.id}`} className="block truncate font-serif text-xl text-wine-800 hover:underline">
                      {a.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">{formatDate(`${a.album_date}T12:00:00Z`)}</p>
                  </div>
                  <ToggleAction checked={a.is_published} action={setAlbumPublished.bind(null, a.id)} label="Publicado" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={Images} title="Nenhum álbum ainda" text="Crie um álbum para começar a publicar as fotos dos encontros.">
          <AlbumCreateDialog events={events ?? []} />
        </EmptyState>
      )}
    </>
  );
}
