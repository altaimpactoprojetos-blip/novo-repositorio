import { cn } from "@/lib/utils";
import { Reveal } from "./motion";

export function SectionHeading({
  eyebrow,
  title,
  text,
  align = "center",
  light,
  className,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  align?: "center" | "left";
  light?: boolean;
  className?: string;
}) {
  return (
    <Reveal className={cn(align === "center" ? "mx-auto text-center" : "", "max-w-3xl", className)}>
      {eyebrow && (
        <div className={cn("flex items-center gap-3", align === "center" && "justify-center")}>
          <span className="h-px w-8 bg-champagne" />
          <p className={cn("eyebrow", light && "!text-champagne-light")}>{eyebrow}</p>
          {align === "center" && <span className="h-px w-8 bg-champagne" />}
        </div>
      )}
      <h2 className={cn("mt-4 font-serif text-4xl leading-[1.08] text-balance md:text-5xl lg:text-[3.4rem]", light && "!text-lilac-50")}>{title}</h2>
      {text && <p className={cn("mt-5 text-base leading-relaxed md:text-lg", light ? "text-lilac-100/80" : "text-muted-foreground")}>{text}</p>}
    </Reveal>
  );
}
