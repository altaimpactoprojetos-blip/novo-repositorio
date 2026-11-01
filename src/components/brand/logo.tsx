import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = { variant?: "wine" | "light"; className?: string; priority?: boolean };

/** Logo oficial vetorizada (emblema + "Mulheres com visão"). Proporção 4288×1176. */
export function Logo({ variant = "wine", className, priority }: Props) {
  return (
    <Image
      src={variant === "wine" ? "/brand/logo-wine.svg" : "/brand/logo-light.svg"}
      alt="Mulheres com Visão"
      width={4288}
      height={1176}
      priority={priority}
      unoptimized
      className={cn("h-10 w-auto", className)}
    />
  );
}

export function Emblem({ variant = "wine", className }: Props) {
  return (
    <Image
      src={variant === "wine" ? "/brand/emblem-wine.svg" : "/brand/emblem-light.svg"}
      alt=""
      aria-hidden
      width={1160}
      height={1160}
      unoptimized
      className={cn("h-10 w-auto", className)}
    />
  );
}
