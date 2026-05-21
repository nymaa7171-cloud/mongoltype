import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "focus-ring inline-flex h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 text-sm font-semibold transition duration-200 disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-neon-green text-black shadow-glow hover:bg-neon-green/90 hover:shadow-[0_0_44px_rgba(84,255,159,0.32)]",
        secondary:
          "border border-white/10 bg-white/[0.07] text-white hover:border-neon-blue/40 hover:bg-white/[0.11] hover:shadow-blue-glow",
        ghost: "text-muted-foreground hover:bg-white/[0.07] hover:text-white",
        outline:
          "border border-neon-green/[0.35] bg-neon-green/5 text-neon-green hover:bg-neon-green/[0.12] hover:shadow-glow",
        danger:
          "border border-red-400/40 bg-red-500/15 text-red-100 hover:bg-red-500/25"
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-5 text-base",
        icon: "size-10 p-0"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
