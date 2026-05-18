const STORAGE_KEY = 'yuyu-progress'

interface Progress {
  masteredWords: string[]
  lastVisited: string | null
  learnedSongs: string[]
}

export function getProgress(): Progress {
  if (typeof window === 'undefined') return { masteredWords: [], lastVisited: null, learnedSongs: [] }
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    const parsed = data ? JSON.parse(data) : {}
    return {
      masteredWords: parsed.masteredWords || [],
      lastVisited: parsed.lastVisited || null,
      learnedSongs: parsed.learnedSongs || [],
    }
  } catch {
    return { masteredWords: [], lastVisited: null, learnedSongs: [] }
  }
}

export function saveMasteredWord(word: string) {
  const progress = getProgress()
  if (!progress.masteredWords.includes(word)) {
    progress.masteredWords.push(word)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  }
}

export function removeMasteredWord(word: string) {
  const progress = getProgress()
  progress.masteredWords = progress.masteredWords.filter(w => w !== word)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export function saveLastVisited(songId: string) {
  const progress = getProgress()
  progress.lastVisited = songId
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export function markSongLearned(songId: string) {
  const progress = getProgress()
  if (!progress.learnedSongs.includes(songId)) {
    progress.learnedSongs.push(songId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  }
}

export function isSongLearned(songId: string): boolean {
  if (typeof window === 'undefined') return false
  return getProgress().learnedSongs.includes(songId)
}

export function getLearnedSongs(): string[] {
  if (typeof window === 'undefined') return []
  return getProgress().learnedSongs
}
