import * as React from "react"
import { LucideIcon } from "lucide-react"
import { Heading } from "@/components/atomic/atoms/Heading"
import { Text } from "@/components/atomic/atoms/Text"

interface EmptyStateLayoutProps {
  icon: LucideIcon
  title: string
  subtitle: string
  children: React.ReactNode
  onMenuClick?: () => void
}

export function EmptyStateLayout({ 
  icon: Icon, 
  title, 
  subtitle,
  children,
  onMenuClick
}: EmptyStateLayoutProps) {
  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-border px-4 py-3 md:px-6 md:py-4">
        <div className="flex items-center gap-3">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="h-8 w-8 md:hidden flex-shrink-0 flex items-center justify-center"
            >
              <Icon className="h-4 w-4" />
            </button>
          )}
          <div className="min-w-0">
            <Heading as="h1">{title}</Heading>
            <Text variant="caption" className="mt-1">
              {subtitle}
            </Text>
          </div>
        </div>
      </header>
      <div className="flex flex-1 items-center justify-center px-4 md:px-6">
        <div className="w-full max-w-xl">
          {children}
        </div>
      </div>
    </div>
  )
}
