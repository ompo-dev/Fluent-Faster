import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressBarProps {
  progress: number // 0-100
  className?: string
  barClassName?: string
  size?: "sm" | "md"
}

const sizeStyles = {
  sm: "h-1.5",
  md: "h-2",
}

export function ProgressBar({ 
  progress, 
  className,
  barClassName,
  size = "md"
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress))
  
  return (
    <div className={cn("w-24 md:w-32 overflow-hidden rounded-full bg-secondary", sizeStyles[size], className)}>
      <div
        className={cn("h-full bg-accent transition-all duration-150", barClassName)}
        style={{ width: `${clampedProgress}%` }}
      />
    </div>
  )
}
