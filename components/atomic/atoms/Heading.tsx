import * as React from "react"
import { cn } from "@/lib/utils"

interface HeadingProps {
  as?: "h1" | "h2" | "h3"
  children: React.ReactNode
  className?: string
}

const variantStyles = {
  h1: "text-lg md:text-xl font-semibold text-foreground",
  h2: "text-xl md:text-2xl font-semibold text-foreground",
  h3: "text-lg font-medium text-foreground",
}

export function Heading({ as: Component = "h1", children, className }: HeadingProps) {
  return (
    <Component className={cn(variantStyles[Component], className)}>
      {children}
    </Component>
  )
}
