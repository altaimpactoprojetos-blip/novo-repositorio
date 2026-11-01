import Link from "next/link";
import { CalendarCheck2, CalendarClock, CalendarHeart, Camera, FileText, ImagePlus, Inbox, MessageSquareHeart, Plus } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { EVENT_STATUS_LABEL, eventStatus } from "@/lib/events";
import { createClient } from "@/lib/supabase/server";
import { POST_TYPES, type EventRow, type PostType } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const session = await requireAdmin();
  const { erro } = await searchParams;
  const supabase = await createClient();

  const [events, photos, albums, posts, unread, recentPosts, recentAlbums] = await Promise.all([
    supabase.from("mcv_events").select("id, title, slug, start_at, end_at, is_finished, is_published, updated_at").order("start_at", { ascending: false }),
    supabase.from("mcv_photos").select("id", { count: "exact", head: true }),
    supabase.from("mcv_albums").select("id", { count: "exact", head: true }),
    supabase.from("mcv_posts").select("id", { count: "exact", head: true }),
    supabase.from("mcv_contact_messages").select("id", { count: "exact", head: true }).eq("is_read", false),
    supabase.from("mcv_posts").select("id, title, type, is_published, updated_at").order("updated_at", { ascending: false }).limit(5),
    supabase.from("mcv_albums").select("id, title, is_published, updated_at").order("updated_at", { ascending: false }).limit(5),
  ]);

  const evs = (events.data ?? []) as Pick<EventRow, "id" | "title" | "slug" | "start_at" | "end_at" | "is_finished" | "is_published" | "updated_at">[];
  const upcoming = evs.filter((e) => eventStatus(e) !== "realizado");
  const done = evs.filter((e) => eventStatus(e) === "realizado");

  const stats = [
    { label: "Eventos cadastrados", value: evs.length, icon: CalendarHeart, href: "/admin/eventos" },
    { label: "Próximos eventos", value: upcoming.length, icon: CalendarClock, href: "/admin/eventos" },
    { label: "Eventos realizados", value: done.length, icon: CalendarCheck2, href: "/admin/eventos" },
    { label: "Fotos publicadas", value: photos.count ?? 0, icon: Camera, href: "/admin/galeria", sub: `${albums.count ?? 0} álbuns` },
    { label: "Mensagens e testemunhos", value: posts.count ?? 0, icon: MessageSquareHeart, href: "/admin/mensagens" },
    { label: "Contatos não lidos", value: unread.count ?? 0, icon: Inbox, href: "/admin/contatos" },
  ];

  type Activity = { id: string; title: string; kind: string; href: string; published: boolean; updated_at: string };
  const activity: Activity[] = [
    ...evs.map((e) => ({ id: e.id, title: e.title, kind: "Evento", href: `/admin/eventos/${e.id}`, published: e.is_published, updated_at: e.updated_at })),
    ...((recentPosts.data ?? []) as { id: string; title: string; type: PostType; is_published: boolean; updated_at: string }[]).map((p) => ({
      id: p.id,
      title: p.title,
      kind: POST_TYPES[p.type].label,
      href: `/admin/mensagens/${p.id}`,
      published: p.is_published,
      updated_at: p.updated_at,
    })),
    ...((recentAlbums.data ?? []) as { id: string; title: string; is_published: boolean; updated_at: string }[]).map((a) => ({
      id: a.id,
      title: a.title,
      kind: "Álbum",
      href: `/admin/galeria/${a.id}`,
      published: a.is_published,
      updated_at: a.updated_at,
    })),
  ]
    .sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at))
    .slice(0, 8);

  const hour = Number(new Intl.DateTimeFormat("pt-BR", { hour: "numeric", hour12: false, timeZone: "America/Sao_Paulo" }).format(new Date()));
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  const words = (session.admin.name || session.email.split("@")[0]).split(" ");
  const firstName = /^pastor/i.test(words[0]) && words[1] ? `${words[0]} ${words[1]}` : words[0];

  return (
    <>
      {erro === "sem-permissao" && (
        <p className="mb-6 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">Você não tem permissão para acessar aquela área.</p>
      )}
      <PageHeader title={`${greeting}, ${firstName}!`} description="Acompanhe os números do site e acesse rapidamente as principais ações.">
        <Button asChild>
          <Link href="/admin/eventos/novo">
            <Plus /> Novo evento
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/galeria">
            <ImagePlus /> Enviar fotos
          </Link>
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="group">
            <Card className="h-full p-5 transition group-hover:-translate-y-0.5 group-hover:border-wine-800/25 md:p-6">
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs leading-snug text-muted-foreground md:text-sm">{s.label}</p>
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-wine-50 text-wine-800">
                  <s.icon className="size-[18px]" strokeWidth={1.6} />
                </span>
              </div>
              <p className="mt-3 font-serif text-5xl leading-none text-wine-800">{s.value}</p>
              {s.sub && <p className="mt-2 text-xs text-muted-foreground">{s.sub}</p>}
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Últimas publicações</CardTitle>
          </CardHeader>
          <CardContent>
            {activity.length ? (
              <ul className="divide-y divide-border">
                {activity.map((a) => (
                  <li key={`${a.kind}-${a.id}`}>
                    <Link href={a.href} className="flex items-center gap-3 py-3 transition hover:text-wine-700">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{a.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {a.kind} · atualizado em{" "}
                          {formatDate(a.updated_at, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <Badge variant={a.published ? "success" : "muted"}>{a.published ? "Publicado" : "Rascunho"}</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-6 text-sm text-muted-foreground">Nada publicado ainda. Comece criando um evento ou um álbum.</p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Próximos eventos</CardTitle>
          </CardHeader>
          <CardContent>
            {upcoming.length ? (
              <ul className="space-y-3">
                {upcoming
                  .sort((a, b) => +new Date(a.start_at) - +new Date(b.start_at))
                  .slice(0, 5)
                  .map((e) => (
                    <li key={e.id}>
                      <Link href={`/admin/eventos/${e.id}`} className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-wine-50">
                        <span className="flex w-12 shrink-0 flex-col items-center rounded-lg bg-wine-800 py-1.5 text-lilac-50">
                          <span className="font-serif text-xl leading-none">
                            {formatDate(e.start_at, { day: "2-digit", month: undefined, year: undefined })}
                          </span>
                          <span className="text-[0.55rem] tracking-widest uppercase">
                            {formatDate(e.start_at, { month: "short", day: undefined, year: undefined }).replace(".", "")}
                          </span>
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">{e.title}</span>
                          <span className="text-xs text-muted-foreground">{EVENT_STATUS_LABEL[eventStatus(e)]}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="py-6 text-sm text-muted-foreground">Nenhum evento futuro cadastrado.</p>
            )}
            <div className="mt-4 grid gap-2">
              <Button asChild variant="secondary" className="w-full">
                <Link href="/admin/mensagens/novo">
                  <MessageSquareHeart /> Publicar testemunho
                </Link>
              </Button>
              <Button asChild variant="ghost" className="w-full">
                <Link href="/admin/conteudo">
                  <FileText /> Editar textos do site
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
