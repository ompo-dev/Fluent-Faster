import * as React from "react"
import { cn } from "@/lib/utils"

interface TextProps {
  variant?: "body" | "caption" | "muted"
  children: React.ReactNode
  className?: string
  as?: "p" | "span" | "div"
}

const variantStyles = {
  body: "text-sm md:text-base text-foreground",
  caption: "text-xs md:text-sm text-muted-foreground",
  muted: "text-xs md:text-sm text-muted-foreground",
}

export function Text({ 
  variant = "body", 
  children, 
  className,
  as: Component = "p" 
}: TextProps) {
  return (
    <Component className={cn(variantStyles[variant], className)}>
      {children}
    </Component>
  )
}
