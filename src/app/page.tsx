'use client'

import { useState, useMemo } from 'react'
import { getAllSongs } from '@/lib/songs'
import { SongCard } from '@/components/SongCard'

export default function Home() {
  const songs = getAllSongs()
  const [search, setSearch] = useState('')

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
      <div className="mb-8">
        <input
          type="text"
          placeholder="搜索歌曲..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md mx-auto block bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredSongs.map((song) => (
          <SongCard key={song.id} song={song} />
        ))}
      </div>
      {filteredSongs.length === 0 && (
        <p className="text-center text-gray-500 mt-8">没有找到匹配的歌曲</p>
      )}
    </main>
  )
}
