'use client'

import { useState, useMemo, useRef, useCallback } from 'react'
import { LyricLine } from '@/lib/types'
import { WordCard } from './WordCard'
import { getProgress, saveMasteredWord } from '@/lib/storage'

interface WordListProps {
  lyrics: LyricLine[]
}

export function WordList({ lyrics }: WordListProps) {
  const [masteredWords, setMasteredWords] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set()
    const progress = getProgress()
    return new Set(progress.masteredWords)
  })
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const playAudio = useCallback((src: string) => {
    if (!audioRef.current) return
    audioRef.current.src = src
    audioRef.current.currentTime = 0
    audioRef.current.play().catch(() => {})
  }, [])

  // Extract all unique words from lyrics
  const allWords = useMemo(() => {
    const wordMap = new Map<string, { cantonese: string; jyutping: string; mandarin: string; audioPath: string }>()
    for (const line of lyrics) {
      for (const word of line.words) {
        if (!wordMap.has(word.cantonese)) {
          wordMap.set(word.cantonese, word)
        }
      }
    }
    return Array.from(wordMap.values())
  }, [lyrics])

  // Filter out mastered words
  const unmasteredWords = allWords.filter(w => !masteredWords.has(w.cantonese))

  if (unmasteredWords.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-primary mb-4">所有词汇已掌握！</p>
        <button
          onClick={() => {
            setMasteredWords(new Set())
            localStorage.removeItem('yuyu-progress')
          }}
          className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
        >
          重置
        </button>
      </div>
    )
  }

  return (
    <div>
      <audio ref={audioRef} preload="auto" />
      <div className="text-sm text-gray-400 mb-4">
        剩余 {unmasteredWords.length} / {allWords.length} 个词汇
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {unmasteredWords.map((word) => (
          <WordCard
            key={word.cantonese}
            word={word}
            onPlay={playAudio}
            onMastered={() => {
              setMasteredWords(prev => new Set([...prev, word.cantonese]))
              saveMasteredWord(word.cantonese)
            }}
          />
        ))}
      </div>
    </div>
  )
}
