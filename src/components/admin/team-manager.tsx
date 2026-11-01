"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Loader2, Pencil, Plus, UserRound, Users } from "lucide-react";
import { toast } from "sonner";
import { deleteMember, reorderTeam, saveMember, type TeamInput } from "@/actions/team";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { TeamMemberRow } from "@/lib/types";
import { ConfirmButton } from "./confirm-button";
import { Field, SwitchRow } from "./field";
import { ImageField } from "./image-field";
import { EmptyState } from "./page-header";

const empty: TeamInput = { name: "", role: "", bio: "", photo_url: "", is_published: true };

export function TeamManager({ members: initial }: { members: TeamMemberRow[] }) {
  const router = useRouter();
  const [members, setMembers] = useState(initial);
  const [editing, setEditing] = useState<TeamInput | null>(null);
  const [pending, start] = useTransition();
  useEffect(() => setMembers(initial), [initial]);

  function move(i: number, d: number) {
    const j = i + d;
    if (j < 0 || j >= members.length) return;
    const next = [...members];
    [next[i], next[j]] = [next[j], next[i]];
    setMembers(next);
    start(async () => {
      const res = await reorderTeam(next.map((m) => m.id));
      if (!res.ok) toast.error(res.error);
    });
  }

  function save() {
    if (!editing) return;
    start(async () => {
      const res = await saveMember(editing);
      if (!res.ok) return void toast.error(res.error);
      toast.success(res.message);
      setEditing(null);
      router.refresh();
    });
  }

  return (
    <>
      <div className="mb-6 flex justify-end">
        <Button onClick={() => setEditing({ ...empty })}>
          <Plus /> Adicionar membro
        </Button>
      </div>
      {members.length ? (
        <ul className="grid gap-3">
          {members.map((m, i) => (
            <li key={m.id} className="flex items-center gap-4 rounded-2xl border border-border/70 bg-white p-3">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-full bg-blush">
                {m.photo_url ? (
                  <Image src={m.photo_url} alt="" fill sizes="64px" className="object-cover" />
                ) : (
                  <UserRound className="absolute inset-0 m-auto size-7 text-rose-deep" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-serif text-xl text-wine-800">{m.name}</p>
                <p className="truncate text-xs text-muted-foreground">{m.role}</p>
              </div>
              {!m.is_published && <Badge variant="outline">Oculto</Badge>}
              <div className="flex">
                <Button variant="ghost" size="icon-sm" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Subir">
                  <ArrowUp />
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={() => move(i, 1)} disabled={i === members.length - 1} aria-label="Descer">
                  <ArrowDown />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Editar"
                  onClick={() =>
                    setEditing({ id: m.id, name: m.name, role: m.role ?? "", bio: m.bio ?? "", photo_url: m.photo_url ?? "", is_published: m.is_published })
                  }
                >
                  <Pencil />
                </Button>
                <ConfirmButton
                  action={deleteMember.bind(null, m.id)}
                  title="Remover membro?"
                  description={`${m.name} será removida da página Sobre.`}
                  onDone={() => router.refresh()}
                />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon={Users} title="Nenhum membro cadastrado" text="Adicione as pessoas da equipe para exibi-las na página Sobre nós." />
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Editar membro" : "Novo membro"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
              <ImageField
                value={editing.photo_url}
                onChange={(u) => setEditing({ ...editing, photo_url: u })}
                folder="team"
                label="Foto"
                aspect="aspect-[3/4]"
              />
              <div className="grid content-start gap-4">
                <Field label="Nome *" htmlFor="tm-name">
                  <Input id="tm-name" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                </Field>
                <Field label="Função" htmlFor="tm-role">
                  <Input
                    id="tm-role"
                    value={editing.role}
                    onChange={(e) => setEditing({ ...editing, role: e.target.value })}
                    placeholder="Ex.: Coordenação de louvor"
                  />
                </Field>
                <Field label="Mini biografia" htmlFor="tm-bio">
                  <Textarea id="tm-bio" rows={3} value={editing.bio} onChange={(e) => setEditing({ ...editing, bio: e.target.value })} />
                </Field>
                <SwitchRow title="Exibir no site">
                  <Switch checked={editing.is_published} onCheckedChange={(c) => setEditing({ ...editing, is_published: c })} />
                </SwitchRow>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button onClick={save} disabled={pending}>
              {pending && <Loader2 className="animate-spin" />} Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
