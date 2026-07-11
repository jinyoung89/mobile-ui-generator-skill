#!/usr/bin/env python3
"""Validate the artifact-driven GitHub Pages static export."""
from __future__ import annotations

import json
import re
import subprocess
import sys
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
BLOCKED = re.compile("|".join(map(re.escape, ["/" + "Users" + "/", "cookie" + "=", "client" + "_secret", "access" + "_token", "private" + " corpus"])), re.I)


class Links(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.links: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        for field in ("href", "src"):
            if values.get(field):
                self.links.append(str(values[field]))


def fail(message: str) -> None:
    print(f"FAIL: {message}", file=sys.stderr)
    raise SystemExit(1)


def local_target(page: Path, link: str) -> Path | None:
    parsed = urlsplit(link)
    if parsed.scheme or parsed.netloc or link.startswith(("#", "mailto:")):
        return None
    target = (page.parent / parsed.path).resolve()
    if parsed.path.endswith("/"):
        target /= "index.html"
    return target


def main() -> None:
    if len(sys.argv) == 3 and sys.argv[1] == "--compat-fixture":
        fixture = Path(sys.argv[2])
        if BLOCKED.search(fixture.read_text(encoding="utf-8")):
            fail(f"public-copy leak {fixture}")
        print("compatibility fixture passed")
        return
    if len(sys.argv) != 1:
        fail("usage: validate_site.py [--compat-fixture PATH]")
    manifest_path = DOCS / "route-manifest.json"
    if not manifest_path.exists():
        fail("missing route-manifest.json; run npm run build:site")
    routes = json.loads(manifest_path.read_text(encoding="utf-8")).get("routes", [])
    if not routes or routes[0] != "./" or len(routes) != len(set(routes)):
        fail("route manifest must contain unique routes beginning with ./")

    subprocess.run(["node", "--check", str(DOCS / "assets/site.js")], check=True)
    required_home = ['id="example-grid"', 'data-filter="category"', 'data-filter="pattern"', 'id="install"']
    required_detail = ['role="tablist" aria-label="Source platform"', 'data-copy-source', 'aria-label="Preview width"']
    for route in routes:
        page = DOCS / ("index.html" if route == "./" else f"{route}index.html")
        if not page.exists():
            fail(f"missing route file {route}")
        html = page.read_text(encoding="utf-8")
        try:
            parser = Links()
            parser.feed(html)
        except Exception as exc:
            fail(f"invalid HTML in {route}: {exc}")
        for marker in required_home if route == "./" else required_detail:
            if marker not in html:
                fail(f"{route} missing {marker}")
        for link in parser.links:
            target = local_target(page, link)
            if target is not None and not target.exists():
                fail(f"broken local link from {route}: {link}")

    if not (DOCS / "assets/site-catalog.json").exists():
        fail("missing generated site catalog")
    catalog = json.loads((DOCS / "assets/site-catalog.json").read_text(encoding="utf-8"))
    if len(catalog) != len(routes) - 1:
        fail("catalog and detail-route counts differ")
    ET.parse(DOCS / "sitemap.xml")
    sitemap = (DOCS / "sitemap.xml").read_text(encoding="utf-8")
    for route in routes:
        suffix = "" if route == "./" else route
        if f"mobile-ui-generator-skill/{suffix}" not in sitemap:
            fail(f"sitemap missing {route}")
    if "Sitemap:" not in (DOCS / "robots.txt").read_text(encoding="utf-8"):
        fail("robots.txt must retain a sitemap directive")

    generated_files = [DOCS / "index.html", DOCS / "assets/site.css", DOCS / "assets/site.js", DOCS / "assets/site-catalog.json", DOCS / "route-manifest.json", DOCS / "sitemap.xml", DOCS / "llms.txt"]
    generated_files.extend(DOCS / f"{route}index.html" for route in routes if route != "./")
    for file in generated_files:
        relative = file.relative_to(ROOT).as_posix()
        if file.suffix.lower() not in {".md", ".html", ".css", ".js", ".json", ".svg", ".txt", ".xml"} or not file.is_file():
            continue
        try:
            contents = file.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        if BLOCKED.search(contents):
            fail(f"public-boundary marker in {relative}")
    print(f"site validation passed: {len(routes)} routes, {len(catalog)} examples")


if __name__ == "__main__":
    main()
