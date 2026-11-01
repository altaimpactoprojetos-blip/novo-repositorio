import Image from "next/image";
import { Emblem } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

/**
 * Imagem com moldura elegante. Quando ainda não há foto cadastrada,
 * mostra um placeholder da marca (nunca uma imagem quebrada).
 */
export function Media({
  src,
  alt,
  className,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  priority,
  imgClassName,
  label,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  imgClassName?: string;
  label?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden bg-blush", className)}>
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} quality={85} className={cn("object-cover", imgClassName)} />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[radial-gradient(circle_at_30%_20%,#fff_0%,#f5e6e8_45%,#e3bcc4_100%)]">
          <Emblem className="h-16 w-auto opacity-25" />
          {label && <span className="eyebrow !text-wine-800/40">{label}</span>}
        </div>
      )}
    </div>
  );
}
