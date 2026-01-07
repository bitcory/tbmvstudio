import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full border-2 border-foreground bg-white px-3 py-2 text-sm font-medium shadow-[3px_3px_0_hsl(var(--foreground))] transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:shadow-[4px_4px_0_hsl(var(--foreground))] focus-visible:border-neo-purple disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }