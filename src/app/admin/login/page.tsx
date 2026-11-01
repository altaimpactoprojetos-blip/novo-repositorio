import { Logo, Emblem } from "@/components/brand/logo";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { LoginForm } from "./login-form";

export const metadata = { title: "Entrar" };

type Props = { searchParams: Promise<{ next?: string; erro?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { next, erro } = await searchParams;
  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      <div className="bg-wine-gradient grain relative hidden flex-col justify-between overflow-hidden p-12 lg:flex">
        <Logo variant="light" className="h-14 self-start" />
        <Emblem variant="light" className="absolute -right-32 -bottom-32 h-[36rem] w-auto animate-spin-slow opacity-[0.08]" />
        <div className="relative">
          <p className="font-serif text-5xl leading-tight text-lilac-50 italic">“Onde não há visão, o povo perece.”</p>
          <p className="mt-4 text-xs tracking-[0.3em] text-champagne-light uppercase">Provérbios 29:18</p>
        </div>
      </div>
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <Logo className="mx-auto h-12 lg:hidden" />
          <p className="eyebrow mt-10 lg:mt-0">Área restrita</p>
          <h1 className="mt-3 font-serif text-5xl">Painel administrativo</h1>
          <p className="mt-3 text-sm text-muted-foreground">Entre com seu e-mail e senha para gerenciar o site.</p>
          {!isSupabaseConfigured ? (
            <div className="mt-8 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-900">
              <strong>Supabase não configurado.</strong> Defina as variáveis <code>NEXT_PUBLIC_SUPABASE_URL</code> e <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
              conforme o arquivo <code>MANUAL.md</code>.
            </div>
          ) : (
            <>
              {erro === "sem-permissao" && (
                <p className="mt-6 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">Seu usuário não tem permissão de acesso ao painel.</p>
              )}
              <LoginForm next={next} />
            </>
          )}
        </div>
      </div>
    </main>
  );
}
