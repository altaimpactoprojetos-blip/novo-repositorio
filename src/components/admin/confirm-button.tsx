"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, type ButtonProps } from "@/components/ui/button";
import type { ActionResult } from "@/lib/types";

/** Botão com confirmação para ações destrutivas, com feedback de sucesso/erro. */
export function ConfirmButton({
  action,
  title = "Tem certeza?",
  description = "Esta ação não pode ser desfeita.",
  confirmLabel = "Excluir",
  label,
  variant = "ghost",
  size = "icon-sm",
  onDone,
  children,
}: {
  action: () => Promise<ActionResult<unknown>>;
  title?: string;
  description?: string;
  confirmLabel?: string;
  label?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  onDone?: () => void;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant={variant}
          size={size}
          aria-label={label ?? confirmLabel}
          title={label ?? confirmLabel}
          className={variant === "ghost" ? "text-destructive hover:bg-destructive/10" : undefined}
        >
          {children ?? <Trash2 />}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            onClick={(e) => {
              e.preventDefault();
              start(async () => {
                const res = await action();
                if (res.ok) {
                  toast.success(res.message ?? "Concluído!");
                  setOpen(false);
                  onDone?.();
                } else toast.error(res.error);
              });
            }}
          >
            {pending && <Loader2 className="animate-spin" />} {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
