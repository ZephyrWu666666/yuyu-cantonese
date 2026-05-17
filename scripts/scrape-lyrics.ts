import * as fs from 'fs'
import * as path from 'path'
import axios from 'axios'
import * as cheerio from 'cheerio'

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
  pinyin: string
  mandarin: string
}

// ============================================================
// TODO: 用户需要提供翡翠粤语歌词网站的具体URL格式
// 以下是通用抓取逻辑框架，需要根据实际网站结构调整
// ============================================================

// 基础URL - TODO: 替换为翡翠粤语歌词的实际域名
const BASE_URL = 'https://www.example.com'

// 请求延迟，避免被封
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 搜索歌曲，获取歌词页面URL
async function searchSongUrl(songTitle: string): Promise<string | null> {
  try {
    // TODO: 替换为实际的搜索URL格式
    // 示例: const searchUrl = `${BASE_URL}/search?q=${encodeURIComponent(songTitle)}`
    const searchUrl = `${BASE_URL}/search?q=${encodeURIComponent(songTitle)}`
    console.log(`  搜索URL: ${searchUrl}`)

    const response = await axios.get(searchUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    })

    const $ = cheerio.load(response.data)

    // TODO: 替换为实际的选择器，找到歌曲链接
    // 示例: const songLink = $('a.lyrics-link').first().attr('href')
    const songLink = $('a').first().attr('href')

    if (!songLink) {
      console.log(`  未找到歌曲链接: ${songTitle}`)
      return null
    }

    // 如果是相对路径，拼接完整URL
    if (songLink.startsWith('/')) {
      return `${BASE_URL}${songLink}`
    }
    return songLink
  } catch (error) {
    console.error(`  搜索失败 "${songTitle}":`, error)
    return null
  }
}

// 从歌词页面提取歌词数据
async function scrapeLyricsFromPage(url: string): Promise<ScrapedLine[]> {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    })

    const $ = cheerio.load(response.data)
    const lines: ScrapedLine[] = []

    // TODO: 替换为实际的HTML选择器
    // 翡翠粤语歌词网站通常有粤语歌词、粤拼注音、普通话翻译三个部分
    // 需要根据实际HTML结构调整以下选择器:
    //
    // 示例模式1: 粤语歌词在 <div class="cantonese-lyrics">
    // 示例模式2: 粤拼在 ruby 注音中
    // 示例模式3: 翻译在 <div class="mandarin-translation">
    //
    // 以下是一个假设的解析模式:
    $('div.lyrics-line').each((_, element) => {
      const cantonese = $(element).find('.cantonese').text().trim()
      const pinyin = $(element).find('.pinyin').text().trim()
      const mandarin = $(element).find('.mandarin').text().trim()

      if (cantonese) {
        lines.push({ cantonese, pinyin, mandarin })
      }
    })

    return lines
  } catch (error) {
    console.error(`  获取歌词失败 (${url}):`, error)
    return []
  }
}

// 主抓取函数
async function scrapeSongLyrics(songTitle: string): Promise<ScrapedLine[]> {
  try {
    // 1. 搜索歌曲
    const songUrl = await searchSongUrl(songTitle)
    if (!songUrl) {
      return []
    }

    // 2. 获取歌词
    await delay(1000) // 请求间隔
    return await scrapeLyricsFromPage(songUrl)
  } catch (error) {
    console.error(`Failed to scrape "${songTitle}":`, error)
    return []
  }
}

function extractWords(line: ScrapedLine): { cantonese: string; pinyin: string; mandarin: string; audioPath: string }[] {
  const words: { cantonese: string; pinyin: string; mandarin: string; audioPath: string }[] = []
  const jyutpingSyllables = line.pinyin.split(' ')
  const characters = line.cantonese.split('')

  for (let i = 0; i < Math.min(characters.length, jyutpingSyllables.length); i++) {
    words.push({
      cantonese: characters[i],
      pinyin: jyutpingSyllables[i],
      mandarin: '', // Needs manual annotation
      audioPath: `/audio/words/${jyutpingSyllables[i]}.mp3`,
    })
  }

  return words
}

async function main() {
  console.log('开始抓取歌词数据...')
  console.log(`共 ${SONGS.length} 首歌曲待处理`)
  console.log('')

  // 确保输出目录存在
  const outputDir = path.join(__dirname, '../src/data')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const songs: any[] = []
  let successCount = 0
  let failCount = 0

  for (let i = 0; i < SONGS.length; i++) {
    const song = SONGS[i]
    console.log(`[${i + 1}/${SONGS.length}] 正在处理: ${song.title} (${song.album}, ${song.year})`)

    const lines = await scrapeSongLyrics(song.title)

    if (lines.length > 0) {
      successCount++
      songs.push({
        id: song.id,
        title: song.title,
        album: song.album,
        year: song.year,
        lyrics: lines.map((line) => ({
          cantonese: line.cantonese,
          pinyin: line.pinyin,
          mandarin: line.mandarin,
          words: extractWords(line),
        })),
      })
      console.log(`  成功: ${lines.length} 行歌词`)
    } else {
      failCount++
      console.log(`  失败: 未获取到歌词`)
    }

    // 每处理5首歌暂停一下，避免请求过快
    if ((i + 1) % 5 === 0) {
      console.log('  等待2秒...')
      await delay(2000)
    }
  }

  // 保存结果
  const outputPath = path.join(outputDir, 'songs.json')
  fs.writeFileSync(outputPath, JSON.stringify(songs, null, 2), 'utf-8')

  console.log('')
  console.log('=== 抓取完成 ===')
  console.log(`成功: ${successCount} 首`)
  console.log(`失败: ${failCount} 首`)
  console.log(`歌词数据已保存到: ${outputPath}`)
}

main().catch(console.error)
