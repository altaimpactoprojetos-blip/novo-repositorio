import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium tracking-wide transition-all duration-300 ease-[var(--ease-soft)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_10px_30px_-12px_rgba(76,15,40,0.6)] hover:bg-wine-700 hover:shadow-[0_14px_36px_-12px_rgba(76,15,40,0.7)]",
        light: "bg-lilac-50 text-wine-800 hover:bg-white shadow-[0_10px_30px_-12px_rgba(0,0,0,0.35)]",
        outline: "border border-wine-800/25 bg-transparent text-wine-800 hover:bg-wine-800 hover:text-lilac-50 hover:border-wine-800",
        "outline-light": "border border-lilac-100/40 text-lilac-50 hover:bg-lilac-50 hover:text-wine-800",
        secondary: "bg-secondary text-secondary-foreground hover:bg-rose/60",
        ghost: "text-wine-800 hover:bg-wine-50",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        gold: "bg-champagne text-wine-950 hover:bg-champagne-light",
        link: "text-wine-800 underline-offset-4 hover:underline rounded-none px-0",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4 text-xs",
        lg: "h-13 px-8 text-[0.8rem] uppercase tracking-[0.18em]",
        icon: "size-10",
        "icon-sm": "size-8",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = "Button";

export { Button, buttonVariants };
