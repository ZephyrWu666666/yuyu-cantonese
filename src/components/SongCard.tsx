'use client'

import Link from 'next/link'
import { Song } from '@/lib/types'
import { useLang } from '@/lib/use-traditional'

interface SongCardProps {
  song: Song
  isLearned?: boolean
}

const DIFF_BADGE = {
  easy: { text: '入门', color: 'bg-green-700/40 text-green-300' },
  medium: { text: '进阶', color: 'bg-yellow-700/40 text-yellow-300' },
  hard: { text: '挑战', color: 'bg-red-700/40 text-red-300' },
}

export function SongCard({ song, isLearned }: SongCardProps) {
  const diff = DIFF_BADGE[song.difficulty || 'medium']
  const { convert } = useLang()
  return (
    <Link href={`/song/${song.id}`}>
      <div className="group bg-white/5 backdrop-blur-sm rounded-xl p-5 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10 relative">
        {isLearned && (
          <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary" title="已学习" />
        )}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-500">{song.year}</span>
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${diff.color}`}>{diff.text}</span>
        </div>
        <h3 className="text-lg font-semibold text-white group-hover:text-primary transition-colors mb-1">
          {convert(song.title)}
        </h3>
        <p className="text-sm text-gray-400">{convert(song.album)}</p>
      </div>
    </Link>
  )
}
