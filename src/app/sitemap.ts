import type { MetadataRoute } from "next";
import { getPublishedAlbums, getPublishedEvents, getPublishedPosts } from "@/lib/queries";
import { siteUrl } from "@/lib/utils";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [events, albums, posts] = await Promise.all([getPublishedEvents(), getPublishedAlbums(), getPublishedPosts()]);
  const pages = ["", "/sobre", "/eventos", "/galeria", "/mensagens", "/contato"].map((p) => ({
    url: `${siteUrl}${p}`,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.8,
  }));
  return [
    ...pages,
    ...events.map((e) => ({ url: `${siteUrl}/eventos/${e.slug}`, lastModified: e.updated_at, priority: 0.7 })),
    ...albums.map((a) => ({ url: `${siteUrl}/galeria/${a.slug}`, lastModified: a.updated_at, priority: 0.6 })),
    ...posts.map((p) => ({ url: `${siteUrl}/mensagens/${p.slug}`, lastModified: p.updated_at, priority: 0.6 })),
  ];
}
