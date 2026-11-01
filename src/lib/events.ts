import type { EventRow } from "./types";

export type EventStatus = "proximo" | "andamento" | "realizado";

export const EVENT_STATUS_LABEL: Record<EventStatus, string> = {
  proximo: "Próximo evento",
  andamento: "Acontecendo agora",
  realizado: "Realizado",
};

/** Status calculado pelas datas + marcação manual de "realizado". */
export function eventStatus(e: Pick<EventRow, "start_at" | "end_at" | "is_finished">, now = new Date()): EventStatus {
  if (e.is_finished) return "realizado";
  const start = new Date(e.start_at);
  const end = e.end_at ? new Date(e.end_at) : new Date(start.getTime() + 6 * 60 * 60 * 1000);
  if (now < start) return "proximo";
  if (now <= end) return "andamento";
  return "realizado";
}

export function groupEvents(events: EventRow[]) {
  const groups: Record<EventStatus, EventRow[]> = { proximo: [], andamento: [], realizado: [] };
  for (const e of events) groups[eventStatus(e)].push(e);
  groups.proximo.sort((a, b) => +new Date(a.start_at) - +new Date(b.start_at));
  groups.andamento.sort((a, b) => +new Date(a.start_at) - +new Date(b.start_at));
  groups.realizado.sort((a, b) => +new Date(b.start_at) - +new Date(a.start_at));
  return groups;
}
