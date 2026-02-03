import * as React from "react"
import { Gauge } from "lucide-react"
import { SpeedButton } from "@/components/atomic/atoms/SpeedButton"
import { Text } from "@/components/atomic/atoms/Text"

const SPEEDS = [
  { value: 0.5, label: "0.5x" },
  { value: 1, label: "1x" },
  { value: 1.25, label: "1.25x" },
  { value: 1.5, label: "1.5x" },
  { value: 2, label: "2x" },
]

interface SpeedControlProps {
  speed: number
  onSpeedChange: (speed: number) => void
}

export function SpeedControl({ speed, onSpeedChange }: SpeedControlProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 md:gap-6">
      <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
        <Gauge className="h-4 w-4" />
        <span className="hidden sm:inline">Speed</span>
      </div>
      <div className="flex items-center gap-1.5 md:gap-2">
        {SPEEDS.map((s) => (
          <SpeedButton
            key={s.value}
            value={s.value}
            label={s.label}
            active={speed === s.value}
            onClick={() => onSpeedChange(s.value)}
          />
        ))}
      </div>
    </div>
  )
}
