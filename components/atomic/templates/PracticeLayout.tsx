import * as React from "react"

interface PracticeLayoutProps {
  header: React.ReactNode
  content: React.ReactNode
  footer?: React.ReactNode
  controls?: React.ReactNode
}

export function PracticeLayout({ header, content, footer, controls }: PracticeLayoutProps) {
  return (
    <div className="flex h-full flex-col">
      {header}
      {controls}
      {content}
      {footer}
    </div>
  )
}
