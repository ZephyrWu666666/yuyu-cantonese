import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import axios from 'axios'
import * as cheerio from 'cheerio'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Complete song list with IDs, titles, albums, and years
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
  { id: 'burubujian', title: '不如不见', album: "What's Going On...?", year: 2006 },
  { id: 'fushishanxia', title: '富士山下', album: "What's Going On...?", year: 2006 },
  { id: 'heizeming', title: '黑择明', album: "What's Going On...?", year: 2006 },
  { id: 'baimeigui', title: '白玫瑰', album: "What's Going On...?", year: 2006 },
  { id: 'qunxiazhichen', title: '裙下之臣', album: "What's Going On...?", year: 2006 },
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
  jyutping: string
}

const SINGER_PAGE = 'https://www.feitsui.com/zh-hans/singer/1' // 陈奕迅
const LYRICS_BASE = 'https://www.feitsui.com/zh-hans/lyrics/'

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/** Retry wrapper with exponential backoff for 429 errors */
async function fetchWithRetry(url: string, maxRetries = 3): Promise<any> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await axios.get(url, { timeout: 15000, headers: HEADERS })
    } catch (err: any) {
      if (err.response?.status === 429 && attempt < maxRetries) {
        const waitMs = (attempt + 1) * 15000 // 15s, 30s, 45s
        console.log(`  限流，等待 ${waitMs / 1000}s 后重试 (${attempt + 1}/${maxRetries})...`)
        await delay(waitMs)
        continue
      }
      throw err
    }
  }
}

/**
 * Fetch the singer page and build a map: normalized title -> feitsui lyrics URL
 * This avoids the rate-limited search API entirely.
 */
async function buildSongUrlMap(): Promise<Map<string, string>> {
  console.log('正在获取歌手页面，构建歌曲 URL 映射...')
  const resp = await fetchWithRetry(SINGER_PAGE)
  const $ = cheerio.load(resp.data)
  const map = new Map<string, string>()

  $('a[href*="/zh-hans/lyrics/"]').each((_, el) => {
    const href = $(el).attr('href')
    const title = $(el).text().trim()
    if (href && title) {
      // Normalize: lowercase, remove spaces and punctuation
      const normalized = normalizeTitle(title)
      map.set(normalized, `https://www.feitsui.com${href}`)
    }
  })

  console.log(`  找到 ${map.size} 首歌曲`)
  return map
}

/** Normalize a title for fuzzy matching */
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[\s,.\-!？。，、！·'"()（）\-]/g, '')
    .replace(/^(the|a|an)\s+/i, '')
    .trim()
}

/** Find the best matching URL for a song title from the map */
function findSongUrl(title: string, map: Map<string, string>): string | null {
  const normalized = normalizeTitle(title)

  // Exact match
  if (map.has(normalized)) return map.get(normalized)!

  // Try partial match: our title is contained in map key, or vice versa
  for (const [key, url] of map) {
    if (key.includes(normalized) || normalized.includes(key)) {
      return url
    }
  }

  // Try matching without numbers/special chars
  const alphaOnly = normalized.replace(/[^a-z一-鿿]/g, '')
  for (const [key, url] of map) {
    const keyAlpha = key.replace(/[^a-z一-鿿]/g, '')
    if (keyAlpha === alphaOnly || keyAlpha.includes(alphaOnly) || alphaOnly.includes(keyAlpha)) {
      return url
    }
  }

  return null
}

/** Fetch and parse lyrics from a feitsui lyrics page */
async function scrapeLyricsFromPage(url: string): Promise<ScrapedLine[]> {
  const resp = await fetchWithRetry(url)
  const $ = cheerio.load(resp.data)

  const lines: ScrapedLine[] = []

  $('article.romanization p').each((_, el) => {
    const html = $(el).html()
    if (!html) return

    // Split by <br> tags to get alternating lines
    const parts = html.split(/<br\s*\/?>/i).map(s => {
      return s.replace(/<[^>]*>/g, '').trim()
    }).filter(Boolean)

    // Parts alternate: chinese, jyutping, (watermark), chinese, jyutping, ...
    for (let i = 0; i < parts.length; i++) {
      const text = parts[i]

      // Skip watermark lines
      if (text.includes('翡翠粤语歌词') || text.includes('feitsui.com')) {
        continue
      }

      // Check if this looks like Chinese text (contains CJK)
      const isChinese = /[一-鿿]/.test(text)
      // Check if the next part is jyutping (no CJK chars)
      const nextPart = parts[i + 1]
      const isNextJyutping = nextPart
        && /[一-鿿]/.test(nextPart) === false
        && !nextPart.includes('翡翠') && !nextPart.includes('feitsui')

      if (isChinese && isNextJyutping) {
        lines.push({
          cantonese: text,
          jyutping: nextPart,
        })
        i++ // skip the jyutping line we just consumed
      }
    }
  })

  return lines
}

function extractWords(cantonese: string, jyutping: string) {
  const words: { cantonese: string; pinyin: string; mandarin: string; audioPath: string }[] = []
  const syllables = jyutping.split(/\s+/).filter(Boolean)

  let sylIdx = 0
  const chars = cantonese.split('')

  for (let i = 0; i < chars.length && sylIdx < syllables.length; i++) {
    const char = chars[i]
    if (!/[一-鿿]/.test(char)) continue

    const syl = syllables[sylIdx]
    // '/' indicates alternative readings (多音字), sanitize for filename
    const safeSyl = syl.replace(/\//g, '-')
    words.push({
      cantonese: char,
      pinyin: syl,
      mandarin: '',
      audioPath: `/audio/words/${safeSyl}.mp3`,
    })
    sylIdx++
  }

  return words
}

async function main() {
  console.log('开始抓取歌词数据...')
  console.log(`共 ${SONGS.length} 首歌曲待处理`)
  console.log('')

  const outputDir = path.join(__dirname, '../src/data')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // Step 1: Build song URL map from singer page (single request)
  const urlMap = await buildSongUrlMap()
  console.log('')

  const songs: any[] = []
  let successCount = 0
  let failCount = 0

  for (let i = 0; i < SONGS.length; i++) {
    const song = SONGS[i]
    console.log(`[${i + 1}/${SONGS.length}] 正在处理: ${song.title}`)

    try {
      // Step 2: Find lyrics URL from the map
      const lyricsUrl = findSongUrl(song.title, urlMap)
      if (!lyricsUrl) {
        console.log(`  未在歌手页面找到: ${song.title}`)
        failCount++
        continue
      }
      console.log(`  歌词页: ${lyricsUrl}`)

      // Step 3: Delay then fetch lyrics
      await delay(2000 + Math.random() * 1000)

      const lines = await scrapeLyricsFromPage(lyricsUrl)

      if (lines.length > 0) {
        successCount++
        songs.push({
          id: song.id,
          title: song.title,
          album: song.album,
          year: song.year,
          lyrics: lines.map(line => ({
            cantonese: line.cantonese,
            pinyin: line.jyutping,
            mandarin: '',
            words: extractWords(line.cantonese, line.jyutping),
          })),
        })
        console.log(`  成功: ${lines.length} 行歌词`)
      } else {
        failCount++
        console.log(`  歌词为空`)
      }
    } catch (err: any) {
      failCount++
      console.error(`  处理失败:`, err.message || err)
    }
  }

  // Save results
  const outputPath = path.join(outputDir, 'songs.json')
  fs.writeFileSync(outputPath, JSON.stringify(songs, null, 2), 'utf-8')

  console.log('')
  console.log('=== 抓取完成 ===')
  console.log(`成功: ${successCount} 首`)
  console.log(`失败: ${failCount} 首`)
  console.log(`歌词数据已保存到: ${outputPath}`)
}

main().catch(console.error)
