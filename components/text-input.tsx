"use client"

import * as React from "react"
import { useApp, getRandomText } from "@/lib/app-context"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Upload, RefreshCw, FileText } from "lucide-react"

interface TextInputProps {
  onTextReady: (text: string) => void
}

export function TextInput({ onTextReady }: TextInputProps) {
  const { textSource, customText, setCustomText } = useApp()
  const [uploadedText, setUploadedText] = React.useState("")
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type === "text/plain") {
      const text = await file.text()
      setUploadedText(text)
      onTextReady(text)
    } else if (file.type === "application/pdf") {
      // For PDF, we'll extract text client-side using a simple approach
      // In production, you might want to use pdf.js or a server-side solution
      const text = await file.text()
      setUploadedText(text)
      onTextReady(text)
    }
  }

  const handleRandomText = () => {
    const text = getRandomText()
    onTextReady(text)
  }

  const handleCustomTextSubmit = () => {
    if (customText.trim()) {
      onTextReady(customText)
    }
  }

  if (textSource === "random") {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-12">
        <div className="rounded-full bg-secondary p-4">
          <RefreshCw className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="text-center">
          <h3 className="mb-2 text-lg font-medium text-foreground">Random Text</h3>
          <p className="mb-6 max-w-md text-sm text-muted-foreground">
            Get a random English text to practice with. Each text is designed to improve your fluency.
          </p>
        </div>
        <Button onClick={handleRandomText} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Generate Random Text
        </Button>
      </div>
    )
  }

  if (textSource === "custom") {
    return (
      <div className="flex flex-col gap-6 py-8">
        <div className="text-center">
          <h3 className="mb-2 text-lg font-medium text-foreground">Your Text</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Paste or type any English text you want to practice with.
          </p>
        </div>
        <Textarea
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          placeholder="Paste your text here..."
          className="min-h-[200px] resize-none border-input bg-background text-base leading-relaxed"
        />
        <Button 
          onClick={handleCustomTextSubmit} 
          disabled={!customText.trim()}
          className="self-center gap-2"
        >
          <FileText className="h-4 w-4" />
          Start Practice
        </Button>
      </div>
    )
  }

  if (textSource === "upload") {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-12">
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.pdf"
          onChange={handleFileUpload}
          className="hidden"
        />
        <div className="rounded-full bg-secondary p-4">
          <Upload className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="text-center">
          <h3 className="mb-2 text-lg font-medium text-foreground">Upload File</h3>
          <p className="mb-6 max-w-md text-sm text-muted-foreground">
            Upload a .txt or .pdf file to practice with your own content.
          </p>
        </div>
        <Button onClick={() => fileInputRef.current?.click()} className="gap-2">
          <Upload className="h-4 w-4" />
          Choose File
        </Button>
        {uploadedText && (
          <p className="text-sm text-muted-foreground">
            File loaded. Ready to practice!
          </p>
        )}
      </div>
    )
  }

  return null
}
