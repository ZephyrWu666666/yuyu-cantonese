export interface Word {
  cantonese: string    // "偏"
  pinyin: string       // "pin1"
  mandarin: string     // "偏偏"
  audioPath: string    // "/audio/words/pin1.mp3"
}

export interface LyricLine {
  cantonese: string    // "拦路雨偏似雪花"
  pinyin: string       // "laan4 lou6 jyu5 pin1 ci5 syut3 faa1"
  mandarin: string     // "拦路的雨偏偏像雪花"
  words: Word[]        // 该行包含的粤语词汇
}

export interface Song {
  id: string           // "fushishanxia"
  title: string        // "富士山下"
  album: string        // "What's Going On...?"
  year: number         // 2006
  lyrics: LyricLine[]
}

export type LearningMode = 'lyrics' | 'vocabulary'
