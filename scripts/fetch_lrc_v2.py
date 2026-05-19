import json
import re
import time
import urllib.request

BASE = '/Users/zephyrwu/Desktop/语于网站开发'
DATA_PATH = f'{BASE}/src/data/songs.json'

PLAYLIST_ID = '17952276820'

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Referer': 'https://music.163.com/',
}

def api_get(url):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode('utf-8'))

def get_playlist_tracks(pid):
    url = f'https://music.163.com/api/playlist/detail?id={pid}'
    data = api_get(url)
    tracks = data.get('result', {}).get('tracks', [])
    return [(t['id'], t['name']) for t in tracks]

def get_lrc(song_id):
    url = f'https://music.163.com/api/song/lyric?id={song_id}&lv=1&kv=1&tv=-1'
    data = api_get(url)
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
            if text:
                lines.append((time_ms, text))
    return lines

def normalize(text):
    return text.replace(' ', '').replace('　', '').strip()

def match_lrc_to_song(lrc_lines, song_lyrics):
    used_lrc = set()
    result = [None] * len(song_lyrics)
    
    for song_idx in range(len(song_lyrics)):
        if result[song_idx] is not None:
            continue
            
        for merge_len in range(1, 8):
            if song_idx + merge_len > len(song_lyrics):
                break
            merged = ''.join(normalize(song_lyrics[song_idx + i]['cantonese']) for i in range(merge_len))
            
            for lrc_idx, (t, lrc_text) in enumerate(lrc_lines):
                if lrc_idx in used_lrc:
                    continue
                lrc_clean = normalize(lrc_text)
                if merged == lrc_clean or merged in lrc_clean or lrc_clean in merged:
                    for i in range(merge_len):
                        result[song_idx + i] = round(t / 1000.0, 3)
                    used_lrc.add(lrc_idx)
                    break
            if result[song_idx] is not None:
                break
    
    return result

def main():
    with open(DATA_PATH) as f:
        songs = json.load(f)

    tracks = get_playlist_tracks(PLAYLIST_ID)
    print(f'Playlist has {len(tracks)} tracks')

    matched = 0
    for ne_id, ne_name in tracks:
        target_song = None
        for s in songs:
            if s['title'] in ne_name or ne_name in s['title']:
                target_song = s
                break

        if not target_song:
            print(f'  SKIP: no match for {ne_name}')
            continue

        lrc_text = get_lrc(ne_id)
        if not lrc_text:
            print(f'  SKIP: no LRC for {ne_name}')
            continue

        lrc_lines = parse_lrc(lrc_text)
        times = match_lrc_to_song(lrc_lines, target_song['lyrics'])

        success = sum(1 for t in times if t is not None)
        total = len(times)
        song_title = target_song['title']
        print(f'  {song_title}: {success}/{total} matched')

        for i, t in enumerate(times):
            if t is not None:
                target_song['lyrics'][i]['startTime'] = t
        matched += 1
        time.sleep(0.5)

    with open(DATA_PATH, 'w', encoding='utf-8') as f:
        json.dump(songs, f, ensure_ascii=False, indent=2)

    print(f'\nDone. Matched {matched}/{len(tracks)} songs.')

if __name__ == '__main__':
    main()
