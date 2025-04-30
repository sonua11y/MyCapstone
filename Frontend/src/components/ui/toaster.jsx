import * as React from "react"
import { Toaster as Sonner } from "sonner"
import "../../styles/toaster.css";


const Toaster = React.forwardRef(({ className, ...props }, ref) => (
  <Sonner
    ref={ref}
    className={`toaster ${className || ''}`}
    {...props}
  />
))
Toaster.displayName = "Toaster"

export { Toaster } 