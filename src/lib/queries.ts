import "server-only";
import { cache } from "react";
import { createPublicClient } from "./supabase/public";
import { mergeContent, type ContentKey, type SiteContent } from "./content";
import type { AlbumRow, EventRow, PhotoRow, PostRow, PostType, TeamMemberRow } from "./types";

/** Erros de rede/banco nunca derrubam o site: registramos e devolvemos vazio. */
function warn(scope: string, error: unknown) {
  if (error) console.error(`[supabase:${scope}]`, (error as { message?: string }).message ?? error);
}

export const getAllContent = cache(async (): Promise<SiteContent> => {
  const sb = createPublicClient();
  const rows: Record<string, Record<string, unknown>> = {};
  if (sb) {
    const { data, error } = await sb.from("mcv_site_content").select("key, data");
    warn("content", error);
    for (const r of data ?? []) rows[r.key] = r.data as Record<string, unknown>;
  }
  return {
    home: mergeContent("home", rows.home),
    about: mergeContent("about", rows.about),
    contact: mergeContent("contact", rows.contact),
    settings: mergeContent("settings", rows.settings),
  };
});

export async function getContent<K extends ContentKey>(key: K): Promise<SiteContent[K]> {
  return (await getAllContent())[key];
}

export const getPublishedEvents = cache(async (): Promise<EventRow[]> => {
  const sb = createPublicClient();
  if (!sb) return [];
  const { data, error } = await sb.from("mcv_events").select("*").eq("is_published", true).order("start_at", { ascending: false });
  warn("events", error);
  return (data ?? []) as EventRow[];
});

export const getEventBySlug = cache(async (slug: string): Promise<EventRow | null> => {
  const sb = createPublicClient();
  if (!sb) return null;
  const { data, error } = await sb.from("mcv_events").select("*").eq("slug", slug).eq("is_published", true).maybeSingle();
  warn("event", error);
  return (data as EventRow) ?? null;
});

export type AlbumWithMeta = AlbumRow & { photo_count: number; preview: PhotoRow[] };

export const getPublishedAlbums = cache(async (): Promise<AlbumWithMeta[]> => {
  const sb = createPublicClient();
  if (!sb) return [];
  const { data, error } = await sb
    .from("mcv_albums")
    .select("*, photos:mcv_photos(id, url, width, height, caption, position, album_id, created_at)")
    .eq("is_published", true)
    .order("album_date", { ascending: false });
  warn("albums", error);
  return ((data ?? []) as (AlbumRow & { photos: PhotoRow[] })[]).map(({ photos, ...a }) => {
    const sorted = [...(photos ?? [])].sort((x, y) => x.position - y.position);
    return { ...a, photo_count: sorted.length, preview: sorted.slice(0, 4) };
  });
});

export const getAlbumBySlug = cache(async (slug: string) => {
  const sb = createPublicClient();
  if (!sb) return null;
  const { data, error } = await sb.from("mcv_albums").select("*").eq("slug", slug).eq("is_published", true).maybeSingle();
  warn("album", error);
  if (!data) return null;
  const { data: photos, error: e2 } = await sb.from("mcv_photos").select("*").eq("album_id", data.id).order("position").order("created_at");
  warn("photos", e2);
  let event: Pick<EventRow, "title" | "slug"> | null = null;
  if (data.event_id) {
    const { data: ev } = await sb.from("mcv_events").select("title, slug").eq("id", data.event_id).eq("is_published", true).maybeSingle();
    event = ev;
  }
  return { album: data as AlbumRow, photos: (photos ?? []) as PhotoRow[], event };
});

export const getRecentPhotos = cache(async (limit = 9): Promise<(PhotoRow & { album_slug: string; album_title: string })[]> => {
  const sb = createPublicClient();
  if (!sb) return [];
  const { data, error } = await sb
    .from("mcv_photos")
    .select("*, albums:mcv_albums!inner(slug, title, is_published)")
    .eq("albums.is_published", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  warn("recent-photos", error);
  return ((data ?? []) as (PhotoRow & { albums: { slug: string; title: string } })[]).map(({ albums, ...p }) => ({
    ...p,
    album_slug: albums.slug,
    album_title: albums.title,
  }));
});

export const getPublishedPosts = cache(async (type?: PostType): Promise<PostRow[]> => {
  const sb = createPublicClient();
  if (!sb) return [];
  let q = sb.from("mcv_posts").select("*").eq("is_published", true).order("published_at", { ascending: false });
  if (type) q = q.eq("type", type);
  const { data, error } = await q;
  warn("posts", error);
  return (data ?? []) as PostRow[];
});

export const getFeaturedTestimonials = cache(async (): Promise<PostRow[]> => {
  const sb = createPublicClient();
  if (!sb) return [];
  const { data, error } = await sb
    .from("mcv_posts")
    .select("*")
    .eq("is_published", true)
    .in("type", ["testemunho", "historia"])
    .order("is_featured", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(6);
  warn("testimonials", error);
  return (data ?? []) as PostRow[];
});

export const getPostBySlug = cache(async (slug: string): Promise<PostRow | null> => {
  const sb = createPublicClient();
  if (!sb) return null;
  const { data, error } = await sb.from("mcv_posts").select("*").eq("slug", slug).eq("is_published", true).maybeSingle();
  warn("post", error);
  return (data as PostRow) ?? null;
});

export const getTeam = cache(async (): Promise<TeamMemberRow[]> => {
  const sb = createPublicClient();
  if (!sb) return [];
  const { data, error } = await sb.from("mcv_team_members").select("*").eq("is_published", true).order("position").order("created_at");
  warn("team", error);
  return (data ?? []) as TeamMemberRow[];
});

export const getAlbumsByEvent = cache(async (eventId: string): Promise<Pick<AlbumRow, "id" | "slug" | "title" | "cover_url">[]> => {
  const sb = createPublicClient();
  if (!sb) return [];
  const { data, error } = await sb.from("mcv_albums").select("id, slug, title, cover_url").eq("event_id", eventId).eq("is_published", true);
  warn("event-albums", error);
  return data ?? [];
});
