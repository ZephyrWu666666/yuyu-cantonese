import { Song } from './types'
import songsData from '@/data/songs.json'

export function getAllSongs(): Song[] {
  return songsData as Song[]
}

export function getSongById(id: string): Song | undefined {
  return songsData.find(song => song.id === id) as Song | undefined
}

export function getAllUniqueWords(): { word: string; pinyin: string; mandarin: string; audioPath: string; songIds: string[] }[] {
  const wordMap = new Map<string, { pinyin: string; mandarin: string; audioPath: string; songIds: Set<string> }>()
  for (const song of songsData as Song[]) {
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
