import * as React from "react"
import { cn } from "@/lib/utils"

interface StatValueProps {
  value: string | number
  size?: "sm" | "md" | "lg"
  color?: "default" | "accent" | "success" | "destructive"
  className?: string
}

const sizeStyles = {
  sm: "text-base md:text-lg",
  md: "text-xl md:text-2xl",
  lg: "text-3xl",
}

const colorStyles = {
  default: "text-foreground",
  accent: "text-accent",
  success: "text-success",
  destructive: "text-destructive",
}

export function StatValue({ 
  value, 
  size = "md", 
  color = "default",
  className 
}: StatValueProps) {
  return (
    <span className={cn("font-semibold", sizeStyles[size], colorStyles[color], className)}>
      {value}
    </span>
  )
}
