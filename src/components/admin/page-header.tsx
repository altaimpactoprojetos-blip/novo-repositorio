import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}>
      <div>
        <h1 className="font-serif text-4xl md:text-5xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, text, children }: { icon: React.ElementType; title: string; text?: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-wine-800/20 bg-white/60 px-6 py-16 text-center">
      <Icon className="mx-auto size-10 text-rose-deep" strokeWidth={1.3} />
      <p className="mt-4 font-serif text-2xl text-wine-800">{title}</p>
      {text && <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{text}</p>}
      {children && <div className="mt-6 flex justify-center">{children}</div>}
    </div>
  );
}
