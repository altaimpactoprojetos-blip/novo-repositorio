import Link from "next/link";
import { Emblem } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="bg-wine-gradient grain relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 text-center">
      <Emblem variant="light" className="h-20 w-auto opacity-80" />
      <p className="eyebrow mt-10 !text-champagne-light">Erro 404</p>
      <h1 className="mt-4 font-serif text-5xl !text-lilac-50 md:text-7xl">Página não encontrada</h1>
      <p className="mt-5 max-w-md text-lilac-100/80">O conteúdo que você procura pode ter sido movido ou não existe mais.</p>
      <Button asChild variant="light" size="lg" className="mt-10">
        <Link href="/">Voltar ao início</Link>
      </Button>
    </main>
  );
}
