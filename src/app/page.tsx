import { getAllSongs } from '@/lib/songs'
import { SongCard } from '@/components/SongCard'

export default function Home() {
  const songs = getAllSongs()

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
          className="w-full max-w-md mx-auto block bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {songs.map((song) => (
          <SongCard key={song.id} song={song} />
        ))}
      </div>
    </main>
  )
}
