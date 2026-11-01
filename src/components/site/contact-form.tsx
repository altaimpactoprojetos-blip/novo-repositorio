"use client";

import { useActionState, useEffect, useRef } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { sendContact, type ContactState } from "@/actions/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm() {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendContact, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(state.message);
      formRef.current?.reset();
    } else toast.error(state.message);
  }, [state]);

  const err = (k: string) => state?.fieldErrors?.[k];

  if (state?.ok) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center" role="status">
        <CheckCircle2 className="size-14 text-wine-700" strokeWidth={1.2} />
        <h3 className="mt-6 font-serif text-3xl">Recebemos sua mensagem!</h3>
        <p className="mt-3 max-w-sm text-muted-foreground">Obrigada por escrever. Responderemos com carinho o mais breve possível.</p>
      </div>
    );
  }

  return (
    <form ref={formRef} action={action} className="grid gap-5" noValidate>
      <div className="hidden" aria-hidden>
        <label>
          Não preencha <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nome" name="name" error={err("name")}>
          <Input id="name" name="name" autoComplete="name" required maxLength={120} aria-invalid={!!err("name")} />
        </Field>
        <Field label="E-mail" name="email" error={err("email")}>
          <Input id="email" name="email" type="email" autoComplete="email" required maxLength={160} aria-invalid={!!err("email")} />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Telefone / WhatsApp (opcional)" name="phone" error={err("phone")}>
          <Input id="phone" name="phone" type="tel" autoComplete="tel" maxLength={40} />
        </Field>
        <Field label="Assunto (opcional)" name="subject" error={err("subject")}>
          <Input id="subject" name="subject" maxLength={160} />
        </Field>
      </div>
      <Field label="Mensagem" name="message" error={err("message")}>
        <Textarea id="message" name="message" rows={6} required maxLength={5000} aria-invalid={!!err("message")} />
      </Field>
      <Button type="submit" size="lg" disabled={pending} className="justify-self-start">
        {pending ? <Loader2 className="animate-spin" /> : <Send />} {pending ? "Enviando..." : "Enviar mensagem"}
      </Button>
    </form>
  );
}

function Field({ label, name, error, children }: { label: string; name: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      {children}
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
