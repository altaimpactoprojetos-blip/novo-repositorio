import Image from "next/image";
import Link from "next/link";
import { CalendarHeart, ExternalLink, Pencil, Plus } from "lucide-react";
import { deleteEvent, setEventFlag } from "@/actions/events";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { EmptyState, PageHeader } from "@/components/admin/page-header";
import { ToggleAction } from "@/components/admin/toggle-action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EVENT_STATUS_LABEL, eventStatus } from "@/lib/events";
import { createClient } from "@/lib/supabase/server";
import type { EventRow } from "@/lib/types";
import { formatDate, formatTime } from "@/lib/utils";

export const metadata = { title: "Eventos" };

export default async function AdminEventsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("mcv_events").select("*").order("start_at", { ascending: false });
  const events = (data ?? []) as EventRow[];

  return (
    <>
      <PageHeader
        title="Eventos"
        description="Cadastre, edite, publique e marque eventos como realizados. O site separa automaticamente próximos, em andamento e realizados pelas datas."
      >
        <Button asChild>
          <Link href="/admin/eventos/novo">
            <Plus /> Novo evento
          </Link>
        </Button>
      </PageHeader>

      {events.length ? (
        <div className="grid gap-3">
          {events.map((e) => {
            const status = eventStatus(e);
            const toggle = setEventFlag.bind(null, e.id);
            return (
              <div key={e.id} className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-white p-4 md:flex-row md:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-blush">
                    {e.banner_url ? (
                      <Image src={e.banner_url} alt="" fill sizes="80px" className="object-cover" />
                    ) : (
                      <CalendarHeart className="absolute inset-0 m-auto size-7 text-rose-deep" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={status === "realizado" ? "muted" : status === "andamento" ? "gold" : "soft"}>{EVENT_STATUS_LABEL[status]}</Badge>
                      {!e.is_published && <Badge variant="outline">Rascunho</Badge>}
                    </div>
                    <Link href={`/admin/eventos/${e.id}`} className="mt-1.5 block truncate font-serif text-2xl text-wine-800 hover:underline">
                      {e.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(e.start_at)} · {formatTime(e.start_at)}
                      {e.location_name && ` · ${e.location_name}`}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-border pt-3 md:border-0 md:pt-0">
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ToggleAction checked={e.is_published} action={toggle.bind(null, "is_published")} label="Publicado" /> Publicado
                  </label>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ToggleAction checked={e.is_finished} action={toggle.bind(null, "is_finished")} label="Realizado" /> Realizado
                  </label>
                  <div className="flex items-center gap-1">
                    {e.is_published && (
                      <Button asChild variant="ghost" size="icon-sm" title="Ver no site">
                        <a href={`/eventos/${e.slug}`} target="_blank" aria-label="Ver no site">
                          <ExternalLink />
                        </a>
                      </Button>
                    )}
                    <Button asChild variant="ghost" size="icon-sm" title="Editar">
                      <Link href={`/admin/eventos/${e.id}`} aria-label="Editar">
                        <Pencil />
                      </Link>
                    </Button>
                    <ConfirmButton
                      action={deleteEvent.bind(null, e.id)}
                      title="Excluir evento?"
                      description={`"${e.title}" será removido do site permanentemente.`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={CalendarHeart} title="Nenhum evento cadastrado" text="Crie o primeiro evento para que ele apareça no site.">
          <Button asChild>
            <Link href="/admin/eventos/novo">
              <Plus /> Criar evento
            </Link>
          </Button>
        </EmptyState>
      )}
    </>
  );
}
