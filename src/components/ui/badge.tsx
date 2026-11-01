import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em]", {
  variants: {
    variant: {
      default: "bg-wine-800 text-lilac-50",
      soft: "bg-wine-50 text-wine-800",
      lilac: "bg-lilac-100 text-wine-800",
      gold: "bg-champagne-light text-wine-900",
      outline: "border border-wine-800/20 text-wine-800",
      success: "bg-emerald-50 text-emerald-800",
      muted: "bg-muted text-muted-foreground",
      glass: "glass text-wine-800",
    },
  },
  defaultVariants: { variant: "default" },
});

export function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
