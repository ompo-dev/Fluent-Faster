import * as React from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { LucideIcon } from "lucide-react"
import { Heading } from "@/components/atomic/atoms/Heading"
import { Text } from "@/components/atomic/atoms/Text"

interface TextSourceCardProps {
  icon: LucideIcon
  title: string
  description: string
  buttonLabel: string
  buttonIcon: LucideIcon
  onAction: () => void
  inputMode?: "none" | "textarea" | "file"
  textValue?: string
  onTextChange?: (value: string) => void
  fileInputRef?: React.RefObject<HTMLInputElement>
  disabled?: boolean
}

export function TextSourceCard({
  icon: Icon,
  title,
  description,
  buttonLabel,
  buttonIcon: ButtonIcon,
  onAction,
  inputMode = "none",
  textValue,
  onTextChange,
  fileInputRef,
  disabled
}: TextSourceCardProps) {
  return (
    <div className="flex flex-col gap-6 py-8">
      <div className="flex flex-col items-center justify-center gap-6">
        {inputMode === "none" && (
          <div className="rounded-full bg-secondary p-4">
            <Icon className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        <div className="text-center">
          <Heading as="h3" className="mb-2">{title}</Heading>
          <Text variant="muted" className="mb-6 max-w-md">
            {description}
          </Text>
        </div>
      </div>

      {inputMode === "textarea" && onTextChange && (
        <Textarea
          value={textValue}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Paste your text here..."
          className="min-h-[200px] resize-none border-input bg-background text-base leading-relaxed"
        />
      )}

      {inputMode === "file" && fileInputRef && (
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.pdf"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              onAction()
            }
          }}
          className="hidden"
        />
      )}

      <Button 
        onClick={onAction} 
        disabled={disabled}
        className={`gap-2 ${inputMode === "textarea" ? "self-center" : ""}`}
      >
        <ButtonIcon className="h-4 w-4" />
        {buttonLabel}
      </Button>
    </div>
  )
}
