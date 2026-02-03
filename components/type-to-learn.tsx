"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { RotateCcw, PanelLeft } from "lucide-react"
import { useApp } from "@/lib/app-context"
import { PageHeader } from "@/components/atomic/molecules/PageHeader"
import { PracticeLayout } from "@/components/atomic/templates/PracticeLayout"
import { EmptyStateLayout } from "@/components/atomic/templates/EmptyStateLayout"
import { TypingArea } from "@/components/atomic/organisms/TypingArea"
import { ResultsScreen } from "@/components/atomic/organisms/ResultsScreen"
import { StatsFooter } from "@/components/atomic/organisms/StatsFooter"
import { TextInputSelector } from "@/components/atomic/organisms/TextInputSelector"
import { getRandomText } from "@/lib/app-context"

interface TypingStats {
  wpm: number
  accuracy: number
  correctChars: number
  totalChars: number
  errors: number
  elapsedTime: number
}

export function TypeToLearn() {
  const { textSource, resetKey, activeText, setActiveText, setSidebarOpen, customText, setCustomText } = useApp()
  const [text, setText] = React.useState(activeText)
  const [typedText, setTypedText] = React.useState("")
  const [isStarted, setIsStarted] = React.useState(false)
  const [isFinished, setIsFinished] = React.useState(false)
  const [startTime, setStartTime] = React.useState<number | null>(null)
  const [endTime, setEndTime] = React.useState<number | null>(null)
  const [uploadedText, setUploadedText] = React.useState("")
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  
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

    const end = endTime || Date.now()
    const elapsedTime = (end - startTime) / 1000 / 60
    
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
      elapsedTime: elapsedTime * 60,
    }
  }, [startTime, endTime, typedText, text, initialStats])

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
    if (!isFinished && typedText.length === text.length && text.length > 0) {
      setIsFinished(true)
      setEndTime(Date.now())
    }
  }, [typedText.length, text.length, isFinished])
  
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
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFinished) return
    
    const value = e.target.value
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

  const handleRandomText = () => {
    const randomText = getRandomText()
    handleTextReady(randomText)
  }

  const handleCustomTextSubmit = () => {
    if (customText.trim()) {
      handleTextReady(customText)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type === "text/plain") {
      const text = await file.text()
      setUploadedText(text)
      handleTextReady(text)
    } else if (file.type === "application/pdf") {
      const text = await file.text()
      setUploadedText(text)
      handleTextReady(text)
    }
  }

  const prevTextSourceRef = React.useRef(textSource)
  const prevResetKeyRef = React.useRef(resetKey)

  React.useEffect(() => {
    if (prevTextSourceRef.current !== textSource || prevResetKeyRef.current !== resetKey) {
      if (text) {
        setText("")
        setActiveText("")
        handleReset()
      }
    }
    prevTextSourceRef.current = textSource
    prevResetKeyRef.current = resetKey
  }, [textSource, resetKey, text, setActiveText])

  // Empty state - no text selected
  if (!text) {
    return (
      <EmptyStateLayout
        icon={PanelLeft}
        title="Type to Learn"
        subtitle="Improve your typing speed and accuracy with English texts"
        onMenuClick={() => setSidebarOpen(true)}
      >
        <TextInputSelector
          textSource={textSource}
          customText={customText}
          onCustomTextChange={setCustomText}
          onRandomText={handleRandomText}
          onCustomTextSubmit={handleCustomTextSubmit}
          onFileUpload={handleFileUpload}
          fileInputRef={fileInputRef}
          uploadedText={uploadedText}
        />
      </EmptyStateLayout>
    )
  }

  // Results screen
  if (isFinished) {
    return <ResultsScreen stats={stats} totalChars={text.length} onReset={handleReset} />
  }

  // Practice screen
  return (
    <PracticeLayout
      header={
        <PageHeader
          title="Type to Learn"
          subtitle={isStarted ? "Keep typing..." : "Click on the text and start typing"}
          onMenuClick={() => setSidebarOpen(true)}
          actions={
            <Button variant="outline" size="sm" onClick={handleReset} className="gap-2 bg-transparent flex-shrink-0">
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
          }
        />
      }
      content={
        <TypingArea
          characters={characters}
          typedText={typedText}
          isStarted={isStarted}
          inputRef={inputRef}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
        />
      }
      footer={
        <StatsFooter
          stats={stats}
          current={typedText.length}
          total={text.length}
          variant="typing"
        />
      }
    />
  )
}
