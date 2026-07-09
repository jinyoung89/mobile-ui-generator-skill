#!/usr/bin/env python3
"""Search the Mobile UI Generator skill references.

This script is intentionally self-contained and public-safe. It searches only the
generalized reference files shipped with the skill; it never depends on private
reference material, local manifests, collection details, or network access.

Examples:
  python3 scripts/search.py "fintech checkout coupon" --area all -n 5
  python3 scripts/search.py --pattern phone_verification
  python3 scripts/search.py "glass dark premium" --area styles -n 3
  python3 scripts/search.py "empty error loading" --area components -f json
"""
from __future__ import annotations

import argparse
import json
import re
import textwrap
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

ROOT = Path(__file__).resolve().parents[1]
REFERENCE_DIR = ROOT / "references"

AREA_FILES = {
    "evidence": ["evidence-and-sanitization.md"],
    "taxonomy": ["taxonomy-filter-model.md"],
    "analysis": ["pattern-analysis-insights.md"],
    "principles": ["design-principles.md"],
    "composition": ["visual-composition-contract.md"],
    "patterns": ["mobile-pattern-library.md"],
    "styles": ["visual-style-taxonomy.md"],
    "domains": ["domain-playbooks.md"],
    "components": ["component-state-checklist.md"],
    "quality": ["quality-review-checklist.md"],
}

SYNONYMS = {
    "checkout": ["payment", "pay", "cart", "coupon", "order", "결제", "장바구니", "쿠폰"],
    "payment": ["checkout", "simple_payment", "transfer", "money", "금융", "간편결제"],
    "signup": ["login", "phone_verification", "identity_verification", "terms_agreement", "가입", "인증"],
    "search": ["lookup", "query", "filter_sort", "탐색", "검색", "필터"],
    "map": ["location", "bottom_sheet_map", "route", "delivery_tracking", "지도", "위치"],
    "chat": ["messenger", "conversation", "attachment", "media_capture", "채팅"],
    "ai": ["generate_create_flow", "ai_assistant_panel", "generation", "assistant", "생성"],
    "game": ["gamification", "ranking", "points_rewards", "reward", "quest", "게임"],
    "analytics": ["report", "chart", "data", "dashboard", "통계", "리포트"],
    "app_type": ["service", "category", "domain", "서비스", "앱종류", "앱 종류", "카테고리"],
    "ui_pattern": ["feature", "function", "pattern", "기능단위", "기능 단위", "패턴"],
    "food": ["food_delivery", "menu_detail", "cart", "delivery_tracking", "배달", "음식"],
    "pet": ["pet_care", "pet_profile_setup", "care_record", "반려동물"],
    "travel": ["travel_booking", "itinerary_view", "calendar_slots", "여행", "예약"],
    "healthcare": ["clinic_booking", "pharmacy_health_record", "mental_health", "헬스케어", "병원"],
    "style": ["visual", "typography", "color", "motion", "mood", "스타일"],
    "accessibility": ["a11y", "contrast", "touch", "screen reader", "접근성"],
    "empty": ["empty_state", "no results", "no data", "빈 상태"],
    "error": ["error_state", "retry", "failure", "recovery", "오류"],
    "utility": ["bill", "payment", "receipt", "deadline", "공공", "요금"],
    "insurance": ["claim", "document_review", "comparison", "보험", "청구"],
    "career": ["job", "application_request_flow", "resume", "채용", "지원"],
    "creator": ["upload_create", "media_capture", "ai", "publish", "크리에이터", "업로드"],
    "grocery": ["cart", "coupon_points", "delivery", "substitution", "장보기", "리테일"],
    "ticket": ["qr", "reservation", "checkout", "gate", "티켓", "이벤트"],
    "smart_home": ["device_control", "alert", "permission", "iot", "스마트홈"],
}

TOKEN_RE = re.compile(r"[a-z0-9_]+|[가-힣]+", re.I)
HEADING_RE = re.compile(r"^(#{2,4})\s+(.+?)\s*$")
CODE_TITLE_RE = re.compile(r"`([^`]+)`")


@dataclass
class Section:
    area: str
    source: str
    title: str
    slug: str
    heading_level: int
    body: str

    @property
    def searchable(self) -> str:
        return f"{self.area} {self.source} {self.title} {self.slug}\n{self.body}".lower()


def tokenize(text: str) -> list[str]:
    return [m.group(0).lower() for m in TOKEN_RE.finditer(text)]


def expand_terms(terms: Iterable[str]) -> list[str]:
    expanded: list[str] = []
    for term in terms:
        if term not in expanded:
            expanded.append(term)
        for synonym in SYNONYMS.get(term, []):
            s = synonym.lower()
            if s not in expanded:
                expanded.append(s)
    return expanded


def slugify(title: str) -> str:
    code = CODE_TITLE_RE.search(title)
    if code:
        return code.group(1).strip()
    cleaned = re.sub(r"[^a-zA-Z0-9가-힣_ -]+", "", title).strip().lower()
    return re.sub(r"\s+", "_", cleaned)[:80]


def area_for_file(filename: str) -> str:
    for area, files in AREA_FILES.items():
        if filename in files:
            return area
    return "other"


def iter_reference_files(area: str) -> list[Path]:
    if area == "all":
        files = [name for names in AREA_FILES.values() for name in names]
    else:
        files = AREA_FILES.get(area)
        if files is None:
            raise SystemExit(f"Unknown area {area!r}. Use --list-areas.")
    return [REFERENCE_DIR / name for name in files]


def parse_sections(path: Path) -> list[Section]:
    text = path.read_text(encoding="utf-8")
    area = area_for_file(path.name)
    sections: list[Section] = []
    current_title = path.stem
    current_level = 1
    current_lines: list[str] = []

    def flush() -> None:
        nonlocal current_lines
        body = "\n".join(current_lines).strip()
        if body or current_title != path.stem:
            sections.append(
                Section(
                    area=area,
                    source=path.name,
                    title=current_title,
                    slug=slugify(current_title),
                    heading_level=current_level,
                    body=body,
                )
            )
        current_lines = []

    for line in text.splitlines():
        m = HEADING_RE.match(line)
        if m:
            flush()
            current_level = len(m.group(1))
            current_title = m.group(2).strip()
        else:
            current_lines.append(line)
    flush()
    return sections


def load_sections(area: str) -> list[Section]:
    sections: list[Section] = []
    for path in iter_reference_files(area):
        if path.exists():
            sections.extend(parse_sections(path))
    return sections


def score_section(section: Section, terms: list[str], raw_query: str) -> int:
    hay = section.searchable
    title = f"{section.title} {section.slug}".lower()
    score = 0
    raw = raw_query.lower().strip()
    if raw and raw in title:
        score += 50
    if raw and raw in hay:
        score += 15
    for term in terms:
        if not term:
            continue
        title_hits = title.count(term)
        body_hits = hay.count(term)
        score += title_hits * 12
        score += min(body_hits, 8) * 2
        if section.slug.lower() == term:
            score += 100
    if section.heading_level == 3 and section.source == "mobile-pattern-library.md":
        score += 3
    return score


def compact_excerpt(body: str, terms: list[str], width: int = 900) -> str:
    lines = [line.strip() for line in body.splitlines() if line.strip()]
    if not lines:
        return ""
    lowered_terms = [t.lower() for t in terms if t]
    start = 0
    for i, line in enumerate(lines):
        low = line.lower()
        if any(t in low for t in lowered_terms):
            start = max(0, i - 2)
            break
    excerpt = "\n".join(lines[start : start + 14])
    if len(excerpt) > width:
        excerpt = excerpt[: width - 1].rstrip() + "…"
    return excerpt


def search(query: str, area: str, limit: int) -> list[dict]:
    raw_terms = tokenize(query)
    terms = expand_terms(raw_terms)
    results = []
    for section in load_sections(area):
        score = score_section(section, terms, query)
        if score <= 0:
            continue
        results.append(
            {
                "score": score,
                "area": section.area,
                "source": section.source,
                "title": section.title,
                "slug": section.slug,
                "excerpt": compact_excerpt(section.body, terms),
            }
        )
    results.sort(key=lambda item: (-item["score"], item["source"], item["title"]))
    return results[:limit]


def lookup_pattern(pattern_id: str) -> dict | None:
    pattern_id = pattern_id.strip()
    for section in load_sections("patterns"):
        if section.slug == pattern_id or f"`{pattern_id}`" in section.title:
            return {
                "area": section.area,
                "source": section.source,
                "title": section.title,
                "slug": section.slug,
                "body": section.body,
            }
    return None


def print_markdown(query: str, results: list[dict]) -> None:
    print("# Mobile UI Reference Search")
    print()
    print(f"- query: `{query}`")
    print(f"- results: {len(results)}")
    print()
    for index, item in enumerate(results, 1):
        print(f"## {index}. {item['title']}")
        print()
        print(f"- area: `{item['area']}`")
        print(f"- source: `{item['source']}`")
        print(f"- slug: `{item['slug']}`")
        print(f"- score: `{item['score']}`")
        if item.get("excerpt"):
            print()
            print(textwrap.indent(item["excerpt"], "> "))
        print()


def main() -> None:
    parser = argparse.ArgumentParser(description="Search Mobile UI Generator skill references")
    parser.add_argument("query", nargs="?", default="", help="Search query")
    parser.add_argument("--area", default="all", choices=["all", *AREA_FILES.keys()], help="Reference area to search")
    parser.add_argument("-n", "--limit", type=int, default=6, help="Maximum search results")
    parser.add_argument("-f", "--format", choices=["markdown", "json"], default="markdown", help="Output format")
    parser.add_argument("--pattern", help="Return one pattern by exact pattern id, e.g. checkout")
    parser.add_argument("--list-areas", action="store_true", help="List searchable areas")
    args = parser.parse_args()

    if args.list_areas:
        payload = {area: files for area, files in AREA_FILES.items()}
        if args.format == "json":
            print(json.dumps(payload, ensure_ascii=False, indent=2))
        else:
            print("# Searchable areas")
            for area, files in payload.items():
                print(f"- `{area}`: {', '.join(files)}")
        return

    if args.pattern:
        item = lookup_pattern(args.pattern)
        if item is None:
            raise SystemExit(f"Pattern not found: {args.pattern}")
        if args.format == "json":
            print(json.dumps(item, ensure_ascii=False, indent=2))
        else:
            print(f"# {item['title']}")
            print()
            print(f"- area: `{item['area']}`")
            print(f"- source: `{item['source']}`")
            print(f"- slug: `{item['slug']}`")
            print()
            print(item["body"])
        return

    if not args.query.strip():
        raise SystemExit("Provide a query, --pattern, or --list-areas.")

    results = search(args.query, args.area, max(1, args.limit))
    if args.format == "json":
        print(json.dumps({"query": args.query, "area": args.area, "results": results}, ensure_ascii=False, indent=2))
    else:
        print_markdown(args.query, results)


if __name__ == "__main__":
    main()
