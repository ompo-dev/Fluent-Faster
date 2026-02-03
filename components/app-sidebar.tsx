"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { useApp, type AppMode, type TextSource } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import {
  Mic,
  Keyboard,
  Shuffle,
  FileText,
  Upload,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeft,
  Zap,
} from "lucide-react"

interface NavItemProps {
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick?: () => void
}

function NavItem({ icon, label, active, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}

function NavSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      {children}
    </div>
  )
}

export function AppSidebar() {
  const { mode, setMode, textSource, setTextSource, sidebarOpen, setSidebarOpen, triggerReset } = useApp()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!sidebarOpen) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setSidebarOpen(true)}
        className="fixed left-4 top-4 z-50 h-8 w-8 text-muted-foreground hover:text-foreground"
      >
        <PanelLeft className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent">
            <Zap className="h-4 w-4 text-accent-foreground" />
          </div>
          <span className="text-base font-semibold text-sidebar-foreground">FluentFaster</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(false)}
          className="h-7 w-7 text-muted-foreground hover:text-sidebar-foreground"
        >
          <PanelLeftClose className="h-4 w-4" />
        </Button>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        <NavSection title="Modes">
          <NavItem
            icon={<Mic className="h-4 w-4" />}
            label="Speak Faster"
            active={mode === "speak-faster"}
            onClick={() => setMode("speak-faster")}
          />
          <NavItem
            icon={<Keyboard className="h-4 w-4" />}
            label="Type to Learn"
            active={mode === "type-to-learn"}
            onClick={() => setMode("type-to-learn")}
          />
        </NavSection>

        <NavSection title="Text Source">
          <NavItem
            icon={<Shuffle className="h-4 w-4" />}
            label="Random"
            active={textSource === "random"}
            onClick={() => {
              setTextSource("random")
              triggerReset()
            }}
          />
          <NavItem
            icon={<FileText className="h-4 w-4" />}
            label="My Text"
            active={textSource === "custom"}
            onClick={() => {
              setTextSource("custom")
              triggerReset()
            }}
          />
          <NavItem
            icon={<Upload className="h-4 w-4" />}
            label="Upload File"
            active={textSource === "upload"}
            onClick={() => {
              setTextSource("upload")
              triggerReset()
            }}
          />
        </NavSection>
      </nav>

      <div className="border-t border-sidebar-border px-3 py-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-sidebar-foreground"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {mounted && theme === "dark" ? (
            <>
              <Sun className="h-4 w-4" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="h-4 w-4" />
              <span>Dark Mode</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  )
}
