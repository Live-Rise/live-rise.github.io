"""One-off local generator for data/media-<lang>.json / data/news-<lang>.json /
data/characters-<lang>.json.

Mirrors .github/workflows/update-news.yml so new languages get their data
files immediately instead of waiting for the next scheduled run. Also dumps
each language's official Steam store copy to a reference file for the
website translations.
"""
import json
import os
import re
import html
import struct
import sys
import time
import urllib.request
import xml.etree.ElementTree as ET
from email.utils import parsedate_to_datetime

LANGS = [
    ("en", "english"), ("zh-CN", "schinese"), ("zh-TW", "tchinese"),
    ("ja", "japanese"), ("ko", "korean"),
    ("fr", "french"), ("it", "italian"), ("de", "german"),
    ("es-ES", "spanish"), ("da", "danish"), ("ru", "russian"),
    ("tr", "turkish"), ("no", "norwegian"), ("pl", "polish"),
    ("th", "thai"), ("sv", "swedish"), ("fi", "finnish"),
    ("nl", "dutch"), ("pt-BR", "brazilian"), ("pt-PT", "portuguese"),
    ("es-419", "latam"), ("uk", "ukrainian"), ("bg", "bulgarian"),
    ("hu", "hungarian"), ("id", "indonesian"), ("el", "greek"),
    ("cs", "czech"), ("ro", "romanian"), ("vi", "vietnamese"),
    ("ar", "arabic"),
]

UA = {"User-Agent": "Mozilla/5.0"}


def fetch(url, timeout=30):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as res:
        return res.read()


def app_details(steam_lang):
    """appdetails payload keyed by the app's canonical appid, which no longer
    matches the requested 4142580 — take whichever key comes back."""
    data = json.loads(fetch(
        f"https://store.steampowered.com/api/appdetails?appids=4142580&l={steam_lang}"))
    payload = data.get("4142580") or next(iter(data.values()), None)
    return (payload or {}).get("data") or {}


def image_size(data):
    """(width, height) for JPEG or ISOBMFF (AVIF/HEIF) bytes, else None."""
    if data[:2] == b"\xff\xd8":
        i = 2
        while i + 4 < len(data):
            if data[i] != 0xFF:
                i += 1
                continue
            marker = data[i + 1]
            if 0xC0 <= marker <= 0xCF and marker not in (0xC4, 0xC8, 0xCC):
                h, w = struct.unpack(">HH", data[i + 5:i + 9])
                return w, h
            if marker in (0xD8, 0x01) or 0xD0 <= marker <= 0xD7:
                i += 2
                continue
            size = struct.unpack(">H", data[i + 2:i + 4])[0]
            if size < 2:
                break
            i += 2 + size
        return None
    if len(data) > 12 and data[4:8] == b"ftyp":
        def boxes(buf, start, end):
            i = start
            while i + 8 <= end:
                size = struct.unpack(">I", buf[i:i + 4])[0]
                header = 8
                if size == 1:
                    size = struct.unpack(">Q", buf[i + 8:i + 16])[0]
                    header = 16
                elif size == 0:
                    size = end - i
                if size < header or i + size > end:
                    break
                yield buf[i + 4:i + 8], i + header, i + size
                i += size
        for kind, s, e in boxes(data, 0, len(data)):
            if kind != b"meta":
                continue
            # meta is a full box: 4 bytes of version/flags, then children
            for kind2, s2, e2 in boxes(data, s + 4, e):
                if kind2 != b"iprp":
                    continue
                for kind3, s3, e3 in boxes(data, s2, e2):
                    if kind3 != b"ipco":
                        continue
                    for kind4, s4, e4 in boxes(data, s3, e3):
                        if kind4 == b"ispe":
                            w, h = struct.unpack(">II", data[s4 + 4:s4 + 12])
                            return w, h
    return None.decode("utf-8")


def strip_html(raw):
    text = re.sub(r"<br\s*/?>", "\n", raw or "")
    text = re.sub(r"<[^>]+>", " ", text)
    return re.sub(r"[ \t]+", " ", html.unescape(text)).strip()


def main():
    only = sys.argv[1:] or None
    os.makedirs("data", exist_ok=True)
    copy_lines = []
    for code, steam_lang in LANGS:
        if only and code not in only:
            continue
        # Media list
        try:
            d = app_details(steam_lang)
            out = {
                "videos": [
                    {"name": m.get("name", ""), "thumb": m.get("thumbnail", ""),
                     "hls": m.get("hls_h264", "")}
                    for m in d.get("movies", [])
                ],
                "screenshots": [s.get("path_full", "") for s in d.get("screenshots", [])],
            }
            with open(f"data/media-{code}.json", "w", encoding="utf-8") as f:
                json.dump(out, f, ensure_ascii=False, indent=2)
            media_note = f"{len(out['videos'])} videos, {len(out['screenshots'])} shots"
        except Exception as exc:  # noqa: BLE001 - report and continue
            media_note = f"FAILED: {exc}"

        # News feed
        try:
            root = ET.fromstring(fetch(
                f"https://store.steampowered.com/feeds/news/app/4142580/?l={steam_lang}"))
            items = []
            for item in root.iter("item"):
                enclosure = item.find("enclosure")
                image = enclosure.get("url") if enclosure is not None else None
                if not image:
                    desc = html.unescape(item.findtext("description") or "")
                    m = re.search(r'<img[^>]+src="([^"]+)"', desc)
                    image = m.group(1) if m else None
                pub = item.findtext("pubDate")
                items.append({
                    "title": (item.findtext("title") or "").strip(),
                    "url": (item.findtext("link") or "").strip(),
                    "date": int(parsedate_to_datetime(pub).timestamp()) if pub else 0,
                    "image": image,
                })
            news_out = {"appnews": {"appid": 4142580, "newsitems": items[:6]}}
            with open(f"data/news-{code}.json", "w", encoding="utf-8") as f:
                json.dump(news_out, f, ensure_ascii=False, indent=2)
            news_note = f"{len(news_out['appnews']['newsitems'])} items"
        except Exception as exc:  # noqa: BLE001
            news_note = f"FAILED: {exc}"

        # Character art from the store page description
        try:
            page = fetch(
                f"https://store.steampowered.com/app/4142580/Live_Rise_4K_Fever/?l={steam_lang}"
            ).decode("utf-8", "replace")
            start = page.find('id="game_area_description"')
            if start < 0:
                raise ValueError("store page has no description block")
            end = page.find('id="game_area_sys_req"', start)
            if end < 0:
                end = page.find('id="categories"', start)
            if end < 0:
                end = start + 120000
            urls = [u for u in re.findall(r'<img[^>]+src="([^"]+)"', page[start:end])
                    if "/public/images/" not in u]
            images = []
            seen = set()
            for url in urls:
                if url in seen:
                    continue
                seen.add(url)
                try:
                    size = image_size(fetch(url))
                    # Character plates are poster-shaped; community banners are
                    # panoramic strips several times wider than tall.
                    if size and not 0.5 <= size[0] / size[1] <= 3.5:
                        continue
                except Exception:
                    pass  # unreadable image: keep it rather than lose art
                images.append(url)
            if not images:
                raise ValueError("description carries no character art")
            with open(f"data/characters-{code}.json", "w", encoding="utf-8") as f:
                json.dump({"images": images}, f, ensure_ascii=False, indent=2)
            chars_note = f"{len(images)} art"
        except Exception as exc:  # noqa: BLE001
            chars_note = f"FAILED: {exc}"

        # Official store copy for translation reference
        try:
            d2 = app_details(steam_lang)
            copy_lines.append(
                f"===== {code} ({steam_lang}) =====\n"
                f"short: {strip_html(d2.get('short_description', ''))}\n"
                f"about: {strip_html(d2.get('about_the_game', ''))}\n")
        except Exception as exc:  # noqa: BLE001
            copy_lines.append(f"===== {code} ({steam_lang}) =====\nFAILED: {exc}\n")

        print(f"{code:7s} media: {media_note} | news: {news_note} | characters: {chars_note}")
        time.sleep(0.4)

    with open("steam-copy-reference.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(copy_lines))
    print("store copy reference written")


if __name__ == "__main__":
    main()
