'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Play, Pause, Volume2 } from 'lucide-react'

interface AudioPlayerProps {
  src: string | null
  onEnded?: () => void
}

export function AudioPlayer({ src, onEnded }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const endedRef = useRef(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  useEffect(() => {
    if (src && audioRef.current) {
      endedRef.current = false
      setProgress(0)
      setDuration(0)
      audioRef.current.src = src
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {})
    }
  }, [src])

  const togglePlay = () => {
    if (!audioRef.current) return
    if (endedRef.current) {
      endedRef.current = false
      audioRef.current.currentTime = 0
      audioRef.current.play()
      setIsPlaying(true)
      return
    }
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    if (audioRef.current) {
      endedRef.current = false
      audioRef.current.currentTime = time
    }
    setProgress(time)
  }

  const percent = duration > 0 ? (progress / duration) * 100 : 0

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-lg border-t border-white/10 p-4">
      <audio
        ref={audioRef}
        onLoadedMetadata={() => {
          if (audioRef.current && isFinite(audioRef.current.duration)) {
            setDuration(audioRef.current.duration)
          }
        }}
        onTimeUpdate={() => {
          if (audioRef.current && !endedRef.current) {
            setProgress(audioRef.current.currentTime)
          }
        }}
        onEnded={() => {
          endedRef.current = true
          setIsPlaying(false)
          if (audioRef.current) {
            setProgress(audioRef.current.duration)
          }
          onEnded?.()
        }}
      />

      <div className="max-w-4xl mx-auto flex items-center gap-4">
        <button onClick={togglePlay} className="text-white hover:text-primary transition-colors">
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>

        <div className="flex-1 flex items-center gap-2">
          <span className="text-xs text-gray-400 w-10 text-right">{formatTime(progress)}</span>
          <div className="flex-1 relative h-6 flex items-center">
            <div className="absolute w-full h-1 bg-white/20 rounded-full" />
            <div
              className="absolute h-1 bg-primary rounded-full transition-none"
              style={{ width: `${percent}%` }}
            />
            <input
              type="range"
              min={0}
              max={duration || 1}
              step={0.01}
              value={progress}
              onChange={handleSeek}
              className="absolute w-full h-1 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-10"
            />
          </div>
          <span className="text-xs text-gray-400 w-10">{formatTime(duration)}</span>
        </div>

        <div className="flex items-center gap-2">
          <Volume2 size={16} className="text-gray-400" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
          />
        </div>
      </div>
    </div>
  )
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}
