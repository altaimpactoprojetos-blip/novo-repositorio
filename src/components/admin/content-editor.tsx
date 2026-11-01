"use client";

import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Loader2, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { saveContent } from "@/actions/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { defaultContent, type ContentKey, type Highlight } from "@/lib/content";
import { CONTENT_SCHEMA, type FieldDef } from "@/lib/content-schema";
import { Field, FormSection } from "./field";
import { ImageField } from "./image-field";

export function ContentEditor({ section, initial }: { section: ContentKey; initial: Record<string, unknown> }) {
  const schema = CONTENT_SCHEMA[section];
  const [data, setData] = useState<Record<string, unknown>>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, start] = useTransition();
  const [dirty, setDirty] = useState(false);

  const set = (name: string, value: unknown) => {
    setData((d) => ({ ...d, [name]: value }));
    setDirty(true);
  };

  function save() {
    start(async () => {
      const res = await saveContent(section, data);
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        return void toast.error(res.error);
      }
      setErrors({});
      setDirty(false);
      toast.success(res.message);
    });
  }

  function renderField(f: FieldDef) {
    const value = data[f.name];
    const def = (defaultContent[section] as Record<string, unknown>)[f.name];
    const reset =
      typeof def === "string" && def && value !== def ? (
        <button
          type="button"
          onClick={() => set(f.name, def)}
          className="inline-flex cursor-pointer items-center gap-1 text-xs text-muted-foreground hover:text-wine-800"
        >
          <RotateCcw className="size-3" /> restaurar texto padrão
        </button>
      ) : null;

    if (f.type === "image") {
      return (
        <div key={f.name} className="max-w-sm">
          <ImageField
            value={(value as string) ?? ""}
            onChange={(u) => set(f.name, u)}
            folder={`site/${section}`}
            label={f.label}
            hint={f.hint}
            aspect={f.aspect}
          />
        </div>
      );
    }
    if (f.type === "list") {
      const items = (value as Highlight[]) ?? [];
      const update = (next: Highlight[]) => set(f.name, next);
      return (
        <div key={f.name} className="grid gap-3">
          <span className="text-[0.8rem] font-medium text-cocoa/90">{f.label}</span>
          {items.map((it, i) => (
            <div key={i} className="grid gap-2 rounded-xl border border-border/70 bg-ivory p-3 sm:grid-cols-[1fr_auto]">
              <div className="grid gap-2">
                <Input
                  value={it.title}
                  onChange={(e) => update(items.map((x, k) => (k === i ? { ...x, title: e.target.value } : x)))}
                  placeholder="Título"
                  aria-label={`Título do ${f.itemLabel}`}
                />
                <Textarea
                  value={it.text}
                  rows={2}
                  className="min-h-0"
                  onChange={(e) => update(items.map((x, k) => (k === i ? { ...x, text: e.target.value } : x)))}
                  placeholder="Texto"
                  aria-label={`Texto do ${f.itemLabel}`}
                />
              </div>
              <div className="flex gap-1 sm:flex-col">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Subir"
                  disabled={i === 0}
                  onClick={() => update(items.map((x, k) => (k === i - 1 ? items[i] : k === i ? items[i - 1] : x)))}
                >
                  <ArrowUp />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Descer"
                  disabled={i === items.length - 1}
                  onClick={() => update(items.map((x, k) => (k === i + 1 ? items[i] : k === i ? items[i + 1] : x)))}
                >
                  <ArrowDown />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Remover"
                  className="text-destructive"
                  onClick={() => update(items.filter((_, k) => k !== i))}
                >
                  <Trash2 />
                </Button>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="justify-self-start" onClick={() => update([...items, { title: "", text: "" }])}>
            <Plus /> Adicionar {f.itemLabel}
          </Button>
        </div>
      );
    }
    const common = {
      id: `${section}-${f.name}`,
      value: (value as string) ?? "",
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(f.name, e.target.value),
      "aria-invalid": !!errors[f.name],
      placeholder: "placeholder" in f ? f.placeholder : undefined,
    };
    return (
      <Field key={f.name} label={f.label} htmlFor={common.id} hint={f.hint} error={errors[f.name]}>
        {f.type === "textarea" ? <Textarea {...common} rows={f.rows ?? 4} /> : <Input {...common} type={f.type === "url" ? "url" : "text"} />}
        {reset}
      </Field>
    );
  }

  return (
    <div className="grid gap-6 pb-24">
      {schema.groups.map((g) => (
        <FormSection key={g.title} title={g.title} description={g.description}>
          {g.fields.map(renderField)}
        </FormSection>
      ))}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-white/90 backdrop-blur lg:left-72">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-8">
          <p className="text-sm text-muted-foreground">{dirty ? "Você tem alterações não salvas." : "Tudo salvo."}</p>
          <Button onClick={save} disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : <Save />} Salvar {schema.label.toLowerCase()}
          </Button>
        </div>
      </div>
    </div>
  );
}
