'use client'

import { useState } from 'react'
import { ModeSwitch } from '@/components/ModeSwitch'
import { LyricsView } from '@/components/LyricsView'
import { WordList } from '@/components/WordList'
import { AudioPlayer } from '@/components/AudioPlayer'
import { LearningMode, Song } from '@/lib/types'
import { getAdjacentSongs } from '@/lib/songs'
import { useLang } from '@/lib/use-traditional'
import Link from 'next/link'

interface SongContentProps {
  song: Song
}

const DIFF_LABEL = {
  easy: { text: '入门', color: 'bg-green-700/40 text-green-300' },
  medium: { text: '进阶', color: 'bg-yellow-700/40 text-yellow-300' },
  hard: { text: '挑战', color: 'bg-red-700/40 text-red-300' },
}

export function SongContent({ song }: SongContentProps) {
  const [mode, setMode] = useState<LearningMode>('lyrics')
  const [currentAudio, setCurrentAudio] = useState<string | null>(null)
  const [isAutoPlay, setIsAutoPlay] = useState(false)
  const { prev, next } = getAdjacentSongs(song.id)
  const diff = DIFF_LABEL[song.difficulty || 'medium']
  const { convert } = useLang()

  return (
    <main className="min-h-screen px-6 py-8 max-w-4xl mx-auto pb-32">
      <Link href="/" className="text-gray-400 hover:text-primary mb-6 inline-block">
        ← 返回
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{convert(song.title)}</h1>
        <div className="flex items-center gap-3 text-gray-400">
          <span>{convert(song.album)} · {song.year}</span>
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${diff.color}`}>{diff.text}</span>
        </div>
      </div>

      <div className="mb-8 flex justify-center items-center gap-3">
        <ModeSwitch mode={mode} onModeChange={setMode} />
        {mode === 'lyrics' && (
          <button
            onClick={() => {
              if (isAutoPlay) {
                setIsAutoPlay(false)
              } else {
                setIsAutoPlay(true)
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
        )}
      </div>

      <div className="min-h-[400px]">
        {mode === 'lyrics' ? (
          <LyricsView
            songId={song.id}
            lyrics={song.lyrics}
            isAutoPlay={isAutoPlay}
            onAutoPlayEnd={() => setIsAutoPlay(false)}
            onPlayLine={(index, audioPath) => setCurrentAudio(audioPath)}
          />
        ) : (
          <WordList lyrics={song.lyrics} />
        )}
      </div>

      {mode === 'lyrics' && <AudioPlayer src={currentAudio} />}

      <div className="flex justify-between mt-12 pt-8 border-t border-white/10">
        {prev ? (
          <Link href={`/song/${prev.id}`} className="text-gray-400 hover:text-primary transition-colors">
            ← {convert(prev.title)}
          </Link>
        ) : <div />}
        {next ? (
          <Link href={`/song/${next.id}`} className="text-gray-400 hover:text-primary transition-colors">
            {convert(next.title)} →
          </Link>
        ) : <div />}
      </div>
    </main>
  )
}
