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
import { ArrowLeft } from 'lucide-react'

interface SongContentProps {
  song: Song
}

const DIFF_LABEL = {
  easy: { text: '入门', color: 'bg-jade-dark/50 text-jade border border-jade/20' },
  medium: { text: '进阶', color: 'bg-accent/20 text-accent border border-accent/20' },
  hard: { text: '挑战', color: 'bg-primary/20 text-primary border border-primary/20' },
}

export function SongContent({ song }: SongContentProps) {
  const [mode, setMode] = useState<LearningMode>('lyrics')
  const [currentAudio, setCurrentAudio] = useState<string | null>(null)
  const [isAutoPlay, setIsAutoPlay] = useState(false)
  const [isPlayingSong, setIsPlayingSong] = useState(false)
  const [activeLineIndex, setActiveLineIndex] = useState<number | null>(null)
  const { prev, next } = getAdjacentSongs(song.id)
  const diff = DIFF_LABEL[song.difficulty || 'medium']
  const { convert } = useLang()

  const handlePlaySong = () => {
    if (isPlayingSong) {
      setIsPlayingSong(false)
      setCurrentAudio(null)
      setActiveLineIndex(null)
    } else {
      setIsPlayingSong(true)
      setIsAutoPlay(false)
      setCurrentAudio(`/songs/${song.id}.mp3`)
      setActiveLineIndex(0)
    }
  }

  const handleAudioTimeUpdate = (currentTime: number) => {
    if (!isPlayingSong) return
    let idx = 0
    for (let i = 0; i < song.lyrics.length; i++) {
      const st = (song.lyrics[i] as any).startTime
      if (typeof st === 'number' && currentTime >= st) {
        idx = i
      } else {
        break
      }
    }
    setActiveLineIndex(prev => prev === idx ? prev : idx)
  }

  const handleAudioEnded = () => {
    setIsPlayingSong(false)
    setActiveLineIndex(null)
  }

  const handlePlayLine = (index: number, audioPath: string) => {
    setIsPlayingSong(false)
    setActiveLineIndex(null)
    setCurrentAudio(audioPath)
  }

  return (
    <main className="min-h-screen px-6 py-8 max-w-4xl mx-auto pb-32">
      <Link href="/" className="text-cream-muted hover:text-primary mb-6 inline-flex items-center gap-1 transition-colors cursor-pointer">
        <ArrowLeft className="w-4 h-4" /> {convert('返回')}
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-cream mb-2 neon-red" style={{ fontFamily: "'Noto Serif SC', serif" }}>
          {convert(song.title)}
        </h1>
        <div className="flex items-center gap-3 text-cream-muted">
          <span>{convert(song.album)} · {song.year}</span>
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${diff.color}`}>{convert(diff.text)}</span>
        </div>
      </div>

      <div className="mb-8 flex justify-center items-center gap-3 flex-wrap">
        <ModeSwitch mode={mode} onModeChange={setMode} />
        {mode === 'lyrics' && (
          <>
            <button
              onClick={handlePlaySong}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                isPlayingSong
                  ? 'btn-retro text-cream'
                  : 'bg-white/[0.03] text-cream-muted hover:text-cream border border-primary/10'
              }`}
            >
              {isPlayingSong ? convert('停止') : convert('原唱')}
            </button>
            <button
              onClick={() => {
                if (isAutoPlay) {
                  setIsAutoPlay(false)
                } else {
                  setIsAutoPlay(true)
                }
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                isAutoPlay
                  ? 'btn-retro text-cream'
                  : 'bg-white/[0.03] text-cream-muted hover:text-cream border border-primary/10'
              }`}
            >
              {isAutoPlay ? convert('退出跟唱') : convert('跟唱')}
            </button>
          </>
        )}
      </div>

      <div className="min-h-[400px]">
        {mode === 'lyrics' ? (
          <LyricsView
            songId={song.id}
            lyrics={song.lyrics}
            isAutoPlay={isAutoPlay}
            onAutoPlayEnd={() => setIsAutoPlay(false)}
            onPlayLine={handlePlayLine}
            activeIndex={activeLineIndex}
          />
        ) : (
          <WordList lyrics={song.lyrics} />
        )}
      </div>

      {mode === 'lyrics' && (
        <AudioPlayer
          src={currentAudio}
          onTimeUpdate={handleAudioTimeUpdate}
          onEnded={handleAudioEnded}
        />
      )}

      <div className="flex justify-between mt-12 pt-8 border-t border-primary/10">
        {prev ? (
          <Link href={`/song/${prev.id}`} className="text-cream-muted hover:text-primary transition-colors cursor-pointer">
            ← {convert(prev.title)}
          </Link>
        ) : <div />}
        {next ? (
          <Link href={`/song/${next.id}`} className="text-cream-muted hover:text-primary transition-colors cursor-pointer">
            {convert(next.title)} →
          </Link>
        ) : <div />}
      </div>
    </main>
  )
}
