"use client"

import * as React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { AppProvider, useApp } from "@/lib/app-context"
import { AppSidebar } from "@/components/app-sidebar"
import SpeakFaster from "@/components/speak-faster"
import { TypeToLearn } from "@/components/type-to-learn"

function AppContent() {
  const { mode, sidebarOpen } = useApp()
  
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <main className={`flex-1 overflow-hidden transition-all duration-200 ${!sidebarOpen ? "ml-0" : ""}`}>
        {mode === "speak-faster" && <SpeakFaster />}
        {mode === "type-to-learn" && <TypeToLearn />}
      </main>
    </div>
  )
}

export default function Home() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ThemeProvider>
  )
}
