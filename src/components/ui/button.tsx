import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border-2 border-foreground active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_hsl(var(--foreground))]",
  {
    variants: {
      variant: {
        default: "bg-neo-purple text-white shadow-[4px_4px_0_hsl(var(--foreground))] hover:shadow-[6px_6px_0_hsl(var(--foreground))] hover:translate-x-[-2px] hover:translate-y-[-2px]",
        destructive:
          "bg-neo-red text-white shadow-[4px_4px_0_hsl(var(--foreground))] hover:shadow-[6px_6px_0_hsl(var(--foreground))] hover:translate-x-[-2px] hover:translate-y-[-2px]",
        outline:
          "border-2 border-foreground bg-white text-foreground shadow-[4px_4px_0_hsl(var(--foreground))] hover:bg-neo-yellow hover:shadow-[6px_6px_0_hsl(var(--foreground))] hover:translate-x-[-2px] hover:translate-y-[-2px]",
        secondary:
          "bg-neo-cyan text-foreground shadow-[4px_4px_0_hsl(var(--foreground))] hover:shadow-[6px_6px_0_hsl(var(--foreground))] hover:translate-x-[-2px] hover:translate-y-[-2px]",
        ghost: "border-0 shadow-none hover:bg-neo-yellow/30 active:shadow-none active:translate-x-0 active:translate-y-0",
        link: "text-neo-blue underline-offset-4 hover:underline border-0 shadow-none active:shadow-none active:translate-x-0 active:translate-y-0",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
