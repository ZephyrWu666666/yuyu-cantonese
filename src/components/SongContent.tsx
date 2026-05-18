'use client'

import { useState } from 'react'
import { ModeSwitch } from '@/components/ModeSwitch'
import { LyricsView } from '@/components/LyricsView'
import { WordList } from '@/components/WordList'
import { AudioPlayer } from '@/components/AudioPlayer'
import { LearningMode, Song } from '@/lib/types'
import Link from 'next/link'

interface SongContentProps {
  song: Song
}

export function SongContent({ song }: SongContentProps) {
  const [mode, setMode] = useState<LearningMode>('lyrics')
  const [currentAudio, setCurrentAudio] = useState<string | null>(null)

  return (
    <main className="min-h-screen px-6 py-8 max-w-4xl mx-auto">
      <Link href="/" className="text-gray-400 hover:text-primary mb-6 inline-block">
        ← 返回
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{song.title}</h1>
        <p className="text-gray-400">{song.album} · {song.year}</p>
      </div>

      <div className="mb-8 flex justify-center">
        <ModeSwitch mode={mode} onModeChange={setMode} />
      </div>

      <div className="min-h-[400px]">
        {mode === 'lyrics' ? (
          <LyricsView songId={song.id} lyrics={song.lyrics} onPlayLine={(index, audioPath) => setCurrentAudio(audioPath)} />
        ) : (
          <WordList lyrics={song.lyrics} />
        )}
      </div>

      {mode === 'lyrics' && <AudioPlayer src={currentAudio} />}
    </main>
  )
}
