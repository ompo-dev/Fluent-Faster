"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { useApp } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import { Sun, Moon, PanelLeftClose, PanelLeft, Zap } from "lucide-react"
import { SidebarNav } from "@/components/atomic/organisms/SidebarNav"

export function AppSidebar() {
  const { mode, setMode, textSource, setTextSource, sidebarOpen, setSidebarOpen, triggerReset } = useApp()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleModeChange = (newMode: "speak-faster" | "type-to-learn") => {
    setMode(newMode)
  }

  const handleTextSourceChange = (newSource: "random" | "custom" | "upload") => {
    setTextSource(newSource)
    triggerReset()
  }

  return (
    <>
      {/* Backdrop for mobile when sidebar is expanded */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <aside 
        className={cn(
          "flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 z-50",
          // Mobile: fixed positioning, overlay when open
          "fixed md:relative",
          // Width transitions
          sidebarOpen ? "w-64" : "w-16",
          // Mobile: slide in/out from left
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Header */}
        <div className={cn(
          "flex items-center border-b border-sidebar-border py-4 transition-all duration-300",
          sidebarOpen ? "justify-between px-4" : "justify-center px-2"
        )}>
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent">
                <Zap className="h-4 w-4 text-accent-foreground" />
              </div>
              <span className="text-base font-semibold text-sidebar-foreground">FluentFaster</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="h-7 w-7 text-muted-foreground hover:text-sidebar-foreground"
          >
            {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <SidebarNav
          mode={mode}
          textSource={textSource}
          collapsed={!sidebarOpen}
          onModeChange={handleModeChange}
          onTextSourceChange={handleTextSourceChange}
        />

        {/* Theme Toggle */}
        <div className="border-t border-sidebar-border px-3 py-4">
          <Button
            variant="ghost"
            className={cn(
              "w-full text-muted-foreground hover:text-sidebar-foreground",
              sidebarOpen ? "justify-start gap-3" : "justify-center px-0"
            )}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {mounted && theme === "dark" ? (
              <>
                <Sun className="h-4 w-4" />
                {sidebarOpen && <span>Light Mode</span>}
              </>
            ) : (
              <>
                <Moon className="h-4 w-4" />
                {sidebarOpen && <span>Dark Mode</span>}
              </>
            )}
          </Button>
        </div>
      </aside>
    </>
  )
}
