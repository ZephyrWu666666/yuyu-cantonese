import json
import re
import time
import subprocess

BASE = '/Users/zephyrwu/Desktop/语于网站开发'
DATA_PATH = f'{BASE}/src/data/songs.json'

PLAYLIST_ID = '17952276820'

def curl_json(url):
    cmd = ['curl', '-s', '-H', 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
           '-H', 'Referer: https://music.163.com/', url]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    return json.loads(proc.stdout)

def get_playlist_tracks(pid):
    url = f'https://music.163.com/api/playlist/detail?id={pid}'
    data = curl_json(url)
    tracks = data.get('result', {}).get('tracks', [])
    return [(t['id'], t['name']) for t in tracks]

def get_lrc(song_id):
    url = f'https://music.163.com/api/song/lyric?id={song_id}&lv=1&kv=1&tv=-1'
    data = curl_json(url)
    lrc = data.get('lrc', {})
    return lrc.get('lyric', '') if lrc else ''

def parse_lrc(lrc_text):
    lines = []
    skip_keywords = ['作词', '作曲', '编曲', '制作人', '吉他', '贝斯', '鼓', '键盘', '和声', '混音', '母带', '录音']
    for line in lrc_text.split('\n'):
        m = re.match(r'\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)', line)
        if m:
            minutes = int(m.group(1))
            seconds = int(m.group(2))
            ms_str = m.group(3).ljust(3, '0')[:3]
            time_ms = minutes * 60000 + seconds * 1000 + int(ms_str)
            text = m.group(4).strip()
            if text and not any(k in text for k in skip_keywords):
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
            else:
                target_song['lyrics'][i].pop('startTime', None)
        matched += 1
        time.sleep(0.5)

    with open(DATA_PATH, 'w', encoding='utf-8') as f:
        json.dump(songs, f, ensure_ascii=False, indent=2)

    print(f'\nDone. Matched {matched}/{len(tracks)} songs.')

if __name__ == '__main__':
    main()
