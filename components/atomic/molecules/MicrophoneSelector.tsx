import * as React from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface MicrophoneSelectorProps {
  micEnabled: boolean
  selectedDeviceId: string
  audioDevices: MediaDeviceInfo[]
  micSupported: boolean
  onDeviceSelect: (deviceId: string) => void
  onMicDisable: () => void
}

export function MicrophoneSelector({
  micEnabled,
  selectedDeviceId,
  audioDevices,
  micSupported,
  onDeviceSelect,
  onMicDisable
}: MicrophoneSelectorProps) {
  const [showDropdown, setShowDropdown] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative flex-1 sm:flex-initial" ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          if (!micSupported) {
            alert("Speech recognition is not supported in your browser. Please use Chrome or Edge.")
            return
          }
          setShowDropdown(!showDropdown)
        }}
        className={cn(
          "gap-2 bg-transparent w-full sm:w-auto text-xs md:text-sm",
          micEnabled
            ? "text-blue-500 hover:text-blue-600 dark:text-blue-400"
            : "text-muted-foreground"
        )}
      >
        <Mic className={cn("h-4 w-4 flex-shrink-0", micEnabled && "fill-current")} />
        <span className="truncate">
          {micEnabled && selectedDeviceId
            ? (audioDevices.find(d => d.deviceId === selectedDeviceId)?.label || "Microfone")
            : "Selecionar Microfone"}
        </span>
      </Button>

      {showDropdown && (
        <div className="absolute right-0 top-full z-50 mt-2 w-full max-w-[calc(100vw-2rem)] sm:w-80 rounded-lg border border-border bg-background shadow-lg">
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
                        onDeviceSelect(device.deviceId)
                        setShowDropdown(false)
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

            {micEnabled && (
              <>
                <div className="my-2 border-t border-border" />
                <button
                  onClick={() => {
                    onMicDisable()
                    setShowDropdown(false)
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
  )
}
