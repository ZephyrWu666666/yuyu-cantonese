import { Song } from './types'
import songsData from '@/data/songs.json'

export type SortKey = 'year' | 'title' | 'difficulty'

const DIFF_ORDER = { easy: 1, medium: 2, hard: 3 }

export function getAllSongs(sortBy: SortKey = 'year'): Song[] {
  const songs = (songsData as unknown) as Song[]
  return [...songs].sort((a, b) => {
    if (sortBy === 'year') return a.year - b.year
    if (sortBy === 'title') return a.title.localeCompare(b.title, 'zh')
    return (DIFF_ORDER[a.difficulty || 'medium'] || 2) - (DIFF_ORDER[b.difficulty || 'medium'] || 2)
  })
}

export function getSongById(id: string): Song | undefined {
  const songs = (songsData as unknown) as Song[]
  return songs.find(song => song.id === id)
}

export function getAdjacentSongs(id: string): { prev: Song | null; next: Song | null } {
  const songs = getAllSongs('year')
  const idx = songs.findIndex(s => s.id === id)
  return {
    prev: idx > 0 ? songs[idx - 1] : null,
    next: idx < songs.length - 1 ? songs[idx + 1] : null,
  }
}

export function getAllUniqueWords(): { word: string; jyutping: string; mandarin: string; audioPath: string; songIds: string[] }[] {
  const songs = (songsData as unknown) as Song[]
  const wordMap = new Map<string, { jyutping: string; mandarin: string; audioPath: string; songIds: Set<string> }>()
  for (const song of songs) {
    for (const line of song.lyrics) {
      for (const word of line.words) {
        const existing = wordMap.get(word.cantonese)
        if (existing) {
          existing.songIds.add(song.id)
        } else {
          wordMap.set(word.cantonese, {
            jyutping: word.jyutping,
            mandarin: word.mandarin,
            audioPath: word.audioPath,
            songIds: new Set([song.id]),
          })
        }
      }
    }
  }
  return Array.from(wordMap.entries()).map(([word, data]) => ({
    word,
    jyutping: data.jyutping,
    mandarin: data.mandarin,
    audioPath: data.audioPath,
    songIds: Array.from(data.songIds),
  }))
}
