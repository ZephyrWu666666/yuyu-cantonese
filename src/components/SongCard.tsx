'use client'

import Link from 'next/link'
import { Song } from '@/lib/types'
import { useLang } from '@/lib/use-traditional'

interface SongCardProps {
  song: Song
  isLearned?: boolean
}

const DIFF_BADGE = {
  easy: { text: '入门', color: 'bg-jade-dark/50 text-jade' },
  medium: { text: '进阶', color: 'bg-accent/20 text-accent' },
  hard: { text: '挑战', color: 'bg-primary/20 text-primary' },
}

export function SongCard({ song, isLearned }: SongCardProps) {
  const diff = DIFF_BADGE[song.difficulty || 'medium']
  const { convert } = useLang()
  return (
    <Link href={`/song/${song.id}`}>
      <div className="group bg-white/[0.03] border border-white/[0.04] rounded-xl overflow-hidden hover:bg-white/[0.06] transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10 relative cursor-pointer">
        {song.albumCover && (
          <div className="aspect-square overflow-hidden">
            <img
              src={song.albumCover}
              alt={song.album}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          </div>
        )}
        <div className="p-4">
          {isLearned && (
            <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary" title="已学习" />
          )}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-cream-muted">{song.year}</span>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${diff.color}`}>{convert(diff.text)}</span>
          </div>
          <h3 className="text-base font-semibold text-cream group-hover:text-primary transition-colors mb-1 truncate">
            {convert(song.title)}
          </h3>
          <p className="text-xs text-cream-muted truncate">{convert(song.album)}</p>
        </div>
      </div>
    </Link>
  )
}
