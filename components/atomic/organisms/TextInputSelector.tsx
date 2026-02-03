import * as React from "react"
import { RefreshCw, FileText, Upload } from "lucide-react"
import { TextSourceCard } from "@/components/atomic/molecules/TextSourceCard"

interface TextInputSelectorProps {
  textSource: "random" | "custom" | "upload"
  customText: string
  onCustomTextChange: (text: string) => void
  onRandomText: () => void
  onCustomTextSubmit: () => void
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
  uploadedText: string
}

export function TextInputSelector({
  textSource,
  customText,
  onCustomTextChange,
  onRandomText,
  onCustomTextSubmit,
  onFileUpload,
  fileInputRef,
  uploadedText
}: TextInputSelectorProps) {
  if (textSource === "random") {
    return (
      <TextSourceCard
        icon={RefreshCw}
        title="Random Text"
        description="Get a random English text to practice with. Each text is designed to improve your fluency."
        buttonLabel="Generate Random Text"
        buttonIcon={RefreshCw}
        onAction={onRandomText}
      />
    )
  }

  if (textSource === "custom") {
    return (
      <TextSourceCard
        icon={FileText}
        title="Your Text"
        description="Paste or type any English text you want to practice with."
        buttonLabel="Start Practice"
        buttonIcon={FileText}
        onAction={onCustomTextSubmit}
        inputMode="textarea"
        textValue={customText}
        onTextChange={onCustomTextChange}
        disabled={!customText.trim()}
      />
    )
  }

  if (textSource === "upload") {
    return (
      <>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.pdf"
          onChange={onFileUpload}
          className="hidden"
        />
        <TextSourceCard
          icon={Upload}
          title="Upload File"
          description="Upload a .txt or .pdf file to practice with your own content."
          buttonLabel="Choose File"
          buttonIcon={Upload}
          onAction={() => fileInputRef.current?.click()}
        />
        {uploadedText && (
          <p className="text-sm text-muted-foreground text-center mt-4">
            File loaded. Ready to practice!
          </p>
        )}
      </>
    )
  }

  return null
}
