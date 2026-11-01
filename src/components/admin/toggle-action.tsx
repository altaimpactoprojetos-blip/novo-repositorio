"use client";

import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import type { ActionResult } from "@/lib/types";

/** Interruptor que chama uma Server Action (ex.: publicar/despublicar) com atualização otimista. */
export function ToggleAction({ checked, action, label }: { checked: boolean; action: (value: boolean) => Promise<ActionResult<unknown>>; label: string }) {
  const [optimistic, setOptimistic] = useOptimistic(checked);
  const [pending, start] = useTransition();
  return (
    <Switch
      checked={optimistic}
      disabled={pending}
      aria-label={label}
      title={label}
      onCheckedChange={(v) =>
        start(async () => {
          setOptimistic(v);
          const res = await action(v);
          if (res.ok) toast.success(res.message ?? "Atualizado!");
          else toast.error(res.error);
        })
      }
    />
  );
}
