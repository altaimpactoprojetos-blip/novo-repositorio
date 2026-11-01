import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-28 w-full rounded-xl border border-input bg-white/80 px-4 py-3 text-sm leading-relaxed text-foreground shadow-xs transition placeholder:text-muted-foreground/70 focus-visible:border-wine-500 focus-visible:ring-4 focus-visible:ring-wine-200/50 focus-visible:outline-none disabled:opacity-50 aria-[invalid=true]:border-destructive",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
export { Textarea };
