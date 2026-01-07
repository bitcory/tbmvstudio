import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center border-2 border-foreground px-2.5 py-0.5 text-xs font-bold transition-all shadow-[2px_2px_0_hsl(var(--foreground))] hover:shadow-[3px_3px_0_hsl(var(--foreground))]",
  {
    variants: {
      variant: {
        default:
          "bg-neo-purple text-white",
        secondary:
          "bg-neo-cyan text-foreground",
        destructive:
          "bg-neo-red text-white",
        outline: "bg-white text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
