"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main className="flex min-h-[70dvh] flex-col items-center justify-center px-6 pt-24 text-center">
      <p className="eyebrow">Algo não saiu como esperado</p>
      <h1 className="mt-4 font-serif text-5xl">Ops! Ocorreu um erro</h1>
      <p className="mt-4 max-w-md text-muted-foreground">Tente novamente em instantes. Se o problema continuar, fale com a gente.</p>
      <Button onClick={reset} size="lg" className="mt-8">
        Tentar novamente
      </Button>
    </main>
  );
}
