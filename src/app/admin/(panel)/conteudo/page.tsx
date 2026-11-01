import Link from "next/link";
import { ContentEditor } from "@/components/admin/content-editor";
import { PageHeader } from "@/components/admin/page-header";
import { CONTENT_KEYS, mergeContent, type ContentKey } from "@/lib/content";
import { CONTENT_SCHEMA } from "@/lib/content-schema";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata = { title: "Conteúdo do site" };

export default async function ContentPage({ searchParams }: { searchParams: Promise<{ secao?: string }> }) {
  const { secao } = await searchParams;
  const section: ContentKey = CONTENT_KEYS.includes(secao as ContentKey) ? (secao as ContentKey) : "home";
  const supabase = await createClient();
  const { data } = await supabase.from("mcv_site_content").select("data, updated_at").eq("key", section).maybeSingle();
  const merged = mergeContent(section, data?.data as Record<string, unknown>) as unknown as Record<string, unknown>;

  return (
    <>
      <PageHeader
        title="Conteúdo do site"
        description="Edite os textos, imagens e informações institucionais. As alterações aparecem no site assim que você salvar."
      />
      <nav className="mb-8 flex gap-1 overflow-x-auto rounded-full bg-muted p-1" aria-label="Seções">
        {CONTENT_KEYS.map((k) => (
          <Link
            key={k}
            href={`/admin/conteudo?secao=${k}`}
            aria-current={k === section ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition",
              k === section ? "bg-white text-wine-800 shadow-sm" : "text-muted-foreground hover:text-wine-800",
            )}
          >
            {CONTENT_SCHEMA[k].label}
          </Link>
        ))}
      </nav>
      <ContentEditor key={`${section}-${data?.updated_at ?? ""}`} section={section} initial={merged} />
    </>
  );
}
