import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { PostForm } from "@/components/admin/post-form";
import { createClient } from "@/lib/supabase/server";
import type { PostRow } from "@/lib/types";

export const metadata = { title: "Editar publicação" };

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const supabase = await createClient();
  const { data } = await supabase.from("mcv_posts").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return (
    <>
      <Link href="/admin/mensagens" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-wine-800">
        <ArrowLeft className="size-4" /> Mensagens
      </Link>
      <PageHeader title="Editar publicação" description={(data as PostRow).title} />
      <PostForm key={data.updated_at} post={data as PostRow} />
    </>
  );
}
