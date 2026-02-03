import * as React from "react"
import { SpeedControl } from "@/components/atomic/molecules/SpeedControl"
import { MicrophoneSelector } from "@/components/atomic/molecules/MicrophoneSelector"
import { ActionButtons } from "@/components/atomic/molecules/ActionButtons"

interface ControlPanelProps {
  // Speed control
  speed: number
  onSpeedChange: (speed: number) => void
  
  // Microphone
  showMicrophone?: boolean
  micEnabled?: boolean
  selectedDeviceId?: string
  audioDevices?: MediaDeviceInfo[]
  micSupported?: boolean
  onDeviceSelect?: (deviceId: string) => void
  onMicDisable?: () => void
  
  // Playback controls
  isPlaying: boolean
  isFinished: boolean
  onPlay: () => void
  onPause: () => void
  onReset: () => void
}

export function ControlPanel({
  speed,
  onSpeedChange,
  showMicrophone = false,
  micEnabled = false,
  selectedDeviceId = "",
  audioDevices = [],
  micSupported = true,
  onDeviceSelect = () => {},
  onMicDisable = () => {},
  isPlaying,
  isFinished,
  onPlay,
  onPause,
  onReset
}: ControlPanelProps) {
  return (
    <div className="border-b border-border bg-secondary/30 px-4 py-3 md:px-6">
      <div className="flex flex-wrap items-center gap-3 md:gap-6">
        <SpeedControl speed={speed} onSpeedChange={onSpeedChange} />
        
        <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto sm:ml-auto">
          {showMicrophone && (
            <MicrophoneSelector
              micEnabled={micEnabled}
              selectedDeviceId={selectedDeviceId}
              audioDevices={audioDevices}
              micSupported={micSupported}
              onDeviceSelect={onDeviceSelect}
              onMicDisable={onMicDisable}
            />
          )}
          
          <ActionButtons
            isPlaying={isPlaying}
            isFinished={isFinished}
            onPlay={onPlay}
            onPause={onPause}
            onReset={onReset}
          />
        </div>
      </div>
    </div>
  )
}
