import * as React from "react"
import { CharacterDisplay } from "@/components/atomic/atoms/CharacterDisplay"
import { Text } from "@/components/atomic/atoms/Text"

interface TypingAreaProps {
  characters: string[]
  typedText: string
  isStarted: boolean
  inputRef: React.RefObject<HTMLInputElement | null>
  onInput: (e: React.ChangeEvent<HTMLInputElement>) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

export function TypingArea({
  characters,
  typedText,
  isStarted,
  inputRef,
  onInput,
  onKeyDown
}: TypingAreaProps) {
  const handleContainerClick = () => {
    inputRef.current?.focus()
  }

  return (
    <div
      className="flex flex-1 cursor-text items-center justify-center px-4 py-8 md:px-6 md:py-12"
      onClick={handleContainerClick}
    >
      <div className="relative w-full max-w-2xl overflow-hidden">
        {/* Hidden input */}
        <input
          ref={inputRef}
          type="text"
          value={typedText}
          onChange={onInput}
          onKeyDown={onKeyDown}
          className="absolute opacity-0"
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />

        {/* Display text */}
        <p className="text-base md:text-lg lg:text-xl leading-[2] tracking-wide break-words" style={{ wordBreak: "break-word", overflowWrap: "break-word" }}>
          {characters.map((char, index) => {
            const isTyped = index < typedText.length
            const isCorrect = isTyped && typedText[index] === char
            const isIncorrect = isTyped && typedText[index] !== char
            const isCurrent = index === typedText.length
            const isNewline = char === "\n"

            if (isNewline) {
              return <br key={index} />
            }

            let state: "untyped" | "correct" | "incorrect" | "current" = "untyped"
            if (isCorrect) state = "correct"
            if (isIncorrect) state = "incorrect"
            if (isCurrent) state = "current"

            return (
              <CharacterDisplay
                key={index}
                char={char}
                state={state}
                showCursor={isCurrent}
              />
            )
          })}
        </p>

        {!isStarted && (
          <Text variant="muted" className="mt-8 text-center">
            Start typing to begin the test
          </Text>
        )}
      </div>
    </div>
  )
}
