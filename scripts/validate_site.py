#!/usr/bin/env python3
"""Validate the Mobile UI Generator static showcase.

Checks syntax, SEO/i18n metadata, static fallback content, font coverage, and
public-copy hygiene for the GitHub Pages site.
"""
from __future__ import annotations

import json
import re
import subprocess
import sys
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path

try:
    from PIL import Image
except Exception:  # pragma: no cover
    Image = None

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
BASE = "https://jinyoung89.github.io/mobile-ui-generator-skill/"
# Keep this public-safe: do not include source/provider names in this repo.
# Split sensitive phrases so code search does not surface them as project copy.
BLOCKED_PUBLIC_COPY = [
    "crawl" + "er",
    "connect" + "or",
    "private" + " corpus",
    "reference" + " corpus",
    "quality" + " gates",
    "quality" + " report",
    "raw" + " screenshots",
    "56" + ",665",
    "349" + " apps",
    "0" + ".95",
    "indexed",
    "수" + "집",
    "데이터" + "셋",
    "레퍼런스" + " 품질",
    "내" + "부",
]
PRIVATE_RE = re.compile("|".join(re.escape(term) for term in BLOCKED_PUBLIC_COPY), re.I)


class Parser(HTMLParser):
    pass


def fail(message: str) -> None:
    print(f"FAIL: {message}", file=sys.stderr)
    raise SystemExit(1)


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def json_ld(html: str) -> dict:
    match = re.search(r'<script type="application/ld\+json">\s*(.*?)\s*</script>', html, re.S)
    if not match:
        fail("missing JSON-LD block")
    assert match is not None
    return json.loads(match.group(1))


def parse_site_data() -> dict:
    text = read(DOCS / "site-data.js")
    match = re.search(r"window\.MobileUIGeneratorData = Object\.freeze\((.*)\);\s*$", text, re.S)
    if not match:
        fail("site-data.js shape changed")
    assert match is not None
    return json.loads(match.group(1))


def assert_contains(text: str, needle: str, label: str) -> None:
    if needle not in text:
        fail(f"{label} missing {needle!r}")


def main() -> None:
    subprocess.run(["node", "--check", str(DOCS / "app.js")], check=True)
    subprocess.run(["node", "--check", str(DOCS / "site-data.js")], check=True)

    data = parse_site_data()
    examples = data["examples"]
    categories = data["exampleCategories"]
    font_by_slug = data["fontBySlug"]
    fonts = data["fonts"]
    translations = data["translations"]

    if len(examples) != 19:
        fail(f"expected 19 examples, got {len(examples)}")
    if len(categories) < 10:
        fail(f"expected at least 10 example categories, got {len(categories)}")
    category_ids = {category["id"] for category in categories}
    if "all" not in category_ids:
        fail("example categories must include all")
    category_usage = {category_id: 0 for category_id in category_ids if category_id != "all"}
    for item in examples:
        if len(item) < 4 or "categories" not in item[3]:
            fail(f"example {item[0]} missing category metadata")
        for category_id in item[3]["categories"]:
            if category_id not in category_ids:
                fail(f"example {item[0]} uses unknown category {category_id}")
            if category_id in category_usage:
                category_usage[category_id] += 1
    empty_categories = sorted(key for key, count in category_usage.items() if count == 0)
    if empty_categories:
        fail(f"empty example categories: {empty_categories}")
    used_fonts = {font_by_slug[item[0]]["label"] for item in examples}
    if len(used_fonts) < 6:
        fail(f"expected at least 6 font profiles in examples, got {sorted(used_fonts)}")
    for key, value in translations.items():
        if "en" not in value or "ko" not in value:
            fail(f"translation key {key} lacks en/ko")

    pages = {
        "en": DOCS / "index.html",
        "ko": DOCS / "ko" / "index.html",
    }
    expected = {
        "en": (BASE, BASE, "en", "en_US"),
        "ko": (BASE + "ko/", BASE + "ko/", "ko", "ko_KR"),
    }
    for lang, path in pages.items():
        html = read(path)
        Parser().feed(html)
        page_url, canonical, html_lang, locale = expected[lang]
        assert_contains(html, f'<html lang="{html_lang}">', f"{lang} html lang")
        assert_contains(html, f'<link rel="canonical" href="{canonical}" />', f"{lang} canonical")
        assert_contains(html, f'hreflang="en" href="{BASE}"', f"{lang} hreflang en")
        assert_contains(html, f'hreflang="ko" href="{BASE}ko/"', f"{lang} hreflang ko")
        assert_contains(html, 'og:image" content="https://jinyoung89.github.io/mobile-ui-generator-skill/assets/og.png"', f"{lang} og image")
        assert_contains(html, 'og:image:width" content="1200"', f"{lang} og width")
        assert_contains(html, 'og:image:height" content="630"', f"{lang} og height")
        assert_contains(html, 'id="exampleCards"', f"{lang} static cards")
        assert_contains(html, 'id="exampleCategoryFilters"', f"{lang} category filters")
        assert_contains(html, 'id="exampleSummary"', f"{lang} example summary")
        assert_contains(html, 'id="fontCards"', f"{lang} static fonts")
        assert_contains(html, 'class="phone-card"', f"{lang} static card markup")
        ld = json_ld(html)
        if ld.get("url") != page_url or ld.get("inLanguage") != lang:
            fail(f"{lang} JSON-LD url/language mismatch")
        if locale not in html:
            fail(f"{lang} missing OG locale {locale}")

    ET.parse(DOCS / "sitemap.xml")
    sitemap = read(DOCS / "sitemap.xml")
    assert_contains(sitemap, f"<loc>{BASE}</loc>", "sitemap en")
    assert_contains(sitemap, f"<loc>{BASE}ko/</loc>", "sitemap ko")
    assert_contains(read(DOCS / "robots.txt"), "Sitemap:", "robots")

    og_png = DOCS / "assets" / "og.png"
    if not og_png.exists():
        fail("missing docs/assets/og.png")
    if Image:
        with Image.open(og_png) as im:
            if im.size != (1200, 630):
                fail(f"og.png expected 1200x630, got {im.size}")

    # Public-copy hygiene. Include untracked files when run before commit.
    files = subprocess.run(
        ["git", "ls-files", "--others", "--cached", "--exclude-standard"],
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=True,
    ).stdout.splitlines()
    for rel in files:
        path = ROOT / rel
        if rel in {"LICENSE", "docs/LOCAL_WORKFLOW.md"}:
            continue
        if path.suffix.lower() not in {".md", ".html", ".css", ".js", ".json", ".svg", ".txt", ".xml"}:
            continue
        try:
            text = read(path)
        except UnicodeDecodeError:
            continue
        for line_no, line in enumerate(text.splitlines(), 1):
            if PRIVATE_RE.search(line):
                fail(f"public-copy leak {rel}:{line_no}: {line[:120]}")

    print("site validation passed")


if __name__ == "__main__":
    main()
