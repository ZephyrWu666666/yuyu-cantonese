'use client'

import { useState } from 'react'
import { Word } from '@/lib/types'

interface WordCardProps {
  word: Word
  onMastered: () => void
}

export function WordCard({ word, onMastered }: WordCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div
      className="w-full h-48 cursor-pointer [perspective:1000px]"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${
          isFlipped ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        {/* Front */}
        <div className="absolute inset-0 bg-white/10 rounded-xl p-6 flex flex-col items-center justify-center [backface-visibility:hidden]">
          <p className="text-3xl font-bold text-white mb-2">{word.cantonese}</p>
          <p className="text-lg text-primary">{word.pinyin}</p>
        </div>

        {/* Back */}
        <div className="absolute inset-0 bg-primary/20 rounded-xl p-6 flex flex-col items-center justify-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <p className="text-2xl font-bold text-white mb-2">{word.cantonese}</p>
          <p className="text-lg text-gray-300 mb-4">{word.mandarin}</p>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onMastered()
            }}
            className="px-4 py-2 bg-primary text-black rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors"
          >
            已掌握
          </button>
        </div>
      </div>
    </div>
  )
}
