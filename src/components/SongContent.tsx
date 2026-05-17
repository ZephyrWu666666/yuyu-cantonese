'use client'

import { useState } from 'react'
import { ModeSwitch } from '@/components/ModeSwitch'
import { LearningMode, Song } from '@/lib/types'
import Link from 'next/link'

interface SongContentProps {
  song: Song
}

export function SongContent({ song }: SongContentProps) {
  const [mode, setMode] = useState<LearningMode>('lyrics')

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
          <div className="text-gray-400 text-center py-12">歌词模式（待实现）</div>
        ) : (
          <div className="text-gray-400 text-center py-12">词汇模式（待实现）</div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-lg border-t border-white/10 p-4">
        <div className="max-w-4xl mx-auto text-center text-gray-400">
          音频播放器（待实现）
        </div>
      </div>
    </main>
  )
}
