import { getSongById, getAllSongs } from '@/lib/songs'
import { SongContent } from '@/components/SongContent'
import Link from 'next/link'
import type { Metadata } from 'next'

export function generateStaticParams() {
  const songs = getAllSongs()
  return songs.map((song) => ({
    id: song.id,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const song = getSongById(id)
  if (!song) return { title: '歌曲未找到 - 语于' }

  const lyricsSnippet = song.lyrics.slice(0, 2).map(l => l.cantonese).join('...')
  const desc = `学习${song.title}的粤语发音和含义。${lyricsSnippet}`

  return {
    title: `${song.title} - 语于 | 粤语学习`,
    description: desc,
    openGraph: {
      title: `${song.title} - 语于`,
      description: desc,
      type: 'website',
      siteName: '语于 - 陈奕迅粤语学习',
    },
    twitter: {
      card: 'summary',
      title: `${song.title} - 语于`,
      description: desc,
    },
  }
}

export default async function SongPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const song = getSongById(id)

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
