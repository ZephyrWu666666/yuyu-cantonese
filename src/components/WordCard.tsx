'use client'

import { useState } from 'react'
import { Word } from '@/lib/types'
import { Volume2 } from 'lucide-react'
import { useLang } from '@/lib/use-traditional'

interface WordCardProps {
  word: Word
  onPlay: (src: string) => void
  onMastered: () => void
}

export function WordCard({ word, onPlay, onMastered }: WordCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const { convert } = useLang()

  const playAudio = (e: React.MouseEvent) => {
    e.stopPropagation()
    onPlay(word.audioPath)
  }

  return (
    <div
      className="w-full h-48 cursor-pointer [perspective:1000px]"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={`relative w-full h-full transition-transform duration-200 [transform-style:preserve-3d] active:scale-95 ${
          isFlipped ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        {/* Front */}
        <div className="absolute inset-0 bg-white/[0.04] border border-white/[0.06] rounded-xl p-6 flex flex-col items-center justify-center [backface-visibility:hidden]">
          <p className="text-3xl font-bold text-cream mb-2">{convert(word.cantonese)}</p>
          <p className="text-lg text-jade mb-3 neon-green">{word.jyutping}</p>
          <button
            onClick={playAudio}
            className="p-2 rounded-full bg-white/[0.06] hover:bg-primary/20 transition-colors cursor-pointer"
          >
            <Volume2 className="w-5 h-5 text-jade" />
          </button>
        </div>

        {/* Back */}
        <div className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-xl p-6 flex flex-col items-center justify-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <p className="text-2xl font-bold text-cream mb-2">{convert(word.cantonese)}</p>
          <p className="text-lg text-cream-muted mb-4">{word.mandarin}</p>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onMastered()
            }}
            className="btn-retro px-4 py-2 text-cream rounded-lg text-sm font-medium cursor-pointer"
          >
            {convert('已掌握')}
          </button>
        </div>
      </div>
    </div>
  )
}
