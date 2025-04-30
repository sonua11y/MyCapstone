import * as React from "react"
import { cva } from "class-variance-authority"
import "../styles/badge.css"

const badgeVariants = cva(
  "badge",
  {
    variants: {
      variant: {
        default: "badge-default",
        secondary: "badge-secondary",
        destructive: "badge-destructive",
        outline: "badge-outline",
        success: "badge-success",
        warning: "badge-warning",
        info: "badge-info",
      },
      size: {
        default: "badge-default-size",
        sm: "badge-sm",
        lg: "badge-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Badge = React.forwardRef(({ className, variant, size, ...props }, ref) => (
  <div
    ref={ref}
    className={badgeVariants({ variant, size, className })}
    {...props}
  />
))
Badge.displayName = "Badge"

export { Badge, badgeVariants } 