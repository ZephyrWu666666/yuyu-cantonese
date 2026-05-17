'use client'

import { useState } from 'react'
import { LyricLine } from '@/lib/types'

interface LyricsViewProps {
  songId: string
  lyrics: LyricLine[]
  onPlayLine?: (index: number, audioPath: string) => void
}

export function LyricsView({ songId, lyrics, onPlayLine }: LyricsViewProps) {
  const [currentIndex, setCurrentIndex] = useState<number | null>(null)
  const [isAutoPlay, setIsAutoPlay] = useState(false)

  const playLine = (index: number) => {
    setCurrentIndex(index)
    const sentenceAudioPath = `/audio/sentences/${songId}_${String(index).padStart(2, '0')}.mp3`
    onPlayLine?.(index, sentenceAudioPath)

    const lineElement = document.getElementById(`line-${index}`)
    if (lineElement) {
      lineElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            if (isAutoPlay) {
              setIsAutoPlay(false)
              setCurrentIndex(null)
            } else {
              setIsAutoPlay(true)
              playLine(0)
            }
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            isAutoPlay
              ? 'bg-accent text-black'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          {isAutoPlay ? '退出跟唱' : '跟唱'}
        </button>
      </div>

      <div className="space-y-4">
        {lyrics.map((line, index) => (
          <div
            key={index}
            id={`line-${index}`}
            onClick={() => playLine(index)}
            className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${
              currentIndex === index
                ? 'bg-primary/20 border border-primary/50 scale-[1.02]'
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            <p className="text-xl text-white mb-1">{line.cantonese}</p>
            <p className="text-sm text-primary mb-1">{line.pinyin}</p>
            <p className="text-sm text-gray-400">{line.mandarin}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
