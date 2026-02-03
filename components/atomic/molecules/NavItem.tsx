import * as React from "react"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface NavItemProps {
  icon: LucideIcon
  label: string
  active?: boolean
  onClick?: () => void
  collapsed?: boolean
}

export function NavItem({ icon: Icon, label, active, onClick, collapsed }: NavItemProps) {
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
      <Icon className="h-4 w-4" />
      {!collapsed && <span>{label}</span>}
    </button>
  )
}
