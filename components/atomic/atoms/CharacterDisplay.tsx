import * as React from "react"
import { cn } from "@/lib/utils"

interface CharacterDisplayProps {
  char: string
  state: "untyped" | "correct" | "incorrect" | "current"
  showCursor?: boolean
}

export function CharacterDisplay({ char, state, showCursor }: CharacterDisplayProps) {
  const displayChar = char === " " ? "\u00A0" : char
  
  return (
    <span
      className={cn(
        "relative transition-colors duration-75",
        state === "correct" && "text-foreground",
        state === "incorrect" && "text-destructive bg-destructive/10",
        state === "untyped" && "text-muted-foreground/60",
        state === "current" && "text-accent font-medium"
      )}
    >
      {showCursor && state === "current" && (
        <span className="absolute -left-px bottom-0 top-0 w-0.5 animate-pulse bg-accent" />
      )}
      {displayChar}
    </span>
  )
}
