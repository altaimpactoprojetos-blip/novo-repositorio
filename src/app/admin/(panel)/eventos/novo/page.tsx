import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EventForm } from "@/components/admin/event-form";
import { PageHeader } from "@/components/admin/page-header";

export const metadata = { title: "Novo evento" };

export default function NewEventPage() {
  return (
    <>
      <Link href="/admin/eventos" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-wine-800">
        <ArrowLeft className="size-4" /> Eventos
      </Link>
      <PageHeader title="Novo evento" />
      <EventForm />
    </>
  );
}
