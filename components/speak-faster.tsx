"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { TextInput } from "@/components/text-input"
import { Play, Pause, RotateCcw, Gauge, Mic, MicOff, Target, CheckCircle2, XCircle } from "lucide-react"

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

const SPEEDS = [
  { value: 0.5, label: "0.5x" },
  { value: 1, label: "1x" },
  { value: 1.25, label: "1.25x" },
  { value: 1.5, label: "1.5x" },
  { value: 2, label: "2x" },
]

// Estimate syllable count for a word
function countSyllables(word: string): number {
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, "")
  if (cleaned.length <= 2) return 1
  
  // Count vowel groups as syllables
  const vowelGroups = cleaned.match(/[aeiouy]+/g)
  let count = vowelGroups ? vowelGroups.length : 1
  
  // Adjust for silent 'e' at end
  if (cleaned.endsWith("e") && count > 1) {
    count--
  }
  
  // Adjust for common suffixes
  if (cleaned.endsWith("le") && cleaned.length > 2 && !/[aeiouy]/.test(cleaned[cleaned.length - 3])) {
    count++
  }
  
  return Math.max(1, count)
}

// Calculate duration for a word based on complexity
function getWordDuration(word: string, baseMs: number): number {
  const syllables = countSyllables(word)
  const length = word.replace(/[^a-zA-Z]/g, "").length
  
  // Base time per syllable (around 200ms at normal speech)
  const syllableTime = syllables * 180
  
  // Add extra time for longer words (harder to pronounce)
  const lengthBonus = Math.max(0, length - 4) * 20
  
  // Add time for complex letter combinations
  const complexPatterns = /[^aeiou]{3,}|ough|tion|sion|ght|sch|tch|dge/gi
  const complexMatches = word.match(complexPatterns)
  const complexBonus = complexMatches ? complexMatches.length * 50 : 0
  
  // Minimum 200ms, scale by base multiplier
  const duration = Math.max(200, syllableTime + lengthBonus + complexBonus)
  
  // Normalize around baseMs for average word
  return (duration / 300) * baseMs
}

import { useApp } from "@/lib/app-context"

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

export default function SpeakFaster() {
  const { mode, textSource, resetKey, activeText, setActiveText } = useApp()
  const [text, setText] = React.useState(activeText) 
  // words is derived from text, no need for useState
  
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
  const [showMicDropdown, setShowMicDropdown] = React.useState(false)
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
  const micDropdownRef = React.useRef<HTMLDivElement>(null)
  const restartTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  
  // Refs para evitar stale closures nos event handlers
  const micEnabledRef = React.useRef(micEnabled)
  const isListeningRef = React.useRef(isListening)
  
  // Atualizar refs quando estados mudarem
  React.useEffect(() => {
    micEnabledRef.current = micEnabled
  }, [micEnabled])
  
  React.useEffect(() => {
    isListeningRef.current = isListening
  }, [isListening])
  
  const words = React.useMemo(() => text.split(/\s+/).filter(word => word.length > 0), [text])

  // Track previous values to avoid resetting on mount when switching modes
  const prevTextSourceRef = React.useRef(textSource)
  const prevResetKeyRef = React.useRef(resetKey)

  React.useEffect(() => {
    // Only reset if textSource or resetKey ACTUALLY changed
    if (prevTextSourceRef.current !== textSource || prevResetKeyRef.current !== resetKey) {
      if (text) {
        setText("")
        setActiveText("")
        handleReset()
      }
    }
    // Update refs
    prevTextSourceRef.current = textSource
    prevResetKeyRef.current = resetKey
  }, [textSource, resetKey, text, setActiveText])

  const handleTextReady = (newText: string) => {
    setText(newText)
    setActiveText(newText)
    handleReset()
  }

  const baseInterval = 400 // ms per word at 1x speed

  // Normalize word for comparison (remove punctuation, lowercase)
  const normalizeWord = (word: string) => {
    return word.toLowerCase().replace(/[^a-z0-9]/g, "")
  }

  // Check if spoken word matches current or next few words
  const checkSpokenWord = React.useCallback((transcript: string) => {
    const spokenWords = transcript.toLowerCase().split(/\s+/).filter(w => w.length > 0)
    let matchedAny = false
    let newWordIndex = currentWordIndex
    
    for (const spoken of spokenWords) {
      const normalizedSpoken = normalizeWord(spoken)
      if (!normalizedSpoken) continue
      
      // Check current word and a few words ahead (allows for slight delays)
      for (let i = newWordIndex; i < Math.min(newWordIndex + 3, words.length); i++) {
        const normalizedTarget = normalizeWord(words[i])
        
        // Check for exact match or close match (first 3+ chars for longer words)
        const isMatch = normalizedSpoken === normalizedTarget ||
          (normalizedTarget.length > 3 && normalizedSpoken.length >= 3 && 
           normalizedTarget.startsWith(normalizedSpoken.slice(0, 3)))
        
        if (isMatch) {
          console.log(`✨ Match! Spoken: "${spoken}" matches Word[${i}]: "${words[i]}"`)
          // Only process if this word hasn't been marked yet
          setWordStatuses(prev => {
            const newMap = new Map(prev)
            // Only add if not already processed
            if (!newMap.has(i)) {
              newMap.set(i, {
                index: i,
                expected: words[i],
                recognized: spoken,
                isCorrect: true,
                timestamp: Date.now()
              })
              
              // Update stats only when adding new word
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
          // Move to the next word
          newWordIndex = Math.min(i + 1, words.length)
          matchedAny = true
          break
        }
      }
    }
    
    // Update current word index once at the end
    if (matchedAny) {
      setCurrentWordIndex(newWordIndex)
    }
    
    return matchedAny
  }, [currentWordIndex, words])

  // Use ref to always have latest checkSpokenWord
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

    // Listen for device changes
    navigator.mediaDevices.addEventListener("devicechange", getAudioDevices)
    
    return () => {
      navigator.mediaDevices.removeEventListener("devicechange", getAudioDevices)
    }
  }, [])

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (micDropdownRef.current && !micDropdownRef.current.contains(event.target as Node)) {
        setShowMicDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Initialize speech recognition with event handlers
  React.useEffect(() => {
    let isUnmounting = false

    if (typeof window !== "undefined") {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognitionAPI) {
        // Safe check: Abort existing instance if any
        if (recognitionRef.current) {
           try {
             recognitionRef.current.abort()
           } catch(e) { console.error(e) }
        }

        const recognition = new SpeechRecognitionAPI()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = "en-US"
        
        // Configurar event handlers AQUI, antes de qualquer start()
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
          
          // Debug para confirmar versão nova
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
             // Ignore aborted errors during cleanup
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
          
          // Usar refs para pegar valores atuais, não os da inicialização
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
        // Remove handlers to prevent zombie calls
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

    // Only start if Mic is enabled (selected) AND Playing (Start button pressed)
    if (micEnabled && isPlaying && !isListening) {
      console.log("🎙️ Ativando microfone...")
      
      try {
        console.log("🚀 Iniciando Speech Recognition...")
        
        // Timeout para detectar se onstart nunca dispara
        const startTimeout = setTimeout(() => {
          console.error("❌ FALHA: onstart NÃO disparou em 2 segundos!")
          console.error("📊 Diagnóstico:")
          console.error("  Browser:", navigator.userAgent)
          console.error("  Plataforma:", navigator.platform)
          console.error("  Idioma:", navigator.language)
          console.error("  Online:", navigator.onLine)
          
          setIsListening(false)
          // Don't disable micEnabled here, just stop playing
          setIsPlaying(false)
        }, 2000)
        
        // Salvar timeout para limpar depois
        const originalOnStart = recognition.onstart
        recognition.onstart = () => {
          clearTimeout(startTimeout)
          console.log("✅ Speech Recognition INICIOU - ouvindo agora!")
          if (originalOnStart) originalOnStart()
        }
        
        recognition.start()
        setIsListening(true)
        // setIsPlaying(false) // REMOVED: We want isPlaying to stay true
        
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
      // Stop if Mic disabled OR Paused
      console.log("🔇 Desativando microfone...")
      
      // Limpar timeout de restart
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
  }, [micEnabled, isPlaying, isListening]) // Added isPlaying dependency

  // Use setTimeout for variable word timing
  React.useEffect(() => {
    // Only run auto-read if NOT using microphone
    // Change: Allow running through the last word (currentWordIndex < words.length)
    if (isPlaying && !micEnabled && words.length > 0 && currentWordIndex < words.length) {
      const currentWord = words[currentWordIndex]
      const duration = getWordDuration(currentWord, baseInterval) / speed
      
      intervalRef.current = setTimeout(() => {
        setCurrentWordIndex((prev) => {
          // If we just finished the last word
          if (prev >= words.length - 1) {
            setIsPlaying(false)
            return words.length // Move index past the last word to indicate completion
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
      // Check if element exists (handling the isFinished state where verify index is out of bounds)
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
    // Don't reset micEnabled on reset, keep the selection
    // setMicEnabled(false) 
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

  const isFinished = words.length > 0 && currentWordIndex >= words.length

  if (!text || text.trim().length === 0) {
    return (
      <div className="flex h-full flex-col">
        <header className="border-b border-border px-6 py-4">
          <h1 className="text-xl font-semibold text-foreground">Speak Faster</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Read along with the teleprompter to improve your speaking fluency
          </p>
        </header>
        <div className="flex flex-1 items-center justify-center px-6">
          <div className="w-full max-w-xl">
            <TextInput onTextReady={handleTextReady} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Speak Faster</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Read along with the highlighted words
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="gap-2 bg-transparent"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </header>

      {/* Speed Controls */}
      <div className="border-b border-border bg-secondary/30 px-6 py-3">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Gauge className="h-4 w-4" />
            <span>Speed</span>
          </div>
          <div className="flex items-center gap-2">
            {SPEEDS.map((s) => (
              <button
                key={s.value}
                onClick={() => setSpeed(s.value)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150",
                  speed === s.value
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-3">
            {/* Microphone Selector */}
            <div className="relative" ref={micDropdownRef}>
              <Button
                variant="outline" 
                size="sm"
                onClick={() => {
                  if (!micSupported) {
                    alert("Speech recognition is not supported in your browser. Please use Chrome or Edge.")
                    return
                  }
                  setShowMicDropdown(!showMicDropdown)
                }}
                className={cn(
                  "gap-2 bg-transparent",
                  micEnabled 
                    ? "text-blue-500 hover:text-blue-600 dark:text-blue-400" 
                    : "text-muted-foreground"
                )}
              >
                 <Mic className={cn("h-4 w-4", micEnabled && "fill-current")} />
                 {micEnabled && selectedDeviceId 
                   ? (audioDevices.find(d => d.deviceId === selectedDeviceId)?.label || "Microfone") 
                   : "Selecionar Microfone"}
              </Button>

              {/* Dropdown Menu */}
              {showMicDropdown && (
                <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-border bg-background shadow-lg">
                  <div className="p-2">
                    <div className="mb-2 px-2 py-1 text-xs font-semibold text-muted-foreground">
                      Microfones Disponíveis
                    </div>
                    <div className="mb-2 rounded-md bg-blue-500/10 px-2 py-1.5 text-xs text-blue-600 dark:text-blue-400">
                      💡 O reconhecimento de voz usa o microfone padrão do sistema
                    </div>
                    {audioDevices.length === 0 ? (
                      <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                        Nenhum microfone detectado
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {audioDevices.map((device) => {
                          const isSelected = device.deviceId === selectedDeviceId
                          
                          return (
                            <button
                              key={device.deviceId}
                              onClick={() => {
                                setSelectedDeviceId(device.deviceId)
                                setMicEnabled(true)
                                setShowMicDropdown(false)
                                // DO NOT Auto start here
                              }}
                              className={cn(
                                "w-full rounded-md px-3 py-2 text-left transition-colors",
                                isSelected
                                  ? "bg-accent text-accent-foreground"
                                  : "hover:bg-secondary"
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <Mic className="h-4 w-4 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="truncate text-sm font-medium">
                                    {device.label || `Microfone ${device.deviceId.slice(0, 8)}`}
                                  </div>
                                </div>
                                {isSelected && (
                                  <div className="flex-shrink-0">
                                    <div className="h-2 w-2 rounded-full bg-green-500" />
                                  </div>
                                )}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    )}
                    
                    {/* Disable Mic Option */}
                    {micEnabled && (
                      <>
                        <div className="my-2 border-t border-border" />
                        <button
                          onClick={() => {
                            setMicEnabled(false)
                            setShowMicDropdown(false)
                            setIsPlaying(false) // Stop if disabling mic while running
                          }}
                          className="w-full rounded-md px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        >
                          <div className="flex items-center gap-2">
                            <MicOff className="h-4 w-4" />
                            Desativar Microfone
                          </div>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Play/Pause/Reset Controls */}
              <>
                {isFinished ? (
                  <Button onClick={handleReset} size="sm" className="gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </Button>
                ) : isPlaying ? (
                  <Button onClick={handlePause} size="sm" className="gap-2">
                    <Pause className="h-4 w-4" />
                    Pause
                  </Button>
                ) : (
                  <Button onClick={handleStart} size="sm" className="gap-2">
                    <Play className="h-4 w-4" />
                    Start
                  </Button>
                )}
              </>
          </div>
        </div>
      </div>

      {/* Teleprompter Content */}
      <div className="relative flex-1 overflow-hidden">
        <div
          ref={containerRef}
          className="h-full overflow-hidden px-6 py-12"
        >
          <div
            className="mx-auto max-w-2xl transition-transform duration-300 ease-out"
            style={{ transform: `translateY(-${scrollPosition}px)` }}
          >
            <p className="text-xl leading-[2] tracking-wide">
              {words.map((word, index) => {
                const wordStatus = wordStatuses.get(index)
                const isCurrent = index === currentWordIndex
                const isPast = index < currentWordIndex
                
                return (
                  <span
                    key={index}
                    data-word
                    className={cn(
                      "transition-colors duration-100 relative",
                      // Current word (being spoken now)
                      isCurrent && "font-bold text-accent",
                      // Correct word (green background flash)
                      wordStatus?.isCorrect === true && "text-green-600 font-bold animate-success-flash",
                      // Incorrect word (red with background)
                      wordStatus?.isCorrect === false && "text-destructive font-medium bg-destructive/10",
                      // Past words without status
                      !wordStatus && isPast && "text-muted-foreground",
                      // Future words
                      !wordStatus && !isPast && !isCurrent && "text-foreground"
                    )}
                    title={wordStatus?.isCorrect === false 
                      ? `Expected: "${wordStatus.expected}" | Heard: "${wordStatus.recognized}"`
                      : undefined
                    }
                  >
                    {word}
                    <span className="inline-block w-2" />
                  </span>
                )
              })}
            </p>
          </div>
        </div>

        {/* Gradient overlays */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Metrics Footer */}
      <footer className="border-t border-border bg-secondary/30 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Accuracy */}
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-accent" />
              <span className="text-2xl font-semibold text-accent">{stats.accuracy}%</span>
              <span className="text-sm text-muted-foreground">Accuracy</span>
            </div>
            
            {/* Correct Words */}
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span className="text-lg font-semibold text-foreground">{(stats.correctWords)/2}</span>
              <span className="text-sm text-muted-foreground">Correct</span>
            </div>
            
            {/* Remaining Words */}
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-muted-foreground" />
              <span className="text-lg font-semibold text-foreground">{words.length - (stats.correctWords)/2}</span>
              <span className="text-sm text-muted-foreground">Remaining</span>
            </div>
            
            {/* Last spoken word when mic is active */}
            {micEnabled && lastSpokenWord && (
              <div className="ml-4 rounded-md bg-accent/20 px-3 py-1.5 text-sm">
                <span className="text-muted-foreground">Heard: </span>
                <span className="font-medium text-accent">"{lastSpokenWord}"</span>
              </div>
            )}
          </div>
          
          {/* Progress indicator */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {currentWordIndex} / {words.length} words
            </span>
            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-accent transition-all duration-150"
                style={{ width: `${(currentWordIndex / words.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
