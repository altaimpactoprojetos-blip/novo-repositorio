import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { EventForm } from "@/components/admin/event-form";
import { PageHeader } from "@/components/admin/page-header";
import { createClient } from "@/lib/supabase/server";
import type { EventRow } from "@/lib/types";

export const metadata = { title: "Editar evento" };

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const supabase = await createClient();
  const { data } = await supabase.from("mcv_events").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return (
    <>
      <Link href="/admin/eventos" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-wine-800">
        <ArrowLeft className="size-4" /> Eventos
      </Link>
      <PageHeader title="Editar evento" description={(data as EventRow).title} />
      <EventForm key={data.updated_at} event={data as EventRow} />
    </>
  );
}
