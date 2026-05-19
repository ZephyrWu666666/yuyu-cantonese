'use client'

import { useState, useEffect, useRef } from 'react'
import { LyricLine } from '@/lib/types'
import { useLang } from '@/lib/use-traditional'

interface LyricsViewProps {
  songId: string
  lyrics: LyricLine[]
  isAutoPlay?: boolean
  onAutoPlayEnd?: () => void
  onPlayLine?: (index: number, audioPath: string) => void
}

export function LyricsView({ songId, lyrics, isAutoPlay, onAutoPlayEnd, onPlayLine }: LyricsViewProps) {
  const [currentIndex, setCurrentIndex] = useState<number | null>(null)
  const autoPlayRef = useRef(false)
  const { convert } = useLang()

  const playLine = (index: number) => {
    setCurrentIndex(index)
    const sentenceAudioPath = `/audio/sentences/${songId}_${String(index).padStart(2, '0')}.mp3`
    onPlayLine?.(index, sentenceAudioPath)

    const lineElement = document.getElementById(`line-${index}`)
    if (lineElement) {
      lineElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  useEffect(() => {
    autoPlayRef.current = isAutoPlay ?? false
    if (isAutoPlay) {
      playLine(0)
    } else {
      setCurrentIndex(null)
    }
  }, [isAutoPlay])

  const handleLineClick = (index: number) => {
    if (!isAutoPlay) {
      playLine(index)
    }
  }

  return (
    <div className="space-y-3">
      {lyrics.map((line, index) => (
        <div
          key={index}
          id={`line-${index}`}
          onClick={() => handleLineClick(index)}
          style={{ animationDelay: `${index * 0.05}s` }}
          className={`p-4 rounded-lg transition-all duration-300 opacity-0 animate-fadeIn cursor-pointer ${
            currentIndex === index
              ? 'lyric-active scale-[1.01]'
              : 'bg-white/[0.03] hover:bg-white/[0.06] border-l-3 border-transparent'
          }`}
        >
          <p className="text-xl text-cream mb-1">{convert(line.cantonese)}</p>
          <p className="text-sm text-jade mb-1 font-medium neon-green">{line.jyutping}</p>
          <p className="text-sm text-cream-muted/40">{line.mandarin}</p>
        </div>
      ))}
    </div>
  )
}
