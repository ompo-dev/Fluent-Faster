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
  collapsed?: boolean
}

function NavItem({ icon, label, active, onClick, collapsed }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150",
        collapsed ? "justify-center px-0" : "gap-3",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
      )}
      title={collapsed ? label : undefined}
    >
      {icon}
      {!collapsed && <span>{label}</span>}
    </button>
  )
}

function NavSection({ title, children, collapsed }: { title: string; children: React.ReactNode; collapsed?: boolean }) {
  return (
    <div className="space-y-1">
      {!collapsed && (
        <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
      )}
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

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          <NavSection title="Modes" collapsed={!sidebarOpen}>
            <NavItem
              icon={<Mic className="h-4 w-4" />}
              label="Speak Faster"
              active={mode === "speak-faster"}
              onClick={() => setMode("speak-faster")}
              collapsed={!sidebarOpen}
            />
            <NavItem
              icon={<Keyboard className="h-4 w-4" />}
              label="Type to Learn"
              active={mode === "type-to-learn"}
              onClick={() => setMode("type-to-learn")}
              collapsed={!sidebarOpen}
            />
          </NavSection>

          <NavSection title="Text Source" collapsed={!sidebarOpen}>
            <NavItem
              icon={<Shuffle className="h-4 w-4" />}
              label="Random"
              active={textSource === "random"}
              onClick={() => {
                setTextSource("random")
                triggerReset()
              }}
              collapsed={!sidebarOpen}
            />
            <NavItem
              icon={<FileText className="h-4 w-4" />}
              label="My Text"
              active={textSource === "custom"}
              onClick={() => {
                setTextSource("custom")
                triggerReset()
              }}
              collapsed={!sidebarOpen}
            />
            <NavItem
              icon={<Upload className="h-4 w-4" />}
              label="Upload File"
              active={textSource === "upload"}
              onClick={() => {
                setTextSource("upload")
                triggerReset()
              }}
              collapsed={!sidebarOpen}
            />
          </NavSection>
        </nav>

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
