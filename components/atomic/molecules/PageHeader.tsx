import * as React from "react"
import { Button } from "@/components/ui/button"
import { PanelLeft } from "lucide-react"
import { Heading } from "@/components/atomic/atoms/Heading"
import { Text } from "@/components/atomic/atoms/Text"

interface PageHeaderProps {
  title: string
  subtitle?: string
  onMenuClick?: () => void
  actions?: React.ReactNode
  showMobileMenu?: boolean
}

export function PageHeader({ 
  title, 
  subtitle, 
  onMenuClick,
  actions,
  showMobileMenu = true
}: PageHeaderProps) {
  return (
    <header className="border-b border-border px-4 py-3 md:px-6 md:py-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          {showMobileMenu && onMenuClick && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="h-8 w-8 md:hidden flex-shrink-0"
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="min-w-0">
            <Heading as="h1">{title}</Heading>
            {subtitle && (
              <Text variant="caption" className="mt-1">
                {subtitle}
              </Text>
            )}
          </div>
        </div>
        {actions && <div className="flex-shrink-0">{actions}</div>}
      </div>
    </header>
  )
}
