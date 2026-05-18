#!/usr/bin/env python3
"""使用 Edge TTS 生成粤语发音音频（免费，无需 Azure 账号）"""

import asyncio
import json
import sys
from pathlib import Path

import edge_tts
from opencc import OpenCC

VOICE = "zh-HK-HiuMaanNeural"
cc = OpenCC('s2t')  # simplified to traditional
BASE_DIR = Path(__file__).resolve().parent.parent
SONGS_PATH = BASE_DIR / "src" / "data" / "songs.json"
WORDS_DIR = BASE_DIR / "public" / "audio" / "words"
SENTENCES_DIR = BASE_DIR / "public" / "audio" / "sentences"

WORDS_DIR.mkdir(parents=True, exist_ok=True)
SENTENCES_DIR.mkdir(parents=True, exist_ok=True)

MAX_RETRIES = 3
RETRY_DELAY = 2


async def generate_audio(text: str, output_path: Path, rate: str = "+0%") -> bool:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    trad_text = cc.convert(text)
    for attempt in range(MAX_RETRIES):
        try:
            communicate = edge_tts.Communicate(trad_text, VOICE, rate=rate)
            await communicate.save(str(output_path))
            return True
        except Exception as e:
            if attempt < MAX_RETRIES - 1:
                await asyncio.sleep(RETRY_DELAY * (attempt + 1))
            else:
                print(f"  ✗ 失败: {output_path.name} - {e}", file=sys.stderr)
                return False
    return False


async def process_tasks(tasks: list[tuple[str, Path]], label: str, rate: str = "+0%") -> tuple[int, int]:
    success = 0
    fail = 0
    total = len(tasks)
    for i, (text, path) in enumerate(tasks, 1):
        ok = await generate_audio(text, path, rate)
        if ok:
            success += 1
            print(f"  ✓ [{i}/{total}] {path.name}")
        else:
            fail += 1
        await asyncio.sleep(0.15)
    return success, fail


async def main() -> None:
    with open(SONGS_PATH, "r", encoding="utf-8") as f:
        songs = json.load(f)

    # 收集所有不重复的词汇音频
    seen_paths: set[str] = set()
    word_tasks: list[tuple[str, Path]] = []

    for song in songs:
        for line in song["lyrics"]:
            for word in line["words"]:
                audio_path = word["audioPath"]
                if audio_path not in seen_paths:
                    seen_paths.add(audio_path)
                    file_path = BASE_DIR / "public" / audio_path.lstrip("/")
                    if not file_path.exists():
                        word_tasks.append((word["cantonese"], file_path))

    # 收集所有句子音频
    sentence_tasks: list[tuple[str, Path]] = []
    for song in songs:
        for i, line in enumerate(song["lyrics"]):
            file_path = SENTENCES_DIR / f"{song['id']}_{i:02d}.mp3"
            if not file_path.exists():
                sentence_tasks.append((line["cantonese"], file_path))

    total = len(word_tasks) + len(sentence_tasks)
    print(f"需要生成 {len(word_tasks)} 个词汇音频 + {len(sentence_tasks)} 个句子音频 = {total} 个文件\n")

    if total == 0:
        print("所有音频已存在，无需生成。")
        return

    # 生成词汇音频
    w_ok, w_fail = 0, 0
    if word_tasks:
        print("=== 词汇音频 ===")
        w_ok, w_fail = await process_tasks(word_tasks, "词汇")

    # 生成句子音频
    s_ok, s_fail = 0, 0
    if sentence_tasks:
        print("\n=== 句子音频 ===")
        s_ok, s_fail = await process_tasks(sentence_tasks, "句子", rate="-15%")

    print(f"\n完成！成功: {w_ok + s_ok}, 失败: {w_fail + s_fail}")


if __name__ == "__main__":
    asyncio.run(main())
