"use client"

import { useState, useRef, useEffect } from "react"
import { Volume2, VolumeX } from "lucide-react"

export function AmbientSoundPlayer() {
  const [volume, setVolume] = useState(0.3)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Create audio element with ambient dump soundscape
    audioRef.current = new Audio("/The-Dump/placeholder.mp3?query=ambient+dump+soundscape+with+seagulls+distant+trucks+crickets")
    audioRef.current.loop = true
    audioRef.current.volume = volume

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  const togglePlay = async () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      try {
        await audioRef.current.play()
        setIsPlaying(true)
      } catch (error) {
        console.error("Failed to play audio:", error)
      }
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 pointer-events-auto">
      <button
        onClick={togglePlay}
        className="text-foreground/80 hover:text-foreground transition-colors"
        aria-label={isPlaying ? "Pause ambient sounds" : "Play ambient sounds"}
      >
        {isPlaying ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={(e) => setVolume(Number.parseFloat(e.target.value))}
        className="w-24 h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0"
        aria-label="Ambient sound volume"
      />
    </div>
  )
}
