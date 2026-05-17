import { getSongById, getAllSongs } from '@/lib/songs'
import { SongContent } from '@/components/SongContent'
import Link from 'next/link'

export function generateStaticParams() {
  const songs = getAllSongs()
  return songs.map((song) => ({
    id: song.id,
  }))
}

export default function SongPage({ params }: { params: { id: string } }) {
  const song = getSongById(params.id)

  if (!song) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-white mb-4">歌曲未找到</h1>
          <Link href="/" className="text-primary hover:underline">返回首页</Link>
        </div>
      </main>
    )
  }

  return <SongContent song={song} />
}
