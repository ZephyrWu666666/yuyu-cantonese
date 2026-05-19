import json
import re
import time
import subprocess

BASE = '/Users/zephyrwu/Desktop/语于网站开发'
DATA_PATH = f'{BASE}/src/data/songs.json'

PROBLEM_IDS = [
    'redaiyulin', '1874', 'mingjinjintian', 'shimianmaifu',
    'luohualiushui', 'tiangongdidao', 'yueyucanpian', 'fushishanxia',
    'qunxiazhichen', 'shalong', 'allegro', 'tuofeilun',
    'wurenzhijing', 'kugua', 'zuijisunyou', 'wan'
]

# NetEase song IDs (from previous search results or manual lookup)
NE_IDS = {}  # Will search dynamically

SKIP_KEYWORDS = ['作词', '作曲', '编曲', '制作人', '吉他', '贝斯', '鼓', '键盘', '和声', '混音', '母带', '录音']

def curl_json(url):
    cmd = ['curl', '-s', '-H', 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
           '-H', 'Referer: https://music.163.com/', url]
    proc = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
    try:
        return json.loads(proc.stdout)
    except:
        return {}

def search_song(query):
    import urllib.parse
    encoded = urllib.parse.quote(query)
    url = f'https://music.163.com/api/search/get?s={encoded}&type=1&limit=5&offset=0'
    data = curl_json(url)
    songs = data.get('result', {}).get('songs', [])
    return [(s['id'], s['name'], [a['name'] for a in s.get('artists', [])]) for s in songs]

def get_lrc(song_id):
    url = f'https://music.163.com/api/song/lyric?id={song_id}&lv=1&kv=1&tv=-1'
    data = curl_json(url)
    lrc = data.get('lrc', {})
    return lrc.get('lyric', '') if lrc else ''

def parse_lrc(lrc_text):
    lines = []
    for line in lrc_text.split('\n'):
        m = re.match(r'\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)', line)
        if m:
            minutes = int(m.group(1))
            seconds = int(m.group(2))
            ms_str = m.group(3).ljust(3, '0')[:3]
            time_ms = minutes * 60000 + seconds * 1000 + int(ms_str)
            text = m.group(4).strip()
            if text and not any(k in text for k in SKIP_KEYWORDS):
                lines.append((time_ms / 1000.0, text))
    return lines

def normalize(text):
    return text.replace(' ', '').replace('　', '').replace('\xa0', '').strip()

def strict_match(lrc_lines, song_lyrics):
    """Strict sequential matching: walk through both lists in order."""
    result = [None] * len(song_lyrics)
    lrc_idx = 0

    for song_idx in range(len(song_lyrics)):
        song_text = normalize(song_lyrics[song_idx]['cantonese'])
        if not song_text:
            continue

        # Try to find the best matching LRC line starting from lrc_idx
        best = None
        best_score = 0

        # Also try merging consecutive LRC lines to match one song line
        for merge_start in range(lrc_idx, min(lrc_idx + 5, len(lrc_lines))):
            for merge_count in range(1, 4):
                if merge_start + merge_count > len(lrc_lines):
                    break
                merged_text = ''.join(normalize(lrc_lines[merge_start + k][1]) for k in range(merge_count))
                merged_time = lrc_lines[merge_start][0]

                score = 0
                if song_text == merged_text:
                    score = 1.0
                elif song_text in merged_text:
                    score = len(song_text) / len(merged_text)
                elif merged_text in song_text:
                    score = len(merged_text) / len(song_text)

                if score > best_score and score >= 0.5:
                    best_score = score
                    best = (merge_start, merge_count, merged_time)

        if best:
            merge_start, merge_count, t = best
            result[song_idx] = t
            lrc_idx = merge_start + merge_count

    return result

def main():
    with open(DATA_PATH) as f:
        songs = json.load(f)
    song_map = {s['id']: s for s in songs}

    for sid in PROBLEM_IDS:
        song = song_map[sid]
        title = song['title']
        print(f'\n=== {title} ({sid}) ===')

        # Get NetEase song ID
        ne_id = NE_IDS.get(sid)
        if not ne_id:
            # Search
            results = search_song(f'{title} 陈奕迅')
            for nid, nname, artists in results:
                if normalize(title) in normalize(nname) or normalize(nname) in normalize(title):
                    artist_str = ' '.join(artists)
                    if '奕迅' in artist_str or 'Eason' in artist_str:
                        ne_id = nid
                        break
            if not ne_id:
                print(f'  Cannot find NetEase ID')
                continue

        lrc_text = get_lrc(ne_id)
        if not lrc_text:
            print(f'  No LRC for id={ne_id}')
            continue

        lrc_lines = parse_lrc(lrc_text)
        print(f'  LRC: {len(lrc_lines)} lines')
        for t, txt in lrc_lines[:5]:
            print(f'    {t:8.3f}s  {txt}')
        if len(lrc_lines) > 5:
            print(f'    ... ({len(lrc_lines) - 5} more)')

        times = strict_match(lrc_lines, song['lyrics'])
        success = sum(1 for t in times if t is not None)
        total = len(times)
        print(f'  Matched: {success}/{total}')

        # Apply with monotonic enforcement
        prev_time = -1
        for i, t in enumerate(times):
            if t is not None:
                # Ensure monotonic
                if t <= prev_time:
                    t = prev_time + 0.001
                song['lyrics'][i]['startTime'] = round(t, 3)
                prev_time = t
            else:
                song['lyrics'][i].pop('startTime', None)

        # Print result
        for i, line in enumerate(song['lyrics']):
            st = line.get('startTime')
            has = '✓' if isinstance(st, (int, float)) else '✗'
            print(f'    {has} [{i:2d}] {st if st is not None else "N/A":>8}  {line["cantonese"][:35]}')

        time.sleep(1)

    # Save
    with open(DATA_PATH, 'w', encoding='utf-8') as f:
        json.dump(songs, f, ensure_ascii=False, indent=2)
    print('\nSaved.')

if __name__ == '__main__':
    main()
