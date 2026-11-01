"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, ExternalLink, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteEvent, saveEvent, type EventInput } from "@/actions/events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { EventRow, ScheduleItem } from "@/lib/types";
import { slugify, toLocalInput } from "@/lib/utils";
import { ConfirmButton } from "./confirm-button";
import { Field, FormSection, SwitchRow } from "./field";
import { ImageField } from "./image-field";

export function EventForm({ event }: { event?: EventRow }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [v, setV] = useState<EventInput>({
    id: event?.id,
    title: event?.title ?? "",
    slug: event?.slug ?? "",
    subtitle: event?.subtitle ?? "",
    description: event?.description ?? "",
    banner_url: event?.banner_url ?? "",
    start_at: toLocalInput(event?.start_at),
    end_at: toLocalInput(event?.end_at),
    location_name: event?.location_name ?? "",
    address: event?.address ?? "",
    map_url: event?.map_url ?? "",
    schedule: (event?.schedule as ScheduleItem[]) ?? [],
    additional_info: event?.additional_info ?? "",
    price: event?.price ?? "",
    registration_url: event?.registration_url ?? "",
    whatsapp_message: event?.whatsapp_message ?? "",
    is_published: event?.is_published ?? true,
    is_finished: event?.is_finished ?? false,
    is_featured: event?.is_featured ?? false,
  });
  const set = <K extends keyof EventInput>(k: K, val: EventInput[K]) => setV((s) => ({ ...s, [k]: val }));
  const text = (k: keyof EventInput) => ({
    id: k,
    value: (v[k] as string) ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(k, e.target.value as never),
    "aria-invalid": !!errors[k],
  });

  const schedule = v.schedule ?? [];
  const setItem = (i: number, patch: Partial<ScheduleItem>) =>
    set(
      "schedule",
      schedule.map((s, k) => (k === i ? { ...s, ...patch } : s)),
    );
  const move = (i: number, d: number) => {
    const arr = [...schedule];
    const j = i + d;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    set("schedule", arr);
  };

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await saveEvent(v);
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        toast.error(res.error);
        return;
      }
      setErrors({});
      toast.success(res.message);
      if (!event && res.data) router.replace(`/admin/eventos/${res.data.id}`);
      else router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3" noValidate>
      <div className="grid content-start gap-6 lg:col-span-2">
        <FormSection title="Informações principais">
          <Field label="Nome do evento *" htmlFor="title" error={errors.title}>
            <Input {...text("title")} placeholder="Ex.: Conferência Mulheres com Visão 2027" />
          </Field>
          <Field label="Subtítulo / chamada" htmlFor="subtitle" error={errors.subtitle}>
            <Input {...text("subtitle")} placeholder="Uma frase curta que resume o evento" />
          </Field>
          <Field label="Descrição completa" htmlFor="description" hint="Separe parágrafos com uma linha em branco." error={errors.description}>
            <Textarea {...text("description")} rows={8} />
          </Field>
        </FormSection>

        <FormSection title="Data, horário e local">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Início *" htmlFor="start_at" error={errors.start_at} hint="Horário de Brasília">
              <Input type="datetime-local" {...text("start_at")} />
            </Field>
            <Field label="Término" htmlFor="end_at" error={errors.end_at} hint="Opcional">
              <Input type="datetime-local" {...text("end_at")} />
            </Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nome do local" htmlFor="location_name" error={errors.location_name}>
              <Input {...text("location_name")} placeholder="Ex.: Igreja ..." />
            </Field>
            <Field label="Endereço" htmlFor="address" error={errors.address}>
              <Input {...text("address")} placeholder="Rua, número, bairro, cidade" />
            </Field>
          </div>
          <Field label="Link do mapa (Google Maps)" htmlFor="map_url" error={errors.map_url}>
            <Input {...text("map_url")} placeholder="https://maps.app.goo.gl/..." />
          </Field>
        </FormSection>

        <FormSection title="Programação" description="Adicione os momentos do evento na ordem em que acontecem.">
          {schedule.map((s, i) => (
            <div key={i} className="grid gap-3 rounded-xl border border-border/70 bg-ivory p-4 sm:grid-cols-[7rem_1fr_auto]">
              <Input value={s.time} onChange={(e) => setItem(i, { time: e.target.value })} placeholder="19h00" aria-label="Horário" />
              <div className="grid gap-2">
                <Input
                  value={s.title}
                  onChange={(e) => setItem(i, { title: e.target.value })}
                  placeholder="Título (ex.: Louvor e adoração)"
                  aria-label="Título"
                />
                <Input
                  value={s.description ?? ""}
                  onChange={(e) => setItem(i, { description: e.target.value })}
                  placeholder="Descrição (opcional)"
                  aria-label="Descrição"
                />
              </div>
              <div className="flex gap-1 sm:flex-col">
                <Button type="button" variant="ghost" size="icon-sm" onClick={() => move(i, -1)} aria-label="Subir">
                  <ArrowUp />
                </Button>
                <Button type="button" variant="ghost" size="icon-sm" onClick={() => move(i, 1)} aria-label="Descer">
                  <ArrowDown />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive"
                  onClick={() =>
                    set(
                      "schedule",
                      schedule.filter((_, k) => k !== i),
                    )
                  }
                  aria-label="Remover"
                >
                  <Trash2 />
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => set("schedule", [...schedule, { time: "", title: "", description: "" }])}
            className="justify-self-start"
          >
            <Plus /> Adicionar item
          </Button>
        </FormSection>

        <FormSection title="Inscrição e informações adicionais">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Link de inscrição" htmlFor="registration_url" error={errors.registration_url} hint="Sympla, formulário, etc. Opcional.">
              <Input {...text("registration_url")} placeholder="https://..." />
            </Field>
            <Field label="Investimento / valor" htmlFor="price" error={errors.price}>
              <Input {...text("price")} placeholder="Ex.: Gratuito, R$ 50,00" />
            </Field>
          </div>
          <Field
            label="Mensagem automática do WhatsApp"
            htmlFor="whatsapp_message"
            hint="Texto que já aparece digitado quando a pessoa clica no botão do WhatsApp."
            error={errors.whatsapp_message}
          >
            <Input {...text("whatsapp_message")} placeholder={`Olá! Quero saber mais sobre o evento "${v.title || "..."}"`} />
          </Field>
          <Field label="Informações adicionais" htmlFor="additional_info" hint="O que levar, estacionamento, crianças, etc." error={errors.additional_info}>
            <Textarea {...text("additional_info")} rows={5} />
          </Field>
        </FormSection>
      </div>

      <div className="grid content-start gap-6 lg:sticky lg:top-6">
        <FormSection title="Publicação">
          <SwitchRow title="Publicado" description="Visível no site">
            <Switch checked={v.is_published} onCheckedChange={(c) => set("is_published", c)} />
          </SwitchRow>
          <SwitchRow title="Realizado" description="Força o status “realizado”">
            <Switch checked={v.is_finished} onCheckedChange={(c) => set("is_finished", c)} />
          </SwitchRow>
          <SwitchRow title="Destaque" description="Prioridade na página inicial">
            <Switch checked={v.is_featured} onCheckedChange={(c) => set("is_featured", c)} />
          </SwitchRow>
          <Field label="Endereço da página (slug)" htmlFor="slug" hint={`/eventos/${slugify(v.slug || v.title) || "..."}`} error={errors.slug}>
            <Input {...text("slug")} placeholder="gerado automaticamente" />
          </Field>
          <Button type="submit" size="lg" disabled={pending} className="w-full">
            {pending ? <Loader2 className="animate-spin" /> : <Save />} Salvar evento
          </Button>
          {event && (
            <div className="flex items-center justify-between">
              {event.is_published ? (
                <a href={`/eventos/${event.slug}`} target="_blank" className="inline-flex items-center gap-1.5 text-sm text-wine-700 hover:underline">
                  <ExternalLink className="size-4" /> Ver no site
                </a>
              ) : (
                <span />
              )}
              <ConfirmButton
                action={deleteEvent.bind(null, event.id)}
                title="Excluir evento?"
                description="O evento será removido permanentemente."
                size="sm"
                onDone={() => router.replace("/admin/eventos")}
              >
                <Trash2 /> Excluir
              </ConfirmButton>
            </div>
          )}
        </FormSection>
        <FormSection title="Banner">
          <ImageField
            value={v.banner_url}
            onChange={(u) => set("banner_url", u)}
            folder="events"
            label="Imagem principal"
            hint="Recomendado: 1600×900 px (horizontal)."
          />
        </FormSection>
      </div>
    </form>
  );
}
