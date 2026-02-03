import * as React from "react"
import { NavItem } from "@/components/atomic/molecules/NavItem"
import { Mic, Keyboard, Shuffle, FileText, Upload } from "lucide-react"

interface NavSection {
  title: string
  items: {
    icon: any
    label: string
    active: boolean
    onClick: () => void
  }[]
}

interface SidebarNavProps {
  mode: string
  textSource: string
  collapsed: boolean
  onModeChange: (mode: "speak-faster" | "type-to-learn") => void
  onTextSourceChange: (source: "random" | "custom" | "upload") => void
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

export function SidebarNav({ 
  mode, 
  textSource, 
  collapsed,
  onModeChange,
  onTextSourceChange
}: SidebarNavProps) {
  return (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
      <NavSection title="Modes" collapsed={collapsed}>
        <NavItem
          icon={Mic}
          label="Speak Faster"
          active={mode === "speak-faster"}
          onClick={() => onModeChange("speak-faster")}
          collapsed={collapsed}
        />
        <NavItem
          icon={Keyboard}
          label="Type to Learn"
          active={mode === "type-to-learn"}
          onClick={() => onModeChange("type-to-learn")}
          collapsed={collapsed}
        />
      </NavSection>

      <NavSection title="Text Source" collapsed={collapsed}>
        <NavItem
          icon={Shuffle}
          label="Random"
          active={textSource === "random"}
          onClick={() => onTextSourceChange("random")}
          collapsed={collapsed}
        />
        <NavItem
          icon={FileText}
          label="My Text"
          active={textSource === "custom"}
          onClick={() => onTextSourceChange("custom")}
          collapsed={collapsed}
        />
        <NavItem
          icon={Upload}
          label="Upload File"
          active={textSource === "upload"}
          onClick={() => onTextSourceChange("upload")}
          collapsed={collapsed}
        />
      </NavSection>
    </nav>
  )
}
