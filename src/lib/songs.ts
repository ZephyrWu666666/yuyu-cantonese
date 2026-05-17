import { Song } from './types'
import songsData from '@/data/songs.json'

export function getAllSongs(): Song[] {
  return (songsData as unknown) as Song[]
}

export function getSongById(id: string): Song | undefined {
  const songs = (songsData as unknown) as Song[]
  return songs.find(song => song.id === id)
}

export function getAllUniqueWords(): { word: string; pinyin: string; mandarin: string; audioPath: string; songIds: string[] }[] {
  const songs = (songsData as unknown) as Song[]
  const wordMap = new Map<string, { pinyin: string; mandarin: string; audioPath: string; songIds: Set<string> }>()
  for (const song of songs) {
    for (const line of song.lyrics) {
      for (const word of line.words) {
        const existing = wordMap.get(word.cantonese)
        if (existing) {
          existing.songIds.add(song.id)
        } else {
          wordMap.set(word.cantonese, {
            pinyin: word.pinyin,
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
    pinyin: data.pinyin,
    mandarin: data.mandarin,
    audioPath: data.audioPath,
    songIds: Array.from(data.songIds),
  }))
}
