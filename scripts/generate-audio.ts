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

  // Collect all unique words
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

  // Generate word audio
  console.log(`开始生成 ${wordData.length} 个词汇音频...`)
  for (const word of wordData) {
    if (!fs.existsSync(word.path)) {
      await generateAudio(word.text, word.path)
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  // Generate sentence audio
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
