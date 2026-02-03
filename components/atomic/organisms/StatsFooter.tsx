import * as React from "react"
import { StatCard } from "@/components/atomic/molecules/StatCard"
import { ProgressIndicator } from "@/components/atomic/molecules/ProgressIndicator"
import { Gauge, Target, Clock } from "lucide-react"

interface TypingStats {
  wpm: number
  accuracy: number
  elapsedTime: number
}

interface StatsFooterProps {
  stats: TypingStats
  current: number
  total: number
  variant?: "typing" | "speaking"
}

export function StatsFooter({ stats, current, total, variant = "typing" }: StatsFooterProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <footer className="border-t border-border bg-secondary/30 px-4 py-3 md:px-6 md:py-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-0">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 md:gap-8">
          {variant === "typing" && (
            <>
              <StatCard
                icon={Gauge}
                value={stats.wpm}
                label="WPM"
                valueColor="accent"
                iconColor="text-accent"
              />
              <StatCard
                icon={Target}
                value={`${stats.accuracy}%`}
                label="Accuracy"
              />
              <StatCard
                icon={Clock}
                value={formatTime(stats.elapsedTime)}
                label=""
              />
            </>
          )}
        </div>

        <ProgressIndicator current={current} total={total} />
      </div>
    </footer>
  )
}
