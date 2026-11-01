"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CalendarHeart, ExternalLink, FileText, Images, Inbox, LayoutDashboard, LogOut, Menu, MessageSquareHeart, Shield, Users, X } from "lucide-react";
import { signOut } from "@/actions/auth";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/eventos", label: "Eventos", icon: CalendarHeart },
  { href: "/admin/galeria", label: "Galeria de fotos", icon: Images },
  { href: "/admin/mensagens", label: "Mensagens e testemunhos", icon: MessageSquareHeart },
  { href: "/admin/conteudo", label: "Conteúdo do site", icon: FileText },
  { href: "/admin/equipe", label: "Equipe", icon: Users },
  { href: "/admin/contatos", label: "Contatos recebidos", icon: Inbox, badge: true },
  { href: "/admin/usuarios", label: "Usuários e acesso", icon: Shield },
];

export function AdminSidebar({ name, email, role, unread }: { name: string; email: string; role: string; unread: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const nav = (
    <div className="flex h-full flex-col">
      <div className="px-6 pt-7 pb-6">
        <Link href="/admin">
          <Logo variant="light" className="h-10" />
        </Link>
        <p className="mt-3 text-[0.6rem] tracking-[0.3em] text-champagne-light uppercase">Painel administrativo</p>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3" aria-label="Painel">
        {ITEMS.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            aria-current={active(it.href) ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition",
              active(it.href) ? "bg-white/12 font-medium text-white shadow-inner" : "text-lilac-100/75 hover:bg-white/6 hover:text-white",
            )}
          >
            <it.icon className="size-[18px] shrink-0" strokeWidth={1.6} />
            <span className="flex-1">{it.label}</span>
            {it.badge && unread > 0 && <span className="rounded-full bg-champagne px-2 py-0.5 text-[0.65rem] font-bold text-wine-950">{unread}</span>}
          </Link>
        ))}
      </nav>
      <div className="space-y-1 border-t border-white/10 p-3">
        <a
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-lilac-100/75 transition hover:bg-white/6 hover:text-white"
        >
          <ExternalLink className="size-[18px]" strokeWidth={1.6} /> Ver site
        </a>
        <div className="flex items-center gap-3 rounded-xl px-4 py-3">
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-lilac-200 font-serif text-lg text-wine-800">
            {(name || email).charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-white">{name || email}</p>
            <p className="text-[0.65rem] tracking-[0.15em] text-lilac-100/60 uppercase">{role === "admin" ? "Administradora" : "Editora"}</p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="cursor-pointer rounded-lg p-2 text-lilac-100/70 transition hover:bg-white/10 hover:text-white"
              aria-label="Sair"
              title="Sair"
            >
              <LogOut className="size-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="bg-wine-gradient fixed inset-y-0 left-0 z-40 hidden w-72 lg:block">{nav}</aside>
      <div className="bg-wine-gradient sticky top-0 z-40 flex items-center justify-between px-4 py-3 lg:hidden">
        <Link href="/admin">
          <Logo variant="light" className="h-8" />
        </Link>
        <button type="button" onClick={() => setOpen(true)} className="cursor-pointer rounded-lg p-2 text-lilac-50" aria-label="Abrir menu">
          <Menu className="size-6" />
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-wine-950/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="bg-wine-gradient absolute inset-y-0 left-0 w-[85%] max-w-xs animate-in duration-300 slide-in-from-left">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute top-5 right-4 cursor-pointer rounded-lg p-2 text-lilac-50"
              aria-label="Fechar menu"
            >
              <X className="size-5" />
            </button>
            {nav}
          </aside>
        </div>
      )}
    </>
  );
}
