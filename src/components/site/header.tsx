"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { InstagramIcon } from "@/components/icons";
import { NAV } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function Header({ instagramUrl }: { instagramUrl?: string }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const solid = scrolled && !open;
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-wine-800"
      >
        Pular para o conteúdo
      </a>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          solid ? "glass border-b border-white/60 py-2.5 shadow-[0_8px_30px_-20px_rgba(76,15,40,0.35)]" : "py-4 md:py-6",
        )}
      >
        <div className="container-site flex items-center justify-between gap-6">
          <Link href="/" className="relative z-10 shrink-0" aria-label="Mulheres com Visão — página inicial">
            <Logo variant={solid ? "wine" : "light"} priority className={cn("w-auto transition-all duration-500", solid ? "h-9 md:h-10" : "h-10 md:h-12")} />
          </Link>

          <nav aria-label="Principal" className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "relative rounded-full px-4 py-2 text-[0.78rem] font-medium tracking-[0.08em] uppercase transition-colors",
                  solid ? "text-cocoa/80 hover:text-wine-800" : "text-lilac-100/85 hover:text-white",
                  isActive(item.href) && (solid ? "text-wine-800" : "text-white"),
                )}
              >
                {item.label}
                {isActive(item.href) && (
                  <motion.span
                    layoutId="nav-dot"
                    className={cn("absolute -bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full", solid ? "bg-champagne" : "bg-champagne-light")}
                  />
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {instagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram oficial"
                className={cn(
                  "hidden size-10 items-center justify-center rounded-full border transition sm:inline-flex",
                  solid
                    ? "border-wine-800/15 text-wine-800 hover:bg-wine-800 hover:text-lilac-50"
                    : "border-lilac-100/30 text-lilac-50 hover:bg-lilac-50 hover:text-wine-800",
                )}
              >
                <InstagramIcon className="size-[18px]" />
              </a>
            )}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="menu-mobile"
              aria-label={open ? "Fechar menu" : "Abrir menu"}
              className={cn(
                "relative z-10 inline-flex size-11 items-center justify-center rounded-full transition lg:hidden",
                solid ? "bg-wine-800 text-lilac-50" : "bg-white/10 text-lilac-50 ring-1 ring-white/25 backdrop-blur",
              )}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="menu-mobile"
            initial={{ clipPath: "circle(0% at calc(100% - 44px) 44px)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 44px) 44px)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 44px) 44px)" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="bg-wine-gradient grain fixed inset-0 z-40 flex flex-col overflow-y-auto lg:hidden"
          >
            <nav aria-label="Menu" className="container-site flex flex-1 flex-col justify-center gap-1 pt-28 pb-10">
              {NAV.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.06, duration: 0.6 }}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-baseline gap-4 border-b border-white/10 py-4 font-serif text-4xl text-lilac-100 transition hover:text-white",
                      isActive(item.href) && "text-white italic",
                    )}
                  >
                    <span className="font-sans text-xs tracking-widest text-champagne-light/70">0{i + 1}</span>
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              {instagramUrl && (
                <motion.a
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex items-center gap-3 text-sm tracking-[0.2em] text-lilac-100 uppercase"
                >
                  <InstagramIcon className="size-5" /> Siga no Instagram
                </motion.a>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
