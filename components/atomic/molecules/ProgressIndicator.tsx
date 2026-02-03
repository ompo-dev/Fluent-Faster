import * as React from "react"
import { ProgressBar } from "@/components/atomic/atoms/ProgressBar"
import { Text } from "@/components/atomic/atoms/Text"

interface ProgressIndicatorProps {
  current: number
  total: number
  showBar?: boolean
  className?: string
}

export function ProgressIndicator({ 
  current, 
  total, 
  showBar = true,
  className 
}: ProgressIndicatorProps) {
  const progress = total > 0 ? (current / total) * 100 : 0
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Text variant="caption" as="span">
        {current} / {total}
      </Text>
      {showBar && <ProgressBar progress={progress} />}
    </div>
  )
}
