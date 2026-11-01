"use client";

import { useState, useTransition } from "react";
import { KeyRound, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { changeOwnPassword, createAdminUser, removeAdminUser, updateAdminRole, updateOwnName } from "@/actions/users";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import type { AdminUserRow } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { ConfirmButton } from "./confirm-button";
import { Field, FormSection } from "./field";

export function UsersManager({ users, currentId, isSuper, currentName }: { users: AdminUserRow[]; currentId: string; isSuper: boolean; currentName: string }) {
  const [pending, start] = useTransition();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "editor" as "admin" | "editor" });
  const [pw, setPw] = useState({ password: "", confirm: "" });
  const [name, setName] = useState(currentName);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <FormSection title="Meu perfil">
        <Field label="Nome de exibição" htmlFor="me-name">
          <div className="flex gap-2">
            <Input id="me-name" value={name} onChange={(e) => setName(e.target.value)} />
            <Button
              variant="outline"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const r = await updateOwnName(name);
                  if (r.ok) toast.success(r.message);
                  else toast.error(r.error);
                })
              }
            >
              Salvar
            </Button>
          </div>
        </Field>
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            start(async () => {
              const r = await changeOwnPassword(pw);
              if (r.ok) {
                toast.success(r.message);
                setPw({ password: "", confirm: "" });
              } else toast.error(r.error);
            });
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nova senha" htmlFor="pw1">
              <Input id="pw1" type="password" autoComplete="new-password" value={pw.password} onChange={(e) => setPw({ ...pw, password: e.target.value })} />
            </Field>
            <Field label="Confirmar senha" htmlFor="pw2">
              <Input id="pw2" type="password" autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
            </Field>
          </div>
          <Button type="submit" variant="outline" disabled={pending || !pw.password} className="justify-self-start">
            <KeyRound /> Alterar minha senha
          </Button>
        </form>
      </FormSection>

      {isSuper && (
        <FormSection
          title="Adicionar pessoa ao painel"
          description="Cria o login e define a permissão. Editoras gerenciam o conteúdo; administradoras também gerenciam usuários."
        >
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              start(async () => {
                const r = await createAdminUser(form);
                if (r.ok) {
                  toast.success(r.message);
                  setForm({ name: "", email: "", password: "", role: "editor" });
                } else toast.error(r.error);
              });
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nome" htmlFor="nu-name">
                <Input id="nu-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Field>
              <Field label="E-mail" htmlFor="nu-email">
                <Input id="nu-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </Field>
              <Field label="Senha inicial" htmlFor="nu-pw" hint="Mínimo de 8 caracteres">
                <Input id="nu-pw" type="text" autoComplete="off" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </Field>
              <Field label="Permissão" htmlFor="nu-role">
                <NativeSelect id="nu-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as "admin" | "editor" })}>
                  <option value="editor">Editora</option>
                  <option value="admin">Administradora</option>
                </NativeSelect>
              </Field>
            </div>
            <Button type="submit" disabled={pending} className="justify-self-start">
              {pending ? <Loader2 className="animate-spin" /> : <UserPlus />} Criar acesso
            </Button>
          </form>
        </FormSection>
      )}

      <div className="lg:col-span-2">
        <FormSection title="Pessoas com acesso">
          <ul className="divide-y divide-border">
            {users.map((u) => (
              <li key={u.user_id} className="flex flex-wrap items-center gap-3 py-3">
                <span className="inline-flex size-10 items-center justify-center rounded-full bg-lilac-100 font-serif text-lg text-wine-800">
                  {(u.name || u.email).charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {u.name || u.email} {u.user_id === currentId && <span className="text-xs text-muted-foreground">(você)</span>}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {u.email} · desde {formatDate(u.created_at, { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                </div>
                {isSuper && u.user_id !== currentId ? (
                  <>
                    <NativeSelect
                      aria-label="Permissão"
                      className="h-9 w-40 text-xs"
                      defaultValue={u.role}
                      onChange={(e) =>
                        start(async () => {
                          const r = await updateAdminRole(u.user_id, e.target.value as "admin" | "editor");
                          if (r.ok) toast.success(r.message);
                          else toast.error(r.error);
                        })
                      }
                    >
                      <option value="editor">Editora</option>
                      <option value="admin">Administradora</option>
                    </NativeSelect>
                    <ConfirmButton
                      action={removeAdminUser.bind(null, u.user_id)}
                      title="Remover acesso?"
                      description={`${u.email} não poderá mais entrar no painel.`}
                      confirmLabel="Remover"
                    />
                  </>
                ) : (
                  <Badge variant={u.role === "admin" ? "default" : "lilac"}>{u.role === "admin" ? "Administradora" : "Editora"}</Badge>
                )}
              </li>
            ))}
          </ul>
        </FormSection>
      </div>
    </div>
  );
}
