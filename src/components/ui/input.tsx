import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      "flex h-11 w-full rounded-xl border border-input bg-white/80 px-4 py-2 text-sm text-foreground shadow-xs transition file:border-0 file:bg-transparent file:text-sm placeholder:text-muted-foreground/70 focus-visible:border-wine-500 focus-visible:ring-4 focus-visible:ring-wine-200/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
export { Input };
