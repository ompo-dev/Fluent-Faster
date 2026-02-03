import * as React from "react"
import { cn } from "@/lib/utils"

interface SpeedButtonProps {
  value: number
  label: string
  active?: boolean
  onClick?: () => void
}

export function SpeedButton({ value, label, active, onClick }: SpeedButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-md px-2 py-1 md:px-3 md:py-1.5 text-xs md:text-sm font-medium transition-colors duration-150",
        active
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
      )}
    >
      {label}
    </button>
  )
}
