import * as React from "react"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface IconProps {
  icon: LucideIcon
  className?: string
  size?: "sm" | "md" | "lg"
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
}

export function Icon({ icon: IconComponent, className, size = "md" }: IconProps) {
  return <IconComponent className={cn(sizeMap[size], className)} />
}
