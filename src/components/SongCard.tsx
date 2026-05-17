import Link from 'next/link'
import { Song } from '@/lib/types'

interface SongCardProps {
  song: Song
}

export function SongCard({ song }: SongCardProps) {
  return (
    <Link href={`/song/${song.id}`}>
      <div className="group bg-white/5 backdrop-blur-sm rounded-xl p-5 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-500">{song.year}</span>
        </div>
        <h3 className="text-lg font-semibold text-white group-hover:text-primary transition-colors mb-1">
          {song.title}
        </h3>
        <p className="text-sm text-gray-400">{song.album}</p>
      </div>
    </Link>
  )
}
