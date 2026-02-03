import * as React from "react"
import { LucideIcon } from "lucide-react"
import { StatValue } from "@/components/atomic/atoms/StatValue"
import { Text } from "@/components/atomic/atoms/Text"

interface StatCardProps {
  icon: LucideIcon
  value: string | number
  label: string
  valueColor?: "default" | "accent" | "success" | "destructive"
  iconColor?: string
  size?: "sm" | "md" | "lg"
}

export function StatCard({ 
  icon: Icon, 
  value, 
  label, 
  valueColor = "default",
  iconColor = "text-muted-foreground",
  size = "md"
}: StatCardProps) {
  return (
    <div className="flex items-center gap-2">
      <Icon className={`h-4 w-4 ${iconColor}`} />
      <StatValue value={value} color={valueColor} size={size} />
      <Text variant="caption" as="span">{label}</Text>
    </div>
  )
}
