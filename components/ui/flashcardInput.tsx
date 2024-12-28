import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const FlashCardInput = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex flex-1 w-full rounded-md px-3 py-2 text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
FlashCardInput.displayName = "FlashCardInput"

export { FlashCardInput }
