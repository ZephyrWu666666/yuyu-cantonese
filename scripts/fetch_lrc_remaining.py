import json
import re
import time
import subprocess
import urllib.parse

BASE = '/Users/zephyrwu/Desktop/语于网站开发'
DATA_PATH = f'{BASE}/src/data/songs.json'

NO_TIME_IDS = [
    'fukua', 'xiyangwuxianhao', 'aniu', 'luohualiushui', 'tiangongdidao',
    'yueyucanpian', 'burubujian', 'fushishanxia', 'heizeming', 'baimeigui',
    'qunxiazhichen', 'shalong', 'bulaibuyequ', 'taiyangzhaochangshengqi',
    'qibainianhou', 'yuxinyoukui', 'haiyoushenmekeyisonggeini', 'allegro',
    'tuofeilun', 'yisibuagua', 'wurenzhijing', 'kugua', 'zuijisunyou',
    'wan', 'yuanzaizhichi', 'sidegeermoqingren', 'renwoxing',
    'putaochengshushi', 'kgezhiwang'
]

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
                lines.append((time_ms, text))
    return lines

def normalize(text):
    return text.replace(' ', '').replace('　', '').replace('\xa0', '').strip()

def match_lrc_to_song(lrc_lines, song_lyrics):
    used_lrc = set()
    result = [None] * len(song_lyrics)

    for song_idx in range(len(song_lyrics)):
        if result[song_idx] is not None:
            continue
        for merge_len in range(1, 10):
            if song_idx + merge_len > len(song_lyrics):
                break
            merged = ''.join(normalize(song_lyrics[song_idx + i]['cantonese']) for i in range(merge_len))

            best_match = None
            best_score = -1
            for lrc_idx, (t, lrc_text) in enumerate(lrc_lines):
                if lrc_idx in used_lrc:
                    continue
                lrc_clean = normalize(lrc_text)
                score = 0
                if merged == lrc_clean:
                    score = 1.0
                elif merged in lrc_clean:
                    score = len(merged) / len(lrc_clean)
                elif lrc_clean in merged:
                    score = len(lrc_clean) / len(merged)
                if score >= 0.3 and score > best_score:
                    best_score = score
                    best_match = (lrc_idx, t)

            if best_match:
                lrc_idx, t = best_match
                for i in range(merge_len):
                    result[song_idx + i] = round(t / 1000.0, 3)
                used_lrc.add(lrc_idx)
                break
    return result

def main():
    with open(DATA_PATH) as f:
        songs = json.load(f)

    song_map = {s['id']: s for s in songs}
    results = {}

    for sid in NO_TIME_IDS:
        song = song_map[sid]
        title = song['title']
        print(f'\n--- {title} ({sid}) ---')

        # Search on NetEase
        queries = [f'{title} 陈奕迅', f'{title} Eason']
        search_results = []
        for q in queries:
            search_results = search_song(q)
            if search_results:
                break
            time.sleep(1)

        if not search_results:
            print(f'  NO SEARCH RESULTS')
            results[sid] = 'no_search_results'
            continue

        # Try to find best match
        found = False
        for ne_id, ne_name, artists in search_results:
            # Check if title matches
            if normalize(title) not in normalize(ne_name) and normalize(ne_name) not in normalize(title):
                continue
            # Check if artist is Eason
            artist_str = ' '.join(artists)
            if '奕迅' not in artist_str and 'Eason' not in artist_str and 'Chan' not in artist_str:
                continue

            print(f'  Found: {ne_name} (id={ne_id}) by {artist_str}')
            lrc_text = get_lrc(ne_id)
            if not lrc_text:
                print(f'  No LRC available')
                continue

            lrc_lines = parse_lrc(lrc_text)
            if not lrc_lines:
                print(f'  LRC parse returned 0 lines')
                continue

            times = match_lrc_to_song(lrc_lines, song['lyrics'])
            success = sum(1 for t in times if t is not None)
            total = len(times)
            print(f'  Matched: {success}/{total}')

            if success > 0:
                for i, t in enumerate(times):
                    if t is not None:
                        song['lyrics'][i]['startTime'] = t
                    else:
                        song['lyrics'][i].pop('startTime', None)
                results[sid] = f'{success}/{total}'
                found = True
                break
            time.sleep(0.5)

        if not found:
            print(f'  No matching LRC found')
            results[sid] = 'no_match'
        time.sleep(1)

    # Save
    with open(DATA_PATH, 'w', encoding='utf-8') as f:
        json.dump(songs, f, ensure_ascii=False, indent=2)

    print('\n\n=== SUMMARY ===')
    ok = 0
    for sid in NO_TIME_IDS:
        r = results.get(sid, 'skipped')
        title = song_map[sid]['title']
        status = '✓' if '/' in str(r) else '✗'
        print(f'  {status} {title}: {r}')
        if '/' in str(r):
            ok += 1
    print(f'\nTotal: {ok}/{len(NO_TIME_IDS)} songs got time data')

if __name__ == '__main__':
    main()
