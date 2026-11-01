import { Inbox, Mail, Phone } from "lucide-react";
import { deleteMessage, setMessageRead } from "@/actions/messages";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { EmptyState, PageHeader } from "@/components/admin/page-header";
import { ToggleAction } from "@/components/admin/toggle-action";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import type { ContactMessageRow } from "@/lib/types";
import { formatDate, whatsappLink } from "@/lib/utils";

export const metadata = { title: "Contatos recebidos" };

export default async function ContactsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("mcv_contact_messages").select("*").order("created_at", { ascending: false }).limit(300);
  const messages = (data ?? []) as ContactMessageRow[];
  return (
    <>
      <PageHeader title="Contatos recebidos" description="Mensagens enviadas pelo formulário da página de Contato." />
      {messages.length ? (
        <div className="grid gap-3">
          {messages.map((m) => {
            const wa = m.phone ? whatsappLink(m.phone, `Olá, ${m.name.split(" ")[0]}! Aqui é do Mulheres com Visão.`) : null;
            return (
              <article
                key={m.id}
                className={`rounded-2xl border bg-white p-5 ${m.is_read ? "border-border/70" : "border-wine-300 shadow-[0_10px_30px_-20px_rgba(76,15,40,0.5)]"}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-serif text-2xl text-wine-800">{m.name}</h2>
                      {!m.is_read && <Badge variant="gold">Nova</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(m.created_at, { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      <ToggleAction checked={m.is_read} action={setMessageRead.bind(null, m.id)} label="Lida" /> Lida
                    </label>
                    <ConfirmButton action={deleteMessage.bind(null, m.id)} title="Excluir mensagem?" />
                  </div>
                </div>
                {m.subject && <p className="mt-3 text-sm font-semibold">{m.subject}</p>}
                <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-cocoa/85">{m.message}</p>
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  <a href={`mailto:${m.email}`} className="inline-flex items-center gap-1.5 text-wine-700 hover:underline">
                    <Mail className="size-4" /> {m.email}
                  </a>
                  {m.phone && (
                    <a
                      href={wa ?? `tel:${m.phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-wine-700 hover:underline"
                    >
                      <Phone className="size-4" /> {m.phone}
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={Inbox} title="Nenhuma mensagem ainda" text="Quando alguém enviar o formulário de contato, a mensagem aparecerá aqui." />
      )}
    </>
  );
}
