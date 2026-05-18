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
    <div className="space-y-4">
      {lyrics.map((line, index) => (
        <div
          key={index}
          id={`line-${index}`}
          onClick={() => handleLineClick(index)}
          style={{ animationDelay: `${index * 0.05}s` }}
          className={`p-4 rounded-lg transition-all duration-300 opacity-0 animate-fadeIn ${
            isAutoPlay ? 'cursor-default' : 'cursor-pointer'
          } ${
            currentIndex === index
              ? 'bg-primary/20 border border-primary/50 scale-[1.02]'
              : 'bg-white/5 hover:bg-white/10'
          }`}
        >
          <p className="text-xl text-white mb-1">{convert(line.cantonese)}</p>
          <p className="text-sm text-primary mb-1">{line.jyutping}</p>
          <p className="text-sm text-gray-400">{line.mandarin}</p>
        </div>
      ))}
    </div>
  )
}
