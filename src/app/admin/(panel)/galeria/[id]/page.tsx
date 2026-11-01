import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AlbumForm } from "@/components/admin/album-form";
import { PageHeader } from "@/components/admin/page-header";
import { PhotoManager } from "@/components/admin/photo-manager";
import { createClient } from "@/lib/supabase/server";
import type { AlbumRow, PhotoRow } from "@/lib/types";

export const metadata = { title: "Álbum" };

export default async function AdminAlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const supabase = await createClient();
  const [{ data: album }, { data: photos }, { data: events }] = await Promise.all([
    supabase.from("mcv_albums").select("*").eq("id", id).maybeSingle(),
    supabase.from("mcv_photos").select("*").eq("album_id", id).order("position").order("created_at"),
    supabase.from("mcv_events").select("id, title, start_at").order("start_at", { ascending: false }),
  ]);
  if (!album) notFound();
  const a = album as AlbumRow;

  return (
    <>
      <Link href="/admin/galeria" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-wine-800">
        <ArrowLeft className="size-4" /> Galeria
      </Link>
      <PageHeader title={a.title} description="Envie fotos, edite legendas, escolha a capa (estrela) e arraste para mudar a ordem." />
      <div className="grid gap-8">
        <AlbumForm key={a.updated_at} album={a} events={events ?? []} />
        <PhotoManager albumId={a.id} photos={(photos ?? []) as PhotoRow[]} coverUrl={a.cover_url} />
      </div>
    </>
  );
}
