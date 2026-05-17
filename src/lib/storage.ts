const STORAGE_KEY = 'yuyu-progress'

interface Progress {
  masteredWords: string[]
  lastVisited: string | null
}

export function getProgress(): Progress {
  if (typeof window === 'undefined') return { masteredWords: [], lastVisited: null }
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : { masteredWords: [], lastVisited: null }
  } catch {
    return { masteredWords: [], lastVisited: null }
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
