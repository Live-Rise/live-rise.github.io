"""One-off local generator for data/media-<lang>.json / data/news-<lang>.json.

Mirrors .github/workflows/update-news.yml so new languages get their data
files immediately instead of waiting for the next scheduled run. Also dumps
each language's official Steam store copy to a reference file for the
website translations.
"""
import json
import os
import re
import html
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
        return res.read().decode("utf-8")


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
            data = json.loads(fetch(
                f"https://store.steampowered.com/api/appdetails?appids=4142580&l={steam_lang}"))
            d = data["4142580"].get("data", {})
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

        # Official store copy for translation reference
        try:
            d2 = json.loads(fetch(
                f"https://store.steampowered.com/api/appdetails?appids=4142580&l={steam_lang}"
            ))["4142580"].get("data", {})
            copy_lines.append(
                f"===== {code} ({steam_lang}) =====\n"
                f"short: {strip_html(d2.get('short_description', ''))}\n"
                f"about: {strip_html(d2.get('about_the_game', ''))}\n")
        except Exception as exc:  # noqa: BLE001
            copy_lines.append(f"===== {code} ({steam_lang}) =====\nFAILED: {exc}\n")

        print(f"{code:7s} media: {media_note} | news: {news_note}")
        time.sleep(0.4)

    with open("steam-copy-reference.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(copy_lines))
    print("store copy reference written")


if __name__ == "__main__":
    main()
