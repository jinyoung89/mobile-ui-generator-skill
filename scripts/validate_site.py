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
    "수집" + "처",
    "데이터" + "셋",
    "레퍼런스" + " 품질",
    "원본" + " 경로",
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
    app_categories = data["appCategories"]
    ui_pattern_categories = data["uiPatternCategories"]
    font_by_slug = data["fontBySlug"]
    fonts = data["fonts"]
    translations = data["translations"]

    if len(examples) != 19:
        fail(f"expected 19 examples, got {len(examples)}")
    if len(app_categories) < 9:
        fail(f"expected at least 9 app categories, got {len(app_categories)}")
    if len(ui_pattern_categories) < 13:
        fail(f"expected at least 13 UI pattern categories, got {len(ui_pattern_categories)}")

    app_ids = {category["id"] for category in app_categories}
    pattern_ids = {category["id"] for category in ui_pattern_categories}
    if "all" not in app_ids or "all" not in pattern_ids:
        fail("app and UI pattern categories must include all")

    app_usage = {category_id: 0 for category_id in app_ids if category_id != "all"}
    pattern_usage = {category_id: 0 for category_id in pattern_ids if category_id != "all"}
    layouts = set()
    for item in examples:
        slug = item.get("slug", "<missing slug>")
        required = {"slug", "layout", "theme", "appCategories", "uiPatterns", "mode", "copy"}
        missing = sorted(required - set(item))
        if missing:
            fail(f"example {slug} missing fields {missing}")
        layouts.add(item["layout"])
        if not item["appCategories"] or not item["uiPatterns"]:
            fail(f"example {slug} must include appCategories and uiPatterns")
        for category_id in item["appCategories"]:
            if category_id not in app_ids:
                fail(f"example {slug} uses unknown app category {category_id}")
            if category_id in app_usage:
                app_usage[category_id] += 1
        for category_id in item["uiPatterns"]:
            if category_id not in pattern_ids:
                fail(f"example {slug} uses unknown UI pattern {category_id}")
            if category_id in pattern_usage:
                pattern_usage[category_id] += 1
        for lang in ("en", "ko"):
            copy = item["copy"].get(lang)
            if not copy or "title" not in copy or "cardTitle" not in copy or "cta" not in copy:
                fail(f"example {slug} copy lacks required {lang} fields")

    if len(layouts) < 18:
        fail(f"expected diverse layouts, got {len(layouts)}")
    empty_apps = sorted(key for key, count in app_usage.items() if count == 0)
    empty_patterns = sorted(key for key, count in pattern_usage.items() if count == 0)
    if empty_apps:
        fail(f"empty app categories: {empty_apps}")
    if empty_patterns:
        fail(f"empty UI pattern categories: {empty_patterns}")

    used_fonts = {font_by_slug[item["slug"]]["label"] for item in examples}
    if len(used_fonts) < 6:
        fail(f"expected at least 6 font profiles in examples, got {sorted(used_fonts)}")
    if len(fonts) < 6:
        fail(f"expected at least 6 font cards, got {len(fonts)}")
    for key, value in translations.items():
        if "en" not in value or "ko" not in value:
            fail(f"translation key {key} lacks en/ko")
    for key in (
        "views.filter.label",
        "views.appFilter.label",
        "views.appFilter.help",
        "views.patternFilter.label",
        "views.patternFilter.help",
        "views.summary.apps",
        "views.summary.patterns",
        "aria.cards",
    ):
        if key not in translations:
            fail(f"missing translation {key}")

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
        assert_contains(html, 'id="exampleAppFilters"', f"{lang} app filters")
        assert_contains(html, 'id="examplePatternFilters"', f"{lang} UI pattern filters")
        assert_contains(html, 'id="exampleSummary"', f"{lang} example summary")
        assert_contains(html, 'id="fontCards"', f"{lang} static fonts")
        assert_contains(html, 'class="phone-card"', f"{lang} static card markup")
        if "mock-visual" in html:
            fail(f"{lang} page still contains old mock-visual markup")
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

    if "mock-visual" in read(DOCS / "app.js") or "mock-visual" in read(DOCS / "styles.css"):
        fail("old mock-visual renderer/styles must be removed")

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
