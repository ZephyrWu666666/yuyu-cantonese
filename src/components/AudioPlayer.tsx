'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Play, Pause, Volume2 } from 'lucide-react'

interface AudioPlayerProps {
  src: string | null
  onEnded?: () => void
  onTimeUpdate?: (currentTime: number) => void
}

export function AudioPlayer({ src, onEnded, onTimeUpdate }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const endedRef = useRef(false)
  const seekingRef = useRef(false)
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
      seekingRef.current = false
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

  const seekToPosition = useCallback((clientX: number) => {
    if (!progressBarRef.current || !audioRef.current || duration <= 0) return
    const rect = progressBarRef.current.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const time = ratio * duration
    endedRef.current = false
    seekingRef.current = true
    audioRef.current.currentTime = time
    setProgress(time)
    setTimeout(() => { seekingRef.current = false }, 300)
  }, [duration])

  const handleBarClick = useCallback((e: React.MouseEvent) => {
    seekToPosition(e.clientX)
  }, [seekToPosition])

  const handleBarPointerDown = useCallback((e: React.PointerEvent) => {
    // Only handle left click
    if (e.button !== 0) return
    seekToPosition(e.clientX)

    const onPointerMove = (ev: PointerEvent) => {
      seekToPosition(ev.clientX)
    }
    const onPointerUp = () => {
      document.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerup', onPointerUp)
    }
    document.addEventListener('pointermove', onPointerMove)
    document.addEventListener('pointerup', onPointerUp)
  }, [seekToPosition])

  const percent = duration > 0 ? (progress / duration) * 100 : 0

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-lg border-t border-primary/10 p-4">
      <audio
        ref={audioRef}
        onLoadedMetadata={() => {
          if (audioRef.current && isFinite(audioRef.current.duration)) {
            setDuration(audioRef.current.duration)
          }
        }}
        onTimeUpdate={() => {
          if (audioRef.current && !endedRef.current && !seekingRef.current) {
            const ct = audioRef.current.currentTime
            setProgress(ct)
            onTimeUpdate?.(ct)
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
        <button onClick={togglePlay} className="text-cream hover:text-primary transition-colors cursor-pointer">
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>

        <div className="flex-1 flex items-center gap-2">
          <span className="text-xs text-cream-muted w-10 text-right">{formatTime(progress)}</span>
          <div
            ref={progressBarRef}
            className="flex-1 relative h-6 flex items-center cursor-pointer select-none touch-none"
            onClick={handleBarClick}
            onPointerDown={handleBarPointerDown}
          >
            <div className="absolute w-full h-1 bg-white/10 rounded-full" />
            <div
              className="absolute h-1 bg-primary rounded-full transition-none shadow-[0_0_6px_rgba(196,30,58,0.4)]"
              style={{ width: `${percent}%` }}
            />
            <div
              className="absolute w-3 h-3 rounded-full bg-primary shadow-[0_0_6px_rgba(196,30,58,0.4)]"
              style={{ left: `calc(${percent}% - 6px)` }}
            />
          </div>
          <span className="text-xs text-cream-muted w-10">{formatTime(duration)}</span>
        </div>

        <div className="flex items-center gap-2">
          <Volume2 size={16} className="text-cream-muted" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-20 h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-jade"
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
