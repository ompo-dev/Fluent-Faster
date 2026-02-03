import * as React from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw } from "lucide-react"

interface ActionButtonsProps {
  isPlaying: boolean
  isFinished: boolean
  onPlay: () => void
  onPause: () => void
  onReset: () => void
  showLabels?: boolean
}

export function ActionButtons({ 
  isPlaying, 
  isFinished, 
  onPlay, 
  onPause, 
  onReset,
  showLabels = true
}: ActionButtonsProps) {
  if (isFinished) {
    return (
      <Button onClick={onReset} size="sm" className="gap-2 flex-shrink-0">
        <RotateCcw className="h-4 w-4" />
        {showLabels && <span className="hidden sm:inline">Reset</span>}
      </Button>
    )
  }

  if (isPlaying) {
    return (
      <Button onClick={onPause} size="sm" className="gap-2 flex-shrink-0">
        <Pause className="h-4 w-4" />
        {showLabels && <span className="hidden sm:inline">Pause</span>}
      </Button>
    )
  }

  return (
    <Button onClick={onPlay} size="sm" className="gap-2 flex-shrink-0">
      <Play className="h-4 w-4" />
      {showLabels && <span className="hidden sm:inline">Start</span>}
    </Button>
  )
}
