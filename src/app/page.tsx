'use client'

import { useState, useMemo, useEffect } from 'react'
import { getAllSongs, SortKey } from '@/lib/songs'
import { SongCard } from '@/components/SongCard'
import { getLearnedSongs } from '@/lib/storage'
import { useLang } from '@/lib/use-traditional'

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'year', label: '按年份' },
  { key: 'title', label: '按歌名' },
  { key: 'difficulty', label: '按难度' },
]

const BEGINNER_SONGS = ['danche', 'shallwetalk', 'huozhuoduohao']

export default function Home() {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortKey>('year')
  const [learned, setLearned] = useState<string[]>([])
  const { convert } = useLang()

  useEffect(() => {
    setLearned(getLearnedSongs())
  }, [])

  const songs = useMemo(() => getAllSongs(sortBy), [sortBy])

  const filteredSongs = useMemo(() => {
    if (!search.trim()) return songs
    const query = search.toLowerCase()
    return songs.filter(
      song =>
        song.title.toLowerCase().includes(query) ||
        song.album.toLowerCase().includes(query)
    )
  }, [songs, search])

  return (
    <main className="min-h-screen px-6 py-12 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-primary mb-4">语于</h1>
        <p className="text-gray-400 text-lg">在陈奕迅的粤语歌曲中，一步步学会粤语</p>
      </div>

      <div className="bg-white/5 rounded-xl p-6 mb-10 max-w-2xl mx-auto">
        <h2 className="text-white font-semibold mb-2">新手推荐</h2>
        <p className="text-gray-400 text-sm mb-4">从这几首开始，歌词简单、节奏适中</p>
        <div className="flex flex-wrap gap-2">
          {songs.filter(s => BEGINNER_SONGS.includes(s.id)).map(song => (
            <a
              key={song.id}
              href={`/song/${song.id}`}
              className="px-3 py-1.5 bg-primary/20 text-primary rounded-lg text-sm hover:bg-primary/30 transition-colors"
            >
              {convert(song.title)}
            </a>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
        <input
          type="text"
          placeholder="搜索歌曲..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
        />
        <div className="flex gap-1 bg-white/5 rounded-lg p-1">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => setSortBy(opt.key)}
              className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                sortBy === opt.key
                  ? 'bg-primary text-black font-medium'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredSongs.map((song) => (
          <SongCard key={song.id} song={song} isLearned={learned.includes(song.id)} />
        ))}
      </div>
      {filteredSongs.length === 0 && (
        <p className="text-center text-gray-500 mt-8">没有找到匹配的歌曲</p>
      )}
    </main>
  )
}
