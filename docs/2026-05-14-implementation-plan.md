# 语于 — 粤语学习网站实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个通过陈奕迅粤语歌曲学习粤语的静态网站，支持歌词逐句拆解和词汇提取两种学习模式，配有 Azure TTS 粤语女声发音。

**Architecture:** Next.js 14+ 静态导出部署到 Vercel。歌词数据从翡翠粤语歌词网站抓取后转为静态 JSON，Azure TTS 预生成音频文件存放在 public/audio/。纯前端，无后端。

**Tech Stack:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, Azure Speech Service

---

## 文件结构

```
语于网站开发/
├── public/
│   └── audio/
│       ├── words/              # 词汇 TTS 音频 (pin1.mp3 等)
│       └── sentences/          # 句子 TTS 音频 (fushishanxia_03.mp3 等)
├── src/
│   ├── app/
│   │   ├── page.tsx            # 首页：歌曲列表
│   │   ├── song/[id]/
│   │   │   └── page.tsx        # 歌曲页：歌词+学习
│   │   ├── layout.tsx          # 全局布局（深色主题）
│   │   └── globals.css         # Tailwind + 全局样式
│   ├── components/
│   │   ├── SongCard.tsx        # 歌曲卡片
│   │   ├── LyricsView.tsx      # 模式A：歌词逐句展示
│   │   ├── WordCard.tsx        # 模式B：词汇卡片（翻转）
│   │   ├── ModeSwitch.tsx      # 模式切换 tab
│   │   └── AudioPlayer.tsx     # 底部音频控制条
│   ├── lib/
│   │   ├── types.ts            # TypeScript 类型定义
│   │   └── songs.ts            # 歌曲数据加载函数
│   └── data/
│       └── songs.json          # 40首歌的结构化歌词数据
├── scripts/
│   ├── scrape-lyrics.ts        # 歌词抓取脚本
│   └── generate-audio.ts       # Azure TTS 音频生成脚本
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── .env.example
```

---

## Task 1: 项目初始化

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts`, `.env.example`, `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`

- [ ] **Step 1: 创建 Next.js 项目**

```bash
cd "/Users/zephyrwu/Desktop/语于网站开发"
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --no-import-alias
```

- [ ] **Step 2: 安装额外依赖**

```bash
npm install lucide-react clsx
npm install -D @types/node
```

- [ ] **Step 3: 配置 next.config.ts 支持静态导出**

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
}

export default nextConfig
```

- [ ] **Step 4: 配置 tailwind.config.ts 深色主题**

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4ade80',
        accent: '#f59e0b',
        surface: {
          DEFAULT: '#0a0a0a',
          light: '#1a1a2e',
        },
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 5: 创建 .env.example**

```
AZURE_SPEECH_KEY=your_azure_speech_key
AZURE_SPEECH_REGION=your_azure_region
```

- [ ] **Step 6: 更新 globals.css**

```css
/* src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
  color: #e5e5e5;
  min-height: 100vh;
}
```

- [ ] **Step 7: 更新 layout.tsx**

```tsx
// src/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '语于 — 通过陈奕迅的歌学粤语',
  description: '在陈奕迅的粤语歌曲中逐步学会粤语',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-Hant">
      <body className="antialiased">{children}</body>
    </html>
  )
}
```

- [ ] **Step 8: 创建占位首页**

```tsx
// src/app/page.tsx
export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <h1 className="text-4xl font-bold text-primary">语于</h1>
    </main>
  )
}
```

- [ ] **Step 9: 验证项目能启动**

```bash
npm run dev
```

Expected: 浏览器打开 http://localhost:3000 显示「语于」标题

- [ ] **Step 10: 提交**

```bash
git init
git add .
git commit -m "chore: initialize Next.js project with TypeScript and Tailwind"
```

---

## Task 2: 类型定义与数据结构

**Files:**
- Create: `src/lib/types.ts`

- [ ] **Step 1: 创建类型定义文件**

```typescript
// src/lib/types.ts
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
```

- [ ] **Step 2: 创建数据加载函数**

```typescript
// src/lib/songs.ts
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
```

- [ ] **Step 3: 提交**

```bash
git add src/lib/types.ts src/lib/songs.ts
git commit -m "feat: add TypeScript types and data loading functions"
```

---

## Task 3: 歌词数据抓取脚本

**Files:**
- Create: `scripts/scrape-lyrics.ts`

- [ ] **Step 1: 安装抓取依赖**

```bash
npm install -D axios cheerio ts-node
```

- [ ] **Step 2: 创建歌词抓取脚本**

```typescript
// scripts/scrape-lyrics.ts
import * as fs from 'fs'
import * as path from 'path'

// 歌曲列表（ID, 中文名, 专辑, 年份）
const SONGS = [
  { id: 'shiguangdaoliu20nian', title: '时光倒流二十年', album: 'Live In Hong Kong', year: 2013 },
  { id: 'danche', title: '单车', album: 'Shall We Dance? Shall We Talk!', year: 2001 },
  { id: 'shilianshaotai', title: '失恋太少', album: 'U87', year: 2005 },
  { id: 'shallwetalk', title: 'Shall We Talk', album: 'Shall We Dance? Shall We Talk!', year: 2001 },
  { id: 'huozhuoduohao', title: '活着多好', album: 'The Easy Ride', year: 2001 },
  { id: 'redaiyulin', title: '热带雨林', album: 'The Line-Up', year: 2002 },
  { id: '1874', title: '1874', album: 'The Line-Up', year: 2002 },
  { id: 'mingjinjintian', title: '明年今日', album: 'The Line-Up', year: 2002 },
  { id: 'suiyueruge', title: '岁月如歌', album: 'Live For Today', year: 2003 },
  { id: 'shimianmaifu', title: '十面埋伏', album: 'Live For Today', year: 2003 },
  { id: 'fukua', title: '浮夸', album: 'U87', year: 2005 },
  { id: 'xiyangwuxianhao', title: '夕阳无限好', album: 'U87', year: 2005 },
  { id: 'aniu', title: '阿牛', album: 'Great 5000 Secs', year: 2005 },
  { id: 'luohualiushui', title: '落花流水', album: 'Life Continues', year: 2006 },
  { id: 'tiangongdidao', title: '天公地道', album: 'Life Continues', year: 2006 },
  { id: 'yueyucanpian', title: '粤语残片', album: 'Shall We Dance? Shall We Talk!', year: 2001 },
  { id: 'burubujian', title: '不如不见', album: 'What\'s Going On...?', year: 2006 },
  { id: 'fushishanxia', title: '富士山下', album: 'What\'s Going On...?', year: 2006 },
  { id: 'heizeming', title: '黑择明', album: 'What\'s Going On...?', year: 2006 },
  { id: 'baimeigui', title: '白玫瑰', album: 'What\'s Going On...?', year: 2006 },
  { id: 'qunxiazhichen', title: '裙下之臣', album: 'What\'s Going On...?', year: 2006 },
  { id: 'shalong', title: '沙龙', album: 'Solidays', year: 2009 },
  { id: 'bulaibuyequ', title: '不来也不去', album: 'Solidays', year: 2009 },
  { id: 'taiyangzhaochangshengqi', title: '太阳照常升起', album: 'Solidays', year: 2009 },
  { id: 'qibainianhou', title: '七百年后', album: 'Solidays', year: 2009 },
  { id: 'yuxinyoukui', title: '于心有愧', album: 'Solidays', year: 2009 },
  { id: 'haiyoushenmekeyisonggeini', title: '还有什么可以送给你', album: 'Solidays', year: 2009 },
  { id: 'allegro', title: 'Allegro, Opus 3.3 a.m.', album: 'Time Flies', year: 2010 },
  { id: 'tuofeilun', title: '陀飞轮', album: 'Time Flies', year: 2010 },
  { id: 'yisibuagua', title: '一丝不挂', album: 'Time Flies', year: 2010 },
  { id: 'wurenzhijing', title: '无人之境', album: 'Time Flies', year: 2010 },
  { id: 'kugua', title: '苦瓜', album: 'Stranger Under My Skin', year: 2011 },
  { id: 'zuijisunyou', title: '最佳损友', album: 'Life Continues', year: 2006 },
  { id: 'wan', title: '完', album: '...3mm', year: 2012 },
  { id: 'yuanzaizhichi', title: '远在咫尺', album: '...3mm', year: 2012 },
  { id: 'sidegeermoqingren', title: '斯德哥尔摩情人', album: '...3mm', year: 2012 },
  { id: 'renwoxing', title: '任我行', album: 'The Key', year: 2013 },
  { id: 'putaochengshushi', title: '葡萄成熟时', album: 'The Key', year: 2013 },
  { id: 'kgezhiwang', title: 'K歌之王', album: '68°C', year: 2000 },
]

interface ScrapedLine {
  cantonese: string
  pinyin: string
  mandarin: string
}

// 从翡翠粤语歌词网站抓取单首歌歌词
async function scrapeSongLyrics(songId: string, songTitle: string): Promise<ScrapedLine[]> {
  // TODO: 用户需要提供翡翠粤语歌词网站的具体URL格式
  // 以下是通用抓取逻辑，需要根据实际网站结构调整
  const url = `https://www.example.com/song/${songId}` // 替换为实际URL

  try {
    const response = await fetch(url)
    const html = await response.text()

    // 解析HTML提取歌词
    // 实际实现需要根据网站DOM结构编写选择器
    const lines: ScrapedLine[] = []

    // 这里需要根据实际网站结构实现解析逻辑
    // 示例：从HTML中提取粤语歌词行、粤拼、普通话翻译

    return lines
  } catch (error) {
    console.error(`Failed to scrape ${songTitle}:`, error)
    return []
  }
}

// 为歌词行生成词汇数据
function extractWords(line: ScrapedLine): { cantonese: string; pinyin: string; mandarin: string; audioPath: string }[] {
  // 简单分词：按字分割，实际项目中应使用粤语分词工具
  const words: { cantonese: string; pinyin: string; mandarin: string; audioPath: string }[] = []

  // 按空格分割粤拼，对应粤语字
  const jyutpingSyllables = line.pinyin.split(' ')
  const characters = line.cantonese.split('')

  for (let i = 0; i < Math.min(characters.length, jyutpingSyllables.length); i++) {
    words.push({
      cantonese: characters[i],
      pinyin: jyutpingSyllables[i],
      mandarin: '', // 需要人工补充
      audioPath: `/audio/words/${jyutpingSyllables[i]}.mp3`,
    })
  }

  return words
}

async function main() {
  console.log('开始抓取歌词数据...')
  const songs: any[] = []

  for (const song of SONGS) {
    console.log(`正在处理: ${song.title}`)
    const lines = await scrapeSongLyrics(song.id, song.title)

    songs.push({
      id: song.id,
      title: song.title,
      album: song.album,
      year: song.year,
      lyrics: lines.map((line, index) => ({
        cantonese: line.cantonese,
        pinyin: line.pinyin,
        mandarin: line.mandarin,
        words: extractWords(line),
      })),
    })
  }

  const outputPath = path.join(__dirname, '../src/data/songs.json')
  fs.writeFileSync(outputPath, JSON.stringify(songs, null, 2), 'utf-8')
  console.log(`歌词数据已保存到 ${outputPath}`)
}

main().catch(console.error)
```

- [ ] **Step 3: 用户确认翡翠粤语歌词网站URL后，实现实际抓取逻辑**

需要用户提供：
1. 翡翠粤语歌词网站的准确URL
2. 歌词页面的HTML结构（选择器）

然后更新 `scrapeSongLyrics` 函数中的URL和解析逻辑。

- [ ] **Step 4: 提交**

```bash
git add scripts/scrape-lyrics.ts package.json
git commit -m "feat: add lyrics scraping script with song list"
```

---

## Task 4: 创建示例歌曲数据

**Files:**
- Create: `src/data/songs.json`

- [ ] **Step 1: 创建一首歌的完整示例数据**

在抓取脚本跑通之前，先手动创建一首歌的数据用于开发：

```json
[
  {
    "id": "fushishanxia",
    "title": "富士山下",
    "album": "What's Going On...?",
    "year": 2006,
    "lyrics": [
      {
        "cantonese": "拦路雨偏似雪花",
        "pinyin": "laan4 lou6 jyu5 pin1 ci5 syut3 faa1",
        "mandarin": "拦路的雨偏偏像雪花",
        "words": [
          { "cantonese": "拦", "pinyin": "laan4", "mandarin": "拦住", "audioPath": "/audio/words/laan4.mp3" },
          { "cantonese": "路", "pinyin": "lou6", "mandarin": "路", "audioPath": "/audio/words/lou6.mp3" },
          { "cantonese": "雨", "pinyin": "jyu5", "mandarin": "雨", "audioPath": "/audio/words/jyu5.mp3" },
          { "cantonese": "偏", "pinyin": "pin1", "mandarin": "偏偏", "audioPath": "/audio/words/pin1.mp3" },
          { "cantonese": "似", "pinyin": "ci5", "mandarin": "像", "audioPath": "/audio/words/ci5.mp3" },
          { "cantonese": "雪", "pinyin": "syut3", "mandarin": "雪", "audioPath": "/audio/words/syut3.mp3" },
          { "cantonese": "花", "pinyin": "faa1", "mandarin": "花", "audioPath": "/audio/words/faa1.mp3" }
        ]
      },
      {
        "cantonese": "饮泣的你冻吗",
        "pinyin": "jam5 jap1 dik1 nei5 dung3 maa3",
        "mandarin": "哭泣的你冷吗",
        "words": [
          { "cantonese": "饮泣", "pinyin": "jam5 jap1", "mandarin": "哭泣", "audioPath": "/audio/words/jam5-jap1.mp3" },
          { "cantonese": "你", "pinyin": "nei5", "mandarin": "你", "audioPath": "/audio/words/nei5.mp3" },
          { "cantonese": "冻", "pinyin": "dung3", "mandarin": "冷", "audioPath": "/audio/words/dung3.mp3" },
          { "cantonese": "吗", "pinyin": "maa3", "mandarin": "吗", "audioPath": "/audio/words/maa3.mp3" }
        ]
      }
    ]
  }
]
```

- [ ] **Step 2: 验证数据加载**

```bash
npm run dev
```

在浏览器 console 中验证 `songs.json` 能正确加载。

- [ ] **Step 3: 提交**

```bash
git add src/data/songs.json
git commit -m "feat: add sample song data for fushishanxia"
```

---

## Task 5: Azure TTS 音频生成脚本

**Files:**
- Create: `scripts/generate-audio.ts`
- Create: `public/audio/words/`, `public/audio/sentences/`

- [ ] **Step 1: 安装 Azure Speech SDK**

```bash
npm install -D microsoft-cognitiveservices-speech-sdk dotenv
```

- [ ] **Step 2: 创建 .env 文件（从 .env.example 复制）**

```bash
cp .env.example .env
# 填入 Azure Speech Service 的 key 和 region
```

- [ ] **Step 3: 创建音频生成脚本**

```typescript
// scripts/generate-audio.ts
import * as fs from 'fs'
import * as path from 'path'
import * as sdk from 'microsoft-cognitiveservices-speech-sdk'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env' })

const speechKey = process.env.AZURE_SPEECH_KEY!
const speechRegion = process.env.AZURE_SPEECH_REGION!
const voiceName = 'zh-HK-HiuMaanNeural'

const wordsDir = path.join(__dirname, '../public/audio/words')
const sentencesDir = path.join(__dirname, '../public/audio/sentences')

// 确保目录存在
fs.mkdirSync(wordsDir, { recursive: true })
fs.mkdirSync(sentencesDir, { recursive: true })

async function generateAudio(text: string, outputPath: string): Promise<void> {
  const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion)
  speechConfig.speechSynthesisVoiceName = voiceName
  speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3

  const audioConfig = sdk.AudioConfig.fromAudioFileOutput(outputPath)
  const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig)

  return new Promise((resolve, reject) => {
    synthesizer.speakTextAsync(
      text,
      (result) => {
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          console.log(`Generated: ${outputPath}`)
          resolve()
        } else {
          reject(new Error(`Synthesis failed: ${result.errorDetails}`))
        }
        synthesizer.close()
      },
      (error) => {
        reject(error)
        synthesizer.close()
      }
    )
  })
}

async function main() {
  const songsPath = path.join(__dirname, '../src/data/songs.json')
  const songs = JSON.parse(fs.readFileSync(songsPath, 'utf-8'))

  const wordSet = new Set<string>()
  const wordData: { text: string; path: string }[] = []

  // 收集所有唯一词汇
  for (const song of songs) {
    for (const line of song.lyrics) {
      for (const word of line.words) {
        if (!wordSet.has(word.audioPath)) {
          wordSet.add(word.audioPath)
          wordData.push({ text: word.cantonese, path: path.join(__dirname, '../public', word.audioPath) })
        }
      }
    }
  }

  // 生成词汇音频
  console.log(`开始生成 ${wordData.length} 个词汇音频...`)
  for (const word of wordData) {
    if (!fs.existsSync(word.path)) {
      await generateAudio(word.text, word.path)
      // 避免 API 限流
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  // 生成句子音频
  console.log('开始生成句子音频...')
  for (const song of songs) {
    for (let i = 0; i < song.lyrics.length; i++) {
      const line = song.lyrics[i]
      const sentencePath = path.join(sentencesDir, `${song.id}_${String(i).padStart(2, '0')}.mp3`)

      if (!fs.existsSync(sentencePath)) {
        await generateAudio(line.cantonese, sentencePath)
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
  }

  console.log('音频生成完成！')
}

main().catch(console.error)
```

- [ ] **Step 4: 运行生成脚本（需要 Azure key）**

```bash
npx ts-node scripts/generate-audio.ts
```

Expected: 在 `public/audio/words/` 和 `public/audio/sentences/` 中生成 mp3 文件

- [ ] **Step 5: 提交**

```bash
git add scripts/generate-audio.ts .env.example
git commit -m "feat: add Azure TTS audio generation script"
```

---

## Task 6: 首页 — 歌曲列表

**Files:**
- Create: `src/components/SongCard.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: 创建 SongCard 组件**

```tsx
// src/components/SongCard.tsx
import Link from 'next/link'
import { Song } from '@/lib/types'

interface SongCardProps {
  song: Song
}

export function SongCard({ song }: SongCardProps) {
  return (
    <Link href={`/song/${song.id}`}>
      <div className="group bg-white/5 backdrop-blur-sm rounded-xl p-5 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-500">{song.year}</span>
        </div>
        <h3 className="text-lg font-semibold text-white group-hover:text-primary transition-colors mb-1">
          {song.title}
        </h3>
        <p className="text-sm text-gray-400">{song.album}</p>
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: 更新首页**

```tsx
// src/app/page.tsx
import { getAllSongs } from '@/lib/songs'
import { SongCard } from '@/components/SongCard'

export default function Home() {
  const songs = getAllSongs()

  return (
    <main className="min-h-screen px-6 py-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-primary mb-4">语于</h1>
        <p className="text-gray-400 text-lg">在陈奕迅的粤语歌曲中，一步步学会粤语</p>
      </div>

      {/* Search (placeholder for Phase 3) */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="搜索歌曲..."
          className="w-full max-w-md mx-auto block bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
        />
      </div>

      {/* Song Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {songs.map((song) => (
          <SongCard key={song.id} song={song} />
        ))}
      </div>
    </main>
  )
}
```

- [ ] **Step 3: 验证首页显示**

```bash
npm run dev
```

Expected: 浏览器显示歌曲卡片网格，点击可跳转（虽然歌曲页还没做好）

- [ ] **Step 4: 提交**

```bash
git add src/components/SongCard.tsx src/app/page.tsx
git commit -m "feat: add home page with song card grid"
```

---

## Task 7: 歌曲页 — 模式切换与布局

**Files:**
- Create: `src/components/ModeSwitch.tsx`, `src/app/song/[id]/page.tsx`

- [ ] **Step 1: 创建 ModeSwitch 组件**

```tsx
// src/components/ModeSwitch.tsx
'use client'

import { LearningMode } from '@/lib/types'

interface ModeSwitchProps {
  mode: LearningMode
  onModeChange: (mode: LearningMode) => void
}

export function ModeSwitch({ mode, onModeChange }: ModeSwitchProps) {
  return (
    <div className="flex bg-white/5 rounded-lg p-1">
      <button
        onClick={() => onModeChange('lyrics')}
        className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
          mode === 'lyrics'
            ? 'bg-primary text-black'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        逐句学习
      </button>
      <button
        onClick={() => onModeChange('vocabulary')}
        className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
          mode === 'vocabulary'
            ? 'bg-primary text-black'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        词汇学习
      </button>
    </div>
  )
}
```

- [ ] **Step 2: 创建歌曲页面**

```tsx
// src/app/song/[id]/page.tsx
'use client'

import { useParams } from 'next/navigation'
import { useState } from 'react'
import { getSongById } from '@/lib/songs'
import { ModeSwitch } from '@/components/ModeSwitch'
import { LearningMode } from '@/lib/types'
import Link from 'next/link'

export default function SongPage() {
  const params = useParams()
  const song = getSongById(params.id as string)
  const [mode, setMode] = useState<LearningMode>('lyrics')

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

  return (
    <main className="min-h-screen px-6 py-8 max-w-4xl mx-auto">
      {/* Back button */}
      <Link href="/" className="text-gray-400 hover:text-primary mb-6 inline-block">
        ← 返回
      </Link>

      {/* Song info */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{song.title}</h1>
        <p className="text-gray-400">{song.album} · {song.year}</p>
      </div>

      {/* Mode switch */}
      <div className="mb-8 flex justify-center">
        <ModeSwitch mode={mode} onModeChange={setMode} />
      </div>

      {/* Content area */}
      <div className="min-h-[400px]">
        {mode === 'lyrics' ? (
          <div>歌词模式（待实现）</div>
        ) : (
          <div>词汇模式（待实现）</div>
        )}
      </div>

      {/* Audio player placeholder */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-lg border-t border-white/10 p-4">
        <div className="max-w-4xl mx-auto text-center text-gray-400">
          音频播放器（待实现）
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 3: 验证歌曲页**

```bash
npm run dev
```

Expected: 点击首页歌曲卡片 → 进入歌曲页 → 显示歌名、专辑、模式切换按钮

- [ ] **Step 4: 提交**

```bash
git add src/components/ModeSwitch.tsx src/app/song/[id]/page.tsx
git commit -m "feat: add song page with mode switching"
```

---

## Task 8: 模式A — 歌词逐句展示

**Files:**
- Create: `src/components/LyricsView.tsx`
- Modify: `src/app/song/[id]/page.tsx`

- [ ] **Step 1: 创建 LyricsView 组件**

```tsx
// src/components/LyricsView.tsx
'use client'

import { useState, useRef } from 'react'
import { LyricLine } from '@/lib/types'

interface LyricsViewProps {
  songId: string
  lyrics: LyricLine[]
}

export function LyricsView({ songId, lyrics }: LyricsViewProps) {
  const [currentIndex, setCurrentIndex] = useState<number | null>(null)
  const [isAutoPlay, setIsAutoPlay] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const playLine = (index: number) => {
    setCurrentIndex(index)
    const sentenceAudioPath = `/audio/sentences/${songId}_${String(index).padStart(2, '0')}.mp3`
    onPlayLine?.(index, sentenceAudioPath)

    // Auto scroll to current line
    const lineElement = document.getElementById(`line-${index}`)
    if (lineElement) {
      lineElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  return (
    <div>
      {/* Sing along button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            if (isAutoPlay) {
              setIsAutoPlay(false)
              setCurrentIndex(null)
            } else {
              setIsAutoPlay(true)
              playLine(0)
            }
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            isAutoPlay
              ? 'bg-accent text-black'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          {isAutoPlay ? '退出跟唱' : '跟唱'}
        </button>
      </div>

      {/* Lyrics lines */}
      <div ref={containerRef} className="space-y-4">
        {lyrics.map((line, index) => (
          <div
            key={index}
            id={`line-${index}`}
            onClick={() => playLine(index)}
            className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${
              currentIndex === index
                ? 'bg-primary/20 border border-primary/50 scale-[1.02]'
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            <p className="text-xl text-white mb-1">{line.cantonese}</p>
            <p className="text-sm text-primary mb-1">{line.pinyin}</p>
            <p className="text-sm text-gray-400">{line.mandarin}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 在歌曲页中集成 LyricsView**

```tsx
// src/app/song/[id]/page.tsx
// 在 import 部分添加:
import { LyricsView } from '@/components/LyricsView'

// 在 Content area 部分替换:
{mode === 'lyrics' ? (
  <LyricsView lyrics={song.lyrics} />
) : (
  <div>词汇模式（待实现）</div>
)}
```

- [ ] **Step 3: 验证歌词展示**

```bash
npm run dev
```

Expected: 歌曲页显示歌词，每行有粤语、粤拼、翻译，点击高亮，跟唱按钮可切换

- [ ] **Step 4: 提交**

```bash
git add src/components/LyricsView.tsx src/app/song/[id]/page.tsx
git commit -m "feat: add lyrics view with sentence highlighting and sing-along mode"
```

---

## Task 9: 模式B — 词汇卡片学习

**Files:**
- Create: `src/components/WordCard.tsx`
- Modify: `src/app/song/[id]/page.tsx`

- [ ] **Step 1: 创建 WordCard 组件**

```tsx
// src/components/WordCard.tsx
'use client'

import { useState } from 'react'
import { Word } from '@/lib/types'

interface WordCardProps {
  word: Word
  onMastered: () => void
}

export function WordCard({ word, onMastered }: WordCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div
      className="perspective-1000 w-full h-48 cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <div
          className={`absolute inset-0 bg-white/10 rounded-xl p-6 flex flex-col items-center justify-center backface-hidden ${
            isFlipped ? 'hidden' : ''
          }`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <p className="text-3xl font-bold text-white mb-2">{word.cantonese}</p>
          <p className="text-lg text-primary">{word.pinyin}</p>
        </div>

        {/* Back */}
        <div
          className={`absolute inset-0 bg-primary/20 rounded-xl p-6 flex flex-col items-center justify-center backface-hidden ${
            !isFlipped ? 'hidden' : ''
          }`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <p className="text-2xl font-bold text-white mb-2">{word.cantonese}</p>
          <p className="text-lg text-gray-300 mb-4">{word.mandarin}</p>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onMastered()
            }}
            className="px-4 py-2 bg-primary text-black rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors"
          >
            已掌握
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 创建词汇列表组件**

```tsx
// src/components/WordList.tsx
'use client'

import { useState, useMemo } from 'react'
import { LyricLine } from '@/lib/types'
import { WordCard } from './WordCard'

interface WordListProps {
  lyrics: LyricLine[]
}

export function WordList({ lyrics }: WordListProps) {
  const [masteredWords, setMasteredWords] = useState<Set<string>>(new Set())

  // 从歌词中提取所有唯一词汇
  const allWords = useMemo(() => {
    const wordMap = new Map<string, { cantonese: string; pinyin: string; mandarin: string; audioPath: string }>()
    for (const line of lyrics) {
      for (const word of line.words) {
        if (!wordMap.has(word.cantonese)) {
          wordMap.set(word.cantonese, word)
        }
      }
    }
    return Array.from(wordMap.values())
  }, [lyrics])

  // 过滤掉已掌握的词汇
  const unmasteredWords = allWords.filter(w => !masteredWords.has(w.cantonese))

  if (unmasteredWords.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-primary mb-4">所有词汇已掌握！</p>
        <button
          onClick={() => setMasteredWords(new Set())}
          className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
        >
          重置
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="text-sm text-gray-400 mb-4">
        剩余 {unmasteredWords.length} / {allWords.length} 个词汇
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {unmasteredWords.map((word) => (
          <WordCard
            key={word.cantonese}
            word={word}
            onMastered={() => {
              setMasteredWords(prev => new Set([...prev, word.cantonese]))
            }}
          />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: 在歌曲页中集成 WordList**

```tsx
// src/app/song/[id]/page.tsx
// 在 import 部分添加:
import { WordList } from '@/components/WordList'

// 在 Content area 部分替换:
{mode === 'lyrics' ? (
  <LyricsView lyrics={song.lyrics} />
) : (
  <WordList lyrics={song.lyrics} />
)}
```

- [ ] **Step 4: 验证词汇卡片**

```bash
npm run dev
```

Expected: 切换到词汇模式 → 显示卡片网格 → 点击翻转 → 显示普通话意思 → 点击「已掌握」卡片消失

- [ ] **Step 5: 提交**

```bash
git add src/components/WordCard.tsx src/components/WordList.tsx src/app/song/[id]/page.tsx
git commit -m "feat: add vocabulary card learning with flip animation and mastery tracking"
```

---

## Task 10: 音频播放器

**Files:**
- Create: `src/components/AudioPlayer.tsx`
- Modify: `src/app/song/[id]/page.tsx`, `src/components/LyricsView.tsx`

- [ ] **Step 1: 创建 AudioPlayer 组件**

```tsx
// src/components/AudioPlayer.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react'

interface AudioPlayerProps {
  src: string | null
  onEnded?: () => void
}

export function AudioPlayer({ src, onEnded }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  useEffect(() => {
    if (src && audioRef.current) {
      audioRef.current.src = src
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {})
    }
  }, [src])

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-lg border-t border-white/10 p-4">
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setProgress(audioRef.current.currentTime)
            setDuration(audioRef.current.duration || 0)
          }
        }}
        onEnded={() => {
          setIsPlaying(false)
          onEnded?.()
        }}
      />

      <div className="max-w-4xl mx-auto flex items-center gap-4">
        <button onClick={togglePlay} className="text-white hover:text-primary transition-colors">
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>

        <div className="flex-1">
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={progress}
            onChange={(e) => {
              const time = parseFloat(e.target.value)
              if (audioRef.current) audioRef.current.currentTime = time
              setProgress(time)
            }}
            className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <Volume2 size={16} className="text-gray-400" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
          />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 在歌曲页集成 AudioPlayer**

```tsx
// src/app/song/[id]/page.tsx
import { AudioPlayer } from '@/components/AudioPlayer'

// 添加 state
const [currentAudio, setCurrentAudio] = useState<string | null>(null)

// 在 return 末尾、main 标签关闭前添加:
<AudioPlayer src={currentAudio} />
```

- [ ] **Step 3: 更新 LyricsView 支持音频播放**

```tsx
// src/components/LyricsView.tsx
// 修改 props:
interface LyricsViewProps {
  lyrics: LyricLine[]
  onPlayLine?: (index: number, audioPath: string) => void
}

// 修改 playLine 函数:
const playLine = (index: number) => {
  setCurrentIndex(index)
  const sentenceAudioPath = `/audio/sentences/${songId}_${String(index).padStart(2, '0')}.mp3`
  onPlayLine?.(index, sentenceAudioPath)
  // scroll logic...
}
```

- [ ] **Step 4: 验证音频播放**

```bash
npm run dev
```

Expected: 点击歌词行 → 底部播放器出现 → 播放该句音频 → 进度条更新

- [ ] **Step 5: 提交**

```bash
git add src/components/AudioPlayer.tsx src/components/LyricsView.tsx src/app/song/[id]/page.tsx
git commit -m "feat: add audio player with playback controls"
```

---

## Task 11: 搜索筛选功能

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: 添加搜索和筛选逻辑**

```tsx
// src/app/page.tsx
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
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-primary mb-4">语于</h1>
        <p className="text-gray-400 text-lg">在陈奕迅的粤语歌曲中，一步步学会粤语</p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="搜索歌曲..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md mx-auto block bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* Song Grid */}
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
```

- [ ] **Step 2: 验证搜索功能**

```bash
npm run dev
```

Expected: 输入歌名/专辑名 → 实时过滤显示匹配歌曲

- [ ] **Step 3: 提交**

```bash
git add src/app/page.tsx
git commit -m "feat: add song search functionality"
```

---

## Task 12: 本地进度存储

**Files:**
- Modify: `src/components/WordList.tsx`, `src/app/page.tsx`

- [ ] **Step 1: 创建 localStorage 工具函数**

```typescript
// src/lib/storage.ts
const STORAGE_KEY = 'yuyu-progress'

interface Progress {
  masteredWords: string[]  // 已掌握的词汇列表
  lastVisited: string | null  // 最后访问的歌曲ID
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
```

- [ ] **Step 2: 更新 WordList 使用 localStorage**

```tsx
// src/components/WordList.tsx
import { getProgress, saveMasteredWord } from '@/lib/storage'

// 在组件内部:
const [masteredWords, setMasteredWords] = useState<Set<string>>(() => {
  const progress = getProgress()
  return new Set(progress.masteredWords)
})

const handleMastered = (word: string) => {
  setMasteredWords(prev => new Set([...prev, word]))
  saveMasteredWord(word)
}
```

- [ ] **Step 3: 验证进度保存**

```bash
npm run dev
```

Expected: 标记词汇已掌握 → 刷新页面 → 词汇仍为已掌握状态

- [ ] **Step 4: 提交**

```bash
git add src/lib/storage.ts src/components/WordList.tsx
git commit -m "feat: persist learning progress to localStorage"
```

---

## Task 13: UI 打磨与动画

**Files:**
- Modify: `src/components/LyricsView.tsx`, `src/components/WordCard.tsx`, `src/app/globals.css`

- [ ] **Step 1: 添加词汇卡片翻转动画样式**

```css
/* src/app/globals.css - 添加 */
.perspective-1000 {
  perspective: 1000px;
}

.transform-style-preserve-3d {
  transform-style: preserve-3d;
}

.rotate-y-180 {
  transform: rotateY(180deg);
}

.backface-hidden {
  backface-visibility: hidden;
}
```

- [ ] **Step 2: 更新 WordCard 使用 CSS 动画替代 JS 切换**

```tsx
// src/components/WordCard.tsx - 简化翻转逻辑
<div
  className={`relative w-full h-full transition-transform duration-500 ${
    isFlipped ? '[transform:rotateY(180deg)]' : ''
  }`}
  style={{ transformStyle: 'preserve-3d' }}
>
  <div className="absolute inset-0 bg-white/10 rounded-xl p-6 flex flex-col items-center justify-center [backface-visibility:hidden]">
    {/* Front content */}
  </div>
  <div className="absolute inset-0 bg-primary/20 rounded-xl p-6 flex flex-col items-center justify-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
    {/* Back content */}
  </div>
</div>
```

- [ ] **Step 3: 添加歌词行进入动画**

```tsx
// src/components/LyricsView.tsx - 在歌词行 div 上添加
className={`p-4 rounded-lg cursor-pointer transition-all duration-300 animate-fadeIn ...`}
```

```css
/* src/app/globals.css */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out forwards;
}
```

- [ ] **Step 4: 验证动画效果**

```bash
npm run dev
```

Expected: 词汇卡片翻转流畅，歌词行有淡入效果

- [ ] **Step 5: 提交**

```bash
git add src/components/LyricsView.tsx src/components/WordCard.tsx src/app/globals.css
git commit -m "polish: add card flip and fade-in animations"
```

---

## Task 14: 补充完整歌曲数据

**Files:**
- Modify: `src/data/songs.json`

- [ ] **Step 1: 根据翡翠粤语歌词网站数据，补充剩余 39 首歌的歌词**

每首歌的数据格式与 Task 4 中的示例相同。需要包含：
- 完整的粤语歌词
- 粤拼标注
- 普通话翻译
- 词汇数据（人工标注粤语特色词汇）

- [ ] **Step 2: 验证所有歌曲数据格式正确**

```bash
npx ts-node -e "
const songs = require('./src/data/songs.json')
console.log('Total songs:', songs.length)
songs.forEach(s => console.log(s.id, s.title, s.lyrics.length, 'lines'))
"
```

Expected: 输出 40 首歌的信息，每首歌有多行歌词

- [ ] **Step 3: 提交**

```bash
git add src/data/songs.json
git commit -m "feat: add complete lyrics data for all 40 songs"
```

---

## Task 15: 部署配置

**Files:**
- Create: `vercel.json`（如需要）

- [ ] **Step 1: 确认静态导出配置**

```bash
npm run build
```

Expected: 在 `out/` 目录生成静态文件

- [ ] **Step 2: 测试本地静态服务**

```bash
npx serve out
```

Expected: 浏览器访问所有页面正常工作

- [ ] **Step 3: 提交**

```bash
git add .
git commit -m "chore: finalize for Vercel deployment"
```

- [ ] **Step 4: 部署到 Vercel**

```bash
npx vercel
```

或在 Vercel Dashboard 中导入 GitHub 仓库。

---

## 执行顺序总结

| Task | 内容 | 依赖 |
|------|------|------|
| 1 | 项目初始化 | 无 |
| 2 | 类型定义 | 无 |
| 3 | 歌词抓取脚本 | Task 2 |
| 4 | 示例歌曲数据 | Task 2 |
| 5 | TTS 音频生成 | Task 4 |
| 6 | 首页 | Task 1, 2, 4 |
| 7 | 歌曲页布局 | Task 6 |
| 8 | 模式A-歌词 | Task 7 |
| 9 | 模式B-词汇 | Task 7 |
| 10 | 音频播放器 | Task 8 |
| 11 | 搜索功能 | Task 6 |
| 12 | 本地存储 | Task 9 |
| 13 | UI打磨 | Task 8, 9 |
| 14 | 完整数据 | Task 3, 4 |
| 15 | 部署 | All |
