import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { PostForm } from "@/components/admin/post-form";

export const metadata = { title: "Nova publicação" };

export default function NewPostPage() {
  return (
    <>
      <Link href="/admin/mensagens" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-wine-800">
        <ArrowLeft className="size-4" /> Mensagens
      </Link>
      <PageHeader title="Nova publicação" />
      <PostForm />
    </>
  );
}
