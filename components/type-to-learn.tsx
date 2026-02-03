"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useApp } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import { TextInput } from "@/components/text-input"
import { RotateCcw, Target, Gauge, Clock, CheckCircle2 } from "lucide-react"

interface TypingStats {
  wpm: number
  accuracy: number
  correctChars: number
  totalChars: number
  errors: number
  elapsedTime: number
}

export function TypeToLearn() {
  const { textSource, resetKey, activeText, setActiveText } = useApp()
  const [text, setText] = React.useState(activeText)
  const [typedText, setTypedText] = React.useState("")
  const [isStarted, setIsStarted] = React.useState(false)
  const [isFinished, setIsFinished] = React.useState(false)
  const [startTime, setStartTime] = React.useState<number | null>(null)
  const [endTime, setEndTime] = React.useState<number | null>(null)
  
  const initialStats: TypingStats = {
    wpm: 0,
    accuracy: 100,
    correctChars: 0,
    totalChars: 0,
    errors: 0,
    elapsedTime: 0,
  }

  const [stats, setStats] = React.useState<TypingStats>(initialStats)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null)

  const characters = React.useMemo(() => text.split(""), [text])

  const calculateStats = React.useCallback(() => {
    if (!startTime) return initialStats

    // Use endTime if available (frozen), otherwise current time
    const end = endTime || Date.now()
    const elapsedTime = (end - startTime) / 1000 / 60 // in minutes
    
    const typedChars = typedText.length
    let correctChars = 0
    let errors = 0

    for (let i = 0; i < typedChars; i++) {
      if (typedText[i] === text[i]) {
        correctChars++
      } else {
        errors++
      }
    }

    const wpm = elapsedTime > 0 ? Math.round((correctChars / 5) / elapsedTime) : 0
    const accuracy = typedChars > 0 ? Math.round((correctChars / typedChars) * 100) : 100

    return {
      wpm,
      accuracy,
      correctChars,
      totalChars: typedChars,
      errors,
      elapsedTime: elapsedTime * 60, // convert back to seconds
    }
  }, [startTime, endTime, typedText, text]) // Removed stats dependency

  React.useEffect(() => {
    if (isStarted && !isFinished) {
      intervalRef.current = setInterval(() => {
        setStats(calculateStats())
      }, 100)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isStarted, isFinished, calculateStats])

  React.useEffect(() => {
    // Check !isFinished to avoid infinite loop / re-runs
    if (!isFinished && typedText.length === text.length && text.length > 0) {
      setIsFinished(true)
      setEndTime(Date.now())
    }
  }, [typedText.length, text.length, isFinished])
  
  // Effect to update final stats when endTime is set
  React.useEffect(() => {
    if (endTime && isFinished) {
       setStats(calculateStats())
    }
  }, [endTime, isFinished, calculateStats])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isFinished) return

    if (!isStarted) {
      setIsStarted(true)
      setStartTime(Date.now())
    }

    // Allow normal typing
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFinished) return
    
    const value = e.target.value
    // Only allow typing forward, no backspace past what's typed
    if (value.length <= text.length) {
      setTypedText(value)
    }
  }

  const handleReset = () => {
    setTypedText("")
    setIsStarted(false)
    setIsFinished(false)
    setStartTime(null)
    setEndTime(null)
    setStats(initialStats)
    inputRef.current?.focus()
  }

  const handleTextReady = (newText: string) => {
    setText(newText)
    setActiveText(newText)
    handleReset()
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  // Track previous values to avoid resetting on mount when switching modes
  const prevTextSourceRef = React.useRef(textSource)
  const prevResetKeyRef = React.useRef(resetKey)

  React.useEffect(() => {
    // Only reset if textSource or resetKey ACTUALLY changed
    if (prevTextSourceRef.current !== textSource || prevResetKeyRef.current !== resetKey) {
      if (text) {
        setText("")
        setActiveText("")
        handleReset()
      }
    }
    // Update refs
    prevTextSourceRef.current = textSource
    prevResetKeyRef.current = resetKey
  }, [textSource, resetKey, text, setActiveText])

  const handleContainerClick = () => {
    inputRef.current?.focus()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (!text) {
    return (
      <div className="flex h-full flex-col">
        <header className="border-b border-border px-6 py-4">
          <h1 className="text-xl font-semibold text-foreground">Type to Learn</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Improve your typing speed and accuracy with English texts
          </p>
        </header>
        <div className="flex flex-1 items-center justify-center px-6">
          <div className="w-full max-w-xl">
            <TextInput onTextReady={handleTextReady} />
          </div>
        </div>
      </div>
    )
  }

  if (isFinished) {
    return (
      <div className="flex h-full flex-col">
        <header className="border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-foreground">Type to Learn</h1>
              <p className="mt-1 text-sm text-muted-foreground">Practice complete!</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleReset} className="gap-2 bg-transparent">
              <RotateCcw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        </header>

        <div className="flex flex-1 items-center justify-center px-6">
          <div className="w-full max-w-lg space-y-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Well Done!</h2>
              <p className="mt-2 text-muted-foreground">Here are your results</p>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="text-3xl font-bold text-accent">{stats.wpm}</div>
                <div className="mt-1 text-sm text-muted-foreground">WPM</div>
              </div>
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="text-3xl font-bold text-foreground">{stats.accuracy}%</div>
                <div className="mt-1 text-sm text-muted-foreground">Accuracy</div>
              </div>
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="text-3xl font-bold text-foreground">{formatTime(stats.elapsedTime)}</div>
                <div className="mt-1 text-sm text-muted-foreground">Time</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span>{stats.correctChars} correct</span>
              <span className="h-1 w-1 rounded-full bg-border" />
              <span>{stats.errors} errors</span>
              <span className="h-1 w-1 rounded-full bg-border" />
              <span>{text.length} total characters</span>
            </div>

            <Button onClick={handleReset} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Practice Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Type to Learn</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isStarted ? "Keep typing..." : "Click on the text and start typing"}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-2 bg-transparent">
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </header>

      {/* Typing Area */}
      <div
        className="flex flex-1 cursor-text items-center justify-center px-6 py-12"
        onClick={handleContainerClick}
      >
        <div className="relative w-full max-w-2xl overflow-hidden">
          {/* Hidden input */}
          <input
            ref={inputRef}
            type="text"
            value={typedText}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            className="absolute opacity-0"
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />

          {/* Display text */}
          <p className="text-xl leading-[2] tracking-wide break-words" style={{ wordBreak: "break-word", overflowWrap: "break-word" }}>
            {characters.map((char, index) => {
              const isTyped = index < typedText.length
              const isCorrect = isTyped && typedText[index] === char
              const isIncorrect = isTyped && typedText[index] !== char
              const isCurrent = index === typedText.length
              const isNewline = char === "\n"

              if (isNewline) {
                return <br key={index} />
              }

              return (
                <span
                  key={index}
                  className={cn(
                    "relative transition-colors duration-75",
                    isCorrect && "text-foreground",
                    isIncorrect && "text-destructive bg-destructive/10",
                    !isTyped && !isCurrent && "text-muted-foreground/60",
                    isCurrent && "text-accent font-medium"
                  )}
                >
                  {isCurrent && (
                    <span className="absolute -left-px bottom-0 top-0 w-0.5 animate-pulse bg-accent" />
                  )}
                  {char === " " ? "\u00A0" : char}
                </span>
              )
            })}
          </p>

          {!isStarted && (
            <p className="mt-8 text-center text-sm text-muted-foreground">
              Start typing to begin the test
            </p>
          )}
        </div>
      </div>

      {/* Stats Footer */}
      <footer className="border-t border-border bg-secondary/30 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-accent" />
              <span className="text-2xl font-semibold text-accent">{stats.wpm}</span>
              <span className="text-sm text-muted-foreground">WPM</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-semibold text-foreground">{stats.accuracy}%</span>
              <span className="text-sm text-muted-foreground">Accuracy</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-semibold text-foreground">
                {formatTime(stats.elapsedTime)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {typedText.length} / {text.length}
            </span>
            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-accent transition-all duration-150"
                style={{ width: `${(typedText.length / text.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
