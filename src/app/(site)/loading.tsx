import { Emblem } from "@/components/brand/logo";

export default function Loading() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background" role="status" aria-label="Carregando">
      <Emblem className="h-14 w-auto animate-spin-slow opacity-60 [animation-duration:6s]" />
    </div>
  );
}
