"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { RotateCcw, Target, CheckCircle2, Gauge, PanelLeft } from "lucide-react"
import { useApp, getRandomText } from "@/lib/app-context"
import { PageHeader } from "@/components/atomic/molecules/PageHeader"
import { PracticeLayout } from "@/components/atomic/templates/PracticeLayout"
import { EmptyStateLayout } from "@/components/atomic/templates/EmptyStateLayout"
import { TeleprompterArea } from "@/components/atomic/organisms/TeleprompterArea"
import { ControlPanel } from "@/components/atomic/organisms/ControlPanel"
import { TextInputSelector } from "@/components/atomic/organisms/TextInputSelector"
import { Text } from "@/components/atomic/atoms/Text"
import { StatCard } from "@/components/atomic/molecules/StatCard"
import { ProgressIndicator } from "@/components/atomic/molecules/ProgressIndicator"

// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  isFinal: boolean
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onstart: (() => void) | null
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: Event) => void) | null
  onend: (() => void) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

interface WordStatus {
  index: number
  expected: string
  recognized: string
  isCorrect: boolean
  timestamp: number
}

interface SpeakFasterStats {
  totalAttempts: number
  correctWords: number
  incorrectWords: number
  accuracy: number
  startTime: number | null
}

// Estimate syllable count for a word
function countSyllables(word: string): number {
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, "")
  if (cleaned.length <= 2) return 1
  
  const vowelGroups = cleaned.match(/[aeiouy]+/g)
  let count = vowelGroups ? vowelGroups.length : 1
  
  if (cleaned.endsWith("e") && count > 1) {
    count--
  }
  
  if (cleaned.endsWith("le") && cleaned.length > 2 && !/[aeiouy]/.test(cleaned[cleaned.length - 3])) {
    count++
  }
  
  return Math.max(1, count)
}

// Calculate duration for a word based on complexity
function getWordDuration(word: string, baseMs: number): number {
  const syllables = countSyllables(word)
  const length = word.replace(/[^a-zA-Z]/g, "").length
  
  const syllableTime = syllables * 180
  const lengthBonus = Math.max(0, length - 4) * 20
  
  const complexPatterns = /[^aeiou]{3,}|ough|tion|sion|ght|sch|tch|dge/gi
  const complexMatches = word.match(complexPatterns)
  const complexBonus = complexMatches ? complexMatches.length * 50 : 0
  
  const duration = Math.max(200, syllableTime + lengthBonus + complexBonus)
  
  return (duration / 300) * baseMs
}

export default function SpeakFaster() {
  const { textSource, resetKey, activeText, setActiveText, setSidebarOpen, customText, setCustomText } = useApp()
  const [text, setText] = React.useState(activeText)
  const [uploadedText, setUploadedText] = React.useState("")
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [speed, setSpeed] = React.useState(1)
  const [currentWordIndex, setCurrentWordIndex] = React.useState(0)
  const [scrollPosition, setScrollPosition] = React.useState(0)
  const [micEnabled, setMicEnabled] = React.useState(false)
  const [isListening, setIsListening] = React.useState(false)
  const [micSupported, setMicSupported] = React.useState(true)
  const [lastSpokenWord, setLastSpokenWord] = React.useState("")
  const [audioDevices, setAudioDevices] = React.useState<MediaDeviceInfo[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = React.useState<string>("")
  const [wordStatuses, setWordStatuses] = React.useState<Map<number, WordStatus>>(new Map())
  const [stats, setStats] = React.useState<SpeakFasterStats>({
    totalAttempts: 0,
    correctWords: 0,
    incorrectWords: 0,
    accuracy: 0,
    startTime: null
  })
  
  const containerRef = React.useRef<HTMLDivElement>(null)
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null)
  const recognitionRef = React.useRef<SpeechRecognition | null>(null)
  const restartTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  
  const micEnabledRef = React.useRef(micEnabled)
  const isListeningRef = React.useRef(isListening)
  
  React.useEffect(() => {
    micEnabledRef.current = micEnabled
  }, [micEnabled])
  
  React.useEffect(() => {
    isListeningRef.current = isListening
  }, [isListening])
  
  const words = React.useMemo(() => text.split(/\s+/).filter(word => word.length > 0), [text])

  const baseInterval = 400

  const normalizeWord = (word: string) => {
    return word.toLowerCase().replace(/[^a-z0-9]/g, "")
  }

  const checkSpokenWord = React.useCallback((transcript: string) => {
    const spokenWords = transcript.toLowerCase().split(/\s+/).filter(w => w.length > 0)
    let matchedAny = false
    let newWordIndex = currentWordIndex
    
    for (const spoken of spokenWords) {
      const normalizedSpoken = normalizeWord(spoken)
      if (!normalizedSpoken) continue
      
      for (let i = newWordIndex; i < Math.min(newWordIndex + 3, words.length); i++) {
        const normalizedTarget = normalizeWord(words[i])
        
        const isMatch = normalizedSpoken === normalizedTarget ||
          (normalizedTarget.length > 3 && normalizedSpoken.length >= 3 && 
           normalizedTarget.startsWith(normalizedSpoken.slice(0, 3)))
        
        if (isMatch) {
          console.log(`✨ Match! Spoken: "${spoken}" matches Word[${i}]: "${words[i]}"`)
          setWordStatuses(prev => {
            const newMap = new Map(prev)
            if (!newMap.has(i)) {
              newMap.set(i, {
                index: i,
                expected: words[i],
                recognized: spoken,
                isCorrect: true,
                timestamp: Date.now()
              })
              
              setStats(prevStats => {
                const newCorrect = prevStats.correctWords + 1
                const totalWords = words.length
                return {
                  ...prevStats,
                  correctWords: newCorrect,
                  totalAttempts: newCorrect,
                  incorrectWords: 0,
                  accuracy: Math.round(((newCorrect / totalWords) * 100) / 2),
                  startTime: prevStats.startTime || Date.now()
                }
              })
            }
            return newMap
          })
          
          setLastSpokenWord(spoken)
          newWordIndex = Math.min(i + 1, words.length)
          matchedAny = true
          break
        }
      }
    }
    
    if (matchedAny) {
      setCurrentWordIndex(newWordIndex)
    }
    
    return matchedAny
  }, [currentWordIndex, words])

  const checkSpokenWordRef = React.useRef(checkSpokenWord)
  React.useEffect(() => {
    checkSpokenWordRef.current = checkSpokenWord
  }, [checkSpokenWord])

  // Enumerate audio devices
  React.useEffect(() => {
    const getAudioDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const audioInputs = devices.filter(device => device.kind === "audioinput")
        setAudioDevices(audioInputs)
        
        if (audioInputs.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(audioInputs[0].deviceId)
        }
        
        console.log("📱 Microfones disponíveis:", audioInputs.length)
      } catch (error) {
        console.error("❌ Erro ao acessar dispositivos:", error)
        setMicSupported(false)
      }
    }

    getAudioDevices()
    navigator.mediaDevices.addEventListener("devicechange", getAudioDevices)
    
    return () => {
      navigator.mediaDevices.removeEventListener("devicechange", getAudioDevices)
    }
  }, [selectedDeviceId])

  // Initialize speech recognition
  React.useEffect(() => {
    let isUnmounting = false

    if (typeof window !== "undefined") {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognitionAPI) {
        if (recognitionRef.current) {
           try {
             recognitionRef.current.abort()
           } catch(e) { console.error(e) }
        }

        const recognition = new SpeechRecognitionAPI()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = "en-US"
        
        recognition.onstart = () => {
          if (!isUnmounting) {
            console.log("✅ Speech Recognition INICIOU - ouvindo agora!")
          }
        }

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          if (isUnmounting) return

          console.log("📥 onresult disparado! Total de resultados:", event.results.length)
          
          const lastResult = event.results[event.results.length - 1]
          const transcript = lastResult[0].transcript
          const confidence = lastResult[0].confidence
          const isFinal = lastResult.isFinal
          
          console.log(`🎤 Transcript: "${transcript}" | Confiança: ${(confidence * 100).toFixed(1)}% | Final: ${isFinal}`)
          
          console.log(`🚀 LÓGICA TEMPO REAL ATIVA: "${transcript}"`)
          checkSpokenWordRef.current(transcript)
        }

        recognition.onerror = (event: any) => {
          if (isUnmounting) return
          console.error("❌ Erro:", event.error)
          
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            console.error("🚫 Permissão negada")
            setMicSupported(false)
            setMicEnabled(false)
            setIsListening(false)
          } else if (event.error === 'no-speech') {
            console.log("🤫 Silêncio detectado")
          } else if (event.error === 'aborted') {
          } else {
            setIsListening(false)
          }
        }

        recognition.onend = () => {
          if (isUnmounting) {
             console.log("⏹️ Recognition parou (Cleanup)")
             return
          }
          console.log("⏹️ Recognition parou")
          
          if (restartTimeoutRef.current) {
            clearTimeout(restartTimeoutRef.current)
          }
          
          if (micEnabledRef.current && isListeningRef.current) {
            restartTimeoutRef.current = setTimeout(() => {
              if (isUnmounting) return
              try {
                console.log("🔄 Reiniciando...")
                recognition.start()
              } catch (error: any) {
                if (!error.message?.includes('already started')) {
                  console.error("❌ Erro ao reiniciar:", error.message)
                  setIsListening(false)
                }
              }
            }, 300)
          } else {
            setIsListening(false)
          }
        }
        
        recognitionRef.current = recognition
        console.log("🎤 Speech Recognition inicializado com handlers")
      } else {
        setMicSupported(false)
      }
    }
    
    return () => {
      isUnmounting = true
      console.log("🧹 Cleanup: Abortando Speech Recognition...")
      
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null
        recognitionRef.current.onend = null
        recognitionRef.current.onerror = null
        recognitionRef.current.onstart = null
        
        try {
          recognitionRef.current.abort()
        } catch (e) {
          console.error("Erro ao abortar durante cleanup:", e)
        }
        recognitionRef.current = null
      }
      
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current)
        restartTimeoutRef.current = null
      }
    }
  }, [])

  // Start/stop listening based on micEnabled AND isPlaying
  React.useEffect(() => {
    const recognition = recognitionRef.current
    if (!recognition) return

    if (micEnabled && isPlaying && !isListening) {
      console.log("🎙️ Ativando microfone...")
      
      try {
        console.log("🚀 Iniciando Speech Recognition...")
        
        const startTimeout = setTimeout(() => {
          console.error("❌ FALHA: onstart NÃO disparou em 2 segundos!")
          setIsListening(false)
          setIsPlaying(false)
        }, 2000)
        
        const originalOnStart = recognition.onstart
        recognition.onstart = () => {
          clearTimeout(startTimeout)
          console.log("✅ Speech Recognition INICIOU - ouvindo agora!")
          if (originalOnStart) originalOnStart()
        }
        
        recognition.start()
        setIsListening(true)
        
      } catch (error: any) {
        if (error.message?.includes('already started')) {
          console.log("ℹ️ Já está ativo")
          setIsListening(true)
        } else {
          console.error("❌ Erro ao iniciar:", error.name, error.message)
          setIsPlaying(false)
        }
      }
      
    } else if ((!micEnabled || !isPlaying) && isListening) {
      console.log("🔇 Desativando microfone...")
      
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current)
        restartTimeoutRef.current = null
      }
      
      try {
        recognition.stop()
      } catch (error) {
        console.error("❌ Erro ao parar:", error)
      }
      setIsListening(false)
    }
  }, [micEnabled, isPlaying, isListening])

  // Use setTimeout for variable word timing
  React.useEffect(() => {
    if (isPlaying && !micEnabled && words.length > 0 && currentWordIndex < words.length) {
      const currentWord = words[currentWordIndex]
      const duration = getWordDuration(currentWord, baseInterval) / speed
      
      intervalRef.current = setTimeout(() => {
        setCurrentWordIndex((prev) => {
          if (prev >= words.length - 1) {
            setIsPlaying(false)
            return words.length
          }
          return prev + 1
        })
      }, duration)
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current)
      }
    }
  }, [isPlaying, speed, words, currentWordIndex, micEnabled])

  React.useEffect(() => {
    if (containerRef.current && words.length > 0) {
      const wordElements = containerRef.current.querySelectorAll('[data-word]')
      if (currentWordIndex < wordElements.length) {
          const currentElement = wordElements[currentWordIndex] as HTMLElement
          if (currentElement) {
            const containerHeight = containerRef.current.clientHeight
            const elementTop = currentElement.offsetTop
            const elementHeight = currentElement.offsetHeight
            const targetScroll = elementTop - containerHeight / 2 + elementHeight / 2
            setScrollPosition(Math.max(0, targetScroll))
          }
      }
    }
  }, [currentWordIndex, words.length])

  const handleStart = () => setIsPlaying(true)
  const handlePause = () => setIsPlaying(false)
  const handleReset = () => {
    setIsPlaying(false)
    setCurrentWordIndex(0)
    setScrollPosition(0)
    setLastSpokenWord("")
    setWordStatuses(new Map())
    setStats({
      totalAttempts: 0,
      correctWords: 0,
      incorrectWords: 0,
      accuracy: 0,
      startTime: null
    })
  }

  const handleTextReady = (newText: string) => {
    setText(newText)
    setActiveText(newText)
    handleReset()
  }

  const handleRandomText = () => {
    const randomText = getRandomText()
    handleTextReady(randomText)
  }

  const handleCustomTextSubmit = () => {
    if (customText.trim()) {
      handleTextReady(customText)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type === "text/plain") {
      const text = await file.text()
      setUploadedText(text)
      handleTextReady(text)
    } else if (file.type === "application/pdf") {
      const text = await file.text()
      setUploadedText(text)
      handleTextReady(text)
    }
  }

  const handleDeviceSelect = (deviceId: string) => {
    setSelectedDeviceId(deviceId)
    setMicEnabled(true)
  }

  const handleMicDisable = () => {
    setMicEnabled(false)
    setIsPlaying(false)
  }

  const prevTextSourceRef = React.useRef(textSource)
  const prevResetKeyRef = React.useRef(resetKey)

  React.useEffect(() => {
    if (prevTextSourceRef.current !== textSource || prevResetKeyRef.current !== resetKey) {
      if (text) {
        setText("")
        setActiveText("")
        handleReset()
      }
    }
    prevTextSourceRef.current = textSource
    prevResetKeyRef.current = resetKey
  }, [textSource, resetKey, text, setActiveText])

  const isFinished = words.length > 0 && currentWordIndex >= words.length

  // Empty state
  if (!text || text.trim().length === 0) {
    return (
      <EmptyStateLayout
        icon={PanelLeft}
        title="Speak Faster"
        subtitle="Read along with the teleprompter to improve your speaking fluency"
        onMenuClick={() => setSidebarOpen(true)}
      >
        <TextInputSelector
          textSource={textSource}
          customText={customText}
          onCustomTextChange={setCustomText}
          onRandomText={handleRandomText}
          onCustomTextSubmit={handleCustomTextSubmit}
          onFileUpload={handleFileUpload}
          fileInputRef={fileInputRef}
          uploadedText={uploadedText}
        />
      </EmptyStateLayout>
    )
  }

  // Practice screen
  return (
    <PracticeLayout
      header={
        <PageHeader
          title="Speak Faster"
          subtitle="Read along with the highlighted words"
          onMenuClick={() => setSidebarOpen(true)}
          actions={
            <Button variant="outline" size="sm" onClick={handleReset} className="gap-2 bg-transparent">
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
          }
        />
      }
      controls={
        <ControlPanel
          speed={speed}
          onSpeedChange={setSpeed}
          showMicrophone
          micEnabled={micEnabled}
          selectedDeviceId={selectedDeviceId}
          audioDevices={audioDevices}
          micSupported={micSupported}
          onDeviceSelect={handleDeviceSelect}
          onMicDisable={handleMicDisable}
          isPlaying={isPlaying}
          isFinished={isFinished}
          onPlay={handleStart}
          onPause={handlePause}
          onReset={handleReset}
        />
      }
      content={
        <TeleprompterArea
          words={words}
          currentWordIndex={currentWordIndex}
          wordStatuses={wordStatuses}
          scrollPosition={scrollPosition}
          containerRef={containerRef}
        />
      }
      footer={
        <footer className="border-t border-border bg-secondary/30 px-4 py-3 md:px-6 md:py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-0">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-8">
              <StatCard
                icon={Target}
                value={`${stats.accuracy}%`}
                label="Accuracy"
                valueColor="accent"
                iconColor="text-accent"
              />
              <StatCard
                icon={CheckCircle2}
                value={(stats.correctWords)/2}
                label="Correct"
                iconColor="text-success"
              />
              <StatCard
                icon={Gauge}
                value={words.length - (stats.correctWords)/2}
                label="Remaining"
              />
              
              {micEnabled && lastSpokenWord && (
                <div className="w-full md:w-auto md:ml-4 rounded-md bg-accent/20 px-3 py-1.5 text-xs md:text-sm text-center md:text-left">
                  <Text variant="caption" as="span">Heard: </Text>
                  <span className="font-medium text-accent">"{lastSpokenWord}"</span>
                </div>
              )}
            </div>
            
            <ProgressIndicator current={currentWordIndex} total={words.length} />
          </div>
        </footer>
      }
    />
  )
}
