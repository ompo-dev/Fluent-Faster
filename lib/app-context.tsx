"use client"

import * as React from "react"

export type AppMode = "speak-faster" | "type-to-learn"
export type TextSource = "random" | "custom" | "upload"

interface AppState {
  mode: AppMode
  setMode: (mode: AppMode) => void
  textSource: TextSource
  setTextSource: (source: TextSource) => void
  customText: string
  setCustomText: (text: string) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  resetKey: number
  triggerReset: () => void
  activeText: string
  setActiveText: (text: string) => void
}

const AppContext = React.createContext<AppState | undefined>(undefined)

const sampleTexts = [
  "The quick brown fox jumps over the lazy dog. This sentence contains every letter of the English alphabet, making it perfect for typing practice. As you continue to type, focus on accuracy first, then gradually increase your speed. Remember, consistent practice is the key to improving your typing skills and overall fluency in English.",
  "Learning a new language opens doors to different cultures and perspectives. When we immerse ourselves in English through reading, speaking, and writing, we build neural pathways that make communication more natural. Practice makes perfect, and every word you type or speak brings you closer to fluency.",
  "Technology has transformed the way we learn languages. With digital tools and applications, we can practice anytime, anywhere. The key is consistency and dedication. Set aside time each day for focused practice, and you will see remarkable improvement in your English skills over time.",
  "Communication is the foundation of human connection. Whether through speech or writing, expressing ourselves clearly and confidently is essential. By practicing with texts like this one, you strengthen your ability to convey ideas effectively in English.",
  "Reading expands our vocabulary and understanding of sentence structure. As you practice typing these words, notice how sentences flow from one idea to the next. This awareness will help you become a more effective communicator in both written and spoken English.",
]

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = React.useState<AppMode>("speak-faster")
  const [textSource, setTextSource] = React.useState<TextSource>("random")
  const [customText, setCustomText] = React.useState("")
  const [sidebarOpen, setSidebarOpen] = React.useState(true)
  const [resetKey, setResetKey] = React.useState(0)
  const [activeText, setActiveText] = React.useState("")

  const triggerReset = () => setResetKey(prev => prev + 1)

  return (
    <AppContext.Provider
      value={{
        mode,
        setMode,
        textSource,
        setTextSource,
        customText,
        setCustomText,
        sidebarOpen,
        setSidebarOpen,
        resetKey,
        triggerReset,
        activeText,
        setActiveText,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = React.useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within AppProvider")
  }
  return context
}

export function getRandomText(): string {
  return sampleTexts[Math.floor(Math.random() * sampleTexts.length)]
}

export { sampleTexts }
