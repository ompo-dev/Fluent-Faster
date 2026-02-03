import * as React from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, RotateCcw } from "lucide-react"
import { Heading } from "@/components/atomic/atoms/Heading"
import { Text } from "@/components/atomic/atoms/Text"
import { StatValue } from "@/components/atomic/atoms/StatValue"

interface TypingStats {
  wpm: number
  accuracy: number
  correctChars: number
  totalChars: number
  errors: number
  elapsedTime: number
}

interface ResultsScreenProps {
  stats: TypingStats
  totalChars: number
  onReset: () => void
}

export function ResultsScreen({ stats, totalChars, onReset }: ResultsScreenProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <Heading as="h1">Type to Learn</Heading>
            <Text variant="caption" className="mt-1">Practice complete!</Text>
          </div>
          <Button variant="outline" size="sm" onClick={onReset} className="gap-2 bg-transparent">
            <RotateCcw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 md:px-6">
        <div className="w-full max-w-lg space-y-6 md:space-y-8 text-center">
          <div className="mx-auto flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-6 w-6 md:h-8 md:w-8 text-success" />
          </div>

          <div>
            <Heading as="h2">Well Done!</Heading>
            <Text variant="muted" className="mt-2">Here are your results</Text>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <StatValue value={stats.wpm} size="lg" color="accent" />
              <Text variant="caption" className="mt-1">WPM</Text>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <StatValue value={`${stats.accuracy}%`} size="lg" />
              <Text variant="caption" className="mt-1">Accuracy</Text>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <StatValue value={formatTime(stats.elapsedTime)} size="lg" />
              <Text variant="caption" className="mt-1">Time</Text>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs md:text-sm text-muted-foreground">
            <span>{stats.correctChars} correct</span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span>{stats.errors} errors</span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span>{totalChars} total characters</span>
          </div>

          <Button onClick={onReset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Practice Again
          </Button>
        </div>
      </div>
    </div>
  )
}
