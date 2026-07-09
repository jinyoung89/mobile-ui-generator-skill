#!/usr/bin/env python3
"""Validate the Mobile UI Generator static skill explanation page."""
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


def assert_not_contains(text: str, needle: str, label: str) -> None:
    if needle in text:
        fail(f"{label} must not contain {needle!r}")


def validate_skill_outputs(data: dict) -> None:
    translations = data.get("translations", {})
    outputs = data.get("skillOutputs", [])
    fonts = data.get("fonts", [])

    if len(outputs) < 4:
        fail(f"expected at least 4 skill output examples, got {len(outputs)}")
    if len(fonts) < 6:
        fail(f"expected at least 6 font profiles, got {len(fonts)}")

    for key, value in translations.items():
        if "en" not in value or "ko" not in value:
            fail(f"translation key {key} lacks en/ko")

    required_translation_keys = [
        "views.eyebrow",
        "views.title",
        "views.desc",
        "examples.generatedLabel",
        "examples.promptLabel",
        "examples.patternLabel",
        "examples.briefLabel",
        "examples.componentsLabel",
        "examples.statesLabel",
        "examples.specLabel",
        "examples.promptOutLabel",
        "aria.examples",
        "schema.label",
    ]
    for key in required_translation_keys:
        if key not in translations:
            fail(f"missing translation {key}")

    required_fields = {
        "id",
        "title",
        "sourcePrompt",
        "artifactTypes",
        "appType",
        "uiPatterns",
        "brief",
        "components",
        "states",
        "fontProfile",
        "preview",
        "spec",
        "implementationPrompt",
    }
    for item in outputs:
        missing = sorted(required_fields - set(item))
        if missing:
            fail(f"skill output {item.get('id', '<missing id>')} missing fields {missing}")
        for localized_field in ["title", "sourcePrompt", "appType", "brief", "components", "states", "spec", "implementationPrompt"]:
            value = item[localized_field]
            if not isinstance(value, dict) or "en" not in value or "ko" not in value:
                fail(f"skill output {item['id']} field {localized_field} lacks en/ko")
        if not item["uiPatterns"] or not item["artifactTypes"]:
            fail(f"skill output {item['id']} needs patterns and artifact types")
        font = item["fontProfile"]
        for key in ["family", "css_url", "fallback", "confidence", "reason"]:
            if key not in font:
                fail(f"skill output {item['id']} font profile missing {key}")
        for lang in ["en", "ko"]:
            spec = item["spec"][lang]
            if not isinstance(spec, dict) or "layout_archetype" not in spec or "state_matrix" not in spec:
                fail(f"skill output {item['id']} {lang} spec must include layout_archetype and state_matrix")
            preview = item["preview"].get(lang)
            if not isinstance(preview, dict) or "src" not in preview or "alt" not in preview:
                fail(f"skill output {item['id']} {lang} preview missing src/alt")
            src = preview["src"].replace("../", "")
            asset_path = DOCS / src
            if not asset_path.exists():
                fail(f"missing preview asset {src}")
            asset_text = read(asset_path)
            if "<svg" not in asset_text or "<title" not in asset_text or "<desc" not in asset_text:
                fail(f"preview asset {src} must be accessible SVG with title/desc")


def main() -> None:
    subprocess.run(["node", "--check", str(DOCS / "app.js")], check=True)
    subprocess.run(["node", "--check", str(DOCS / "site-data.js")], check=True)

    data = parse_site_data()
    validate_skill_outputs(data)

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
        assert_contains(html, 'id="exampleCards"', f"{lang} generated examples")
        assert_contains(html, 'class="skill-output-grid"', f"{lang} skill output grid")
        assert_contains(html, 'data-i18n="views.title"', f"{lang} generated examples copy")
        assert_contains(html, 'id="fontCards"', f"{lang} static fonts")
        assert_contains(html, 'id="references"', f"{lang} references section")
        assert_contains(html, 'references/pattern-analysis-insights.md', f"{lang} pattern analysis reference")
        assert_not_contains(html, 'hand-built HTML/CSS demos', f"{lang} old mock copy")
        assert_not_contains(html, 'class="phone-card"', f"{lang} old phone mock markup")
        assert_not_contains(html, 'id="exampleAppFilters"', f"{lang} old app filter markup")
        assert_not_contains(html, 'id="examplePatternFilters"', f"{lang} old pattern filter markup")
        ld = json_ld(html)
        if ld.get("url") != page_url or ld.get("inLanguage") != lang:
            fail(f"{lang} JSON-LD url/language mismatch")
        if locale not in html:
            fail(f"{lang} missing OG locale {locale}")

    css = read(DOCS / "styles.css")
    assert_contains(css, ".skill-output-grid", "skill output grid styles")
    assert_contains(css, ".skill-output-card", "skill output card styles")
    assert_contains(css, ".artifact-preview", "skill output preview styles")
    assert_not_contains(css, ".phone-card", "old phone mock CSS")
    assert_not_contains(css, ".phone-grid", "old phone carousel CSS")
    if "mock-visual" in read(DOCS / "app.js") or "mock-visual" in css:
        fail("old mock-visual renderer/styles must be removed")

    app_js = read(DOCS / "app.js")
    assert_contains(app_js, "renderSkillOutputs", "skill output renderer")
    assert_contains(app_js, "artifact-preview", "skill output preview renderer")
    assert_contains(app_js, "<img", "preview image element")
    assert_not_contains(app_js, "renderAuth", "old phone renderer")
    assert_not_contains(app_js, "phoneFrame", "old phone frame renderer")

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
