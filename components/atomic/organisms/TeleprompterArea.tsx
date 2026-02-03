import * as React from "react"
import { cn } from "@/lib/utils"

interface WordStatus {
  index: number
  expected: string
  recognized: string
  isCorrect: boolean
  timestamp: number
}

interface TeleprompterAreaProps {
  words: string[]
  currentWordIndex: number
  wordStatuses: Map<number, WordStatus>
  scrollPosition: number
  containerRef: React.RefObject<HTMLDivElement | null>
}

export function TeleprompterArea({
  words,
  currentWordIndex,
  wordStatuses,
  scrollPosition,
  containerRef
}: TeleprompterAreaProps) {
  return (
    <div className="relative flex-1 overflow-hidden">
      <div
        ref={containerRef}
        className="h-full overflow-hidden px-4 py-8 md:px-6 md:py-12"
      >
        <div
          className="mx-auto max-w-2xl transition-transform duration-300 ease-out"
          style={{ transform: `translateY(-${scrollPosition}px)` }}
        >
          <p className="text-base md:text-lg lg:text-xl leading-[2] tracking-wide">
            {words.map((word, index) => {
              const wordStatus = wordStatuses.get(index)
              const isCurrent = index === currentWordIndex
              const isPast = index < currentWordIndex

              return (
                <span
                  key={index}
                  data-word
                  className={cn(
                    "transition-colors duration-100 relative",
                    // Current word (being spoken now)
                    isCurrent && "font-bold text-accent",
                    // Correct word (green background flash)
                    wordStatus?.isCorrect === true && "text-green-600 font-bold animate-success-flash",
                    // Incorrect word (red with background)
                    wordStatus?.isCorrect === false && "text-destructive font-medium bg-destructive/10",
                    // Past words without status
                    !wordStatus && isPast && "text-muted-foreground",
                    // Future words
                    !wordStatus && !isPast && !isCurrent && "text-foreground"
                  )}
                  title={wordStatus?.isCorrect === false
                    ? `Expected: "${wordStatus.expected}" | Heard: "${wordStatus.recognized}"`
                    : undefined
                  }
                >
                  {word}
                  <span className="inline-block w-2" />
                </span>
              )
            })}
          </p>
        </div>
      </div>

      {/* Gradient overlays */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </div>
  )
}
