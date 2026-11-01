"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, PlayCircle, Quote } from "lucide-react";
import { POST_TYPES, type PostRow, type PostType } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

/** Lista de mensagens com filtro por categoria (sem recarregar a página). */
export function PostsBrowser({ posts }: { posts: PostRow[] }) {
  const types = useMemo(() => (Object.keys(POST_TYPES) as PostType[]).filter((t) => posts.some((p) => p.type === t)), [posts]);
  const [filter, setFilter] = useState<PostType | "todos">("todos");
  const visible = filter === "todos" ? posts : posts.filter((p) => p.type === filter);

  return (
    <>
      {types.length > 1 && (
        <div role="tablist" aria-label="Filtrar por categoria" className="mb-14 flex flex-wrap justify-center gap-2">
          {(["todos", ...types] as const).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={filter === t}
              onClick={() => setFilter(t)}
              className={cn(
                "cursor-pointer rounded-full border px-5 py-2.5 text-xs font-medium tracking-[0.12em] uppercase transition",
                filter === t ? "border-wine-800 bg-wine-800 text-lilac-50" : "border-wine-800/15 text-wine-800 hover:border-wine-800/40",
              )}
            >
              {t === "todos" ? "Todos" : POST_TYPES[t].plural}
            </button>
          ))}
        </div>
      )}
      <motion.div layout className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visible.map((p) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4 }}
            >
              <PostCard post={p} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </>
  );
}

function PostCard({ post }: { post: PostRow }) {
  const isQuote = post.type === "testemunho" && !post.image_url;
  return (
    <Link
      href={`/mensagens/${post.slug}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[1.75rem] border transition duration-500 hover:-translate-y-1 hover:shadow-[0_30px_70px_-40px_rgba(76,15,40,0.55)]",
        isQuote ? "border-transparent bg-wine-800 text-lilac-100" : "border-border/70 bg-white",
      )}
    >
      {post.image_url && (
        <div className="relative aspect-[16/10] overflow-hidden bg-blush">
          <Image
            src={post.image_url}
            alt={post.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition duration-[1.2s] group-hover:scale-105"
          />
          {post.type === "video" && (
            <span className="absolute inset-0 flex items-center justify-center bg-wine-950/25">
              <PlayCircle className="size-16 text-white drop-shadow-lg" strokeWidth={1.2} />
            </span>
          )}
        </div>
      )}
      <div className="flex flex-1 flex-col p-7">
        {isQuote && <Quote className="mb-4 size-8 text-champagne-light" strokeWidth={1.2} />}
        <p className={cn("text-[0.65rem] font-semibold tracking-[0.22em] uppercase", isQuote ? "text-champagne-light" : "text-mauve")}>
          {POST_TYPES[post.type].label} · {formatDate(post.published_at, { day: "2-digit", month: "short", year: "numeric" })}
        </p>
        <h2 className={cn("mt-3 font-serif text-[1.75rem] leading-tight", isQuote && "!text-lilac-50")}>{post.title}</h2>
        {post.excerpt && (
          <p className={cn("mt-3 line-clamp-4 text-sm leading-relaxed", isQuote ? "text-lilac-100/80" : "text-muted-foreground")}>{post.excerpt}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-6">
          {post.author_name ? <span className="text-sm font-medium">{post.author_name}</span> : <span />}
          <ArrowUpRight className="size-5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </Link>
  );
}
