import Link from "next/link";
import { ArrowUpRight, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EVENT_STATUS_LABEL, eventStatus } from "@/lib/events";
import type { EventRow } from "@/lib/types";
import { dateParts, formatTime } from "@/lib/utils";
import { Media } from "./media";

export function EventCard({ event, priority }: { event: EventRow; priority?: boolean }) {
  const status = eventStatus(event);
  const d = dateParts(event.start_at);
  return (
    <Link
      href={`/eventos/${event.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-border/70 bg-white shadow-[0_20px_60px_-40px_rgba(76,15,40,0.45)] transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_30px_70px_-35px_rgba(76,15,40,0.55)]"
    >
      <div className="relative">
        <Media
          src={event.banner_url}
          alt={event.title}
          priority={priority}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="aspect-[4/3]"
          imgClassName="transition duration-[1.2s] ease-[var(--ease-soft)] group-hover:scale-105"
        />
        <div className="glass absolute top-4 left-4 flex flex-col items-center rounded-2xl px-3.5 py-2 text-center shadow-sm">
          <span className="font-serif text-3xl leading-none text-wine-800">{d.day}</span>
          <span className="text-[0.6rem] font-semibold tracking-[0.2em] text-mauve uppercase">{d.month}</span>
        </div>
        <Badge variant={status === "realizado" ? "glass" : status === "andamento" ? "gold" : "default"} className="absolute top-4 right-4">
          {status === "andamento" && <span className="size-1.5 animate-pulse rounded-full bg-wine-800" />}
          {EVENT_STATUS_LABEL[status]}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col p-6 md:p-7">
        <h3 className="font-serif text-[1.7rem] leading-tight transition group-hover:text-wine-600">{event.title}</h3>
        {event.subtitle && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{event.subtitle}</p>}
        <div className="mt-5 space-y-2 text-sm text-cocoa/75">
          <p className="flex items-center gap-2.5">
            <Clock className="size-4 text-champagne" />
            <span className="capitalize">{d.weekday}</span> · {formatTime(event.start_at)}
          </p>
          {event.location_name && (
            <p className="flex items-center gap-2.5">
              <MapPin className="size-4 text-champagne" />
              <span className="line-clamp-1">{event.location_name}</span>
            </p>
          )}
        </div>
        <span className="mt-auto inline-flex items-center gap-2 pt-6 text-[0.72rem] font-semibold tracking-[0.2em] text-wine-800 uppercase">
          Ver detalhes <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}
