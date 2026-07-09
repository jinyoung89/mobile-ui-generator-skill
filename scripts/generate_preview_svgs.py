#!/usr/bin/env python3
"""Generate public showcase SVG previews from docs/site-data.js.

The previews intentionally use one shared visual-composition template:
- fixed canvas and three-column layout;
- one phone frame component;
- reusable card, row, field, CTA, and sheet slots;
- no JSON/spec/debug text inside the app screen;
- visual QA metadata embedded in every SVG.
"""
from __future__ import annotations

import json
import re
import textwrap
import xml.etree.ElementTree as ET
from html import escape
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
DATA_FILE = DOCS / "site-data.js"
OUT_DIR = DOCS / "assets" / "examples"
TEMPLATE_ID = "visual-composition-v2"
GENERATED_BY = "scripts/generate_preview_svgs.py"

CANVAS_W = 1200
CANVAS_H = 760

THEMES: dict[str, dict[str, str]] = {
    "fintech-phone-verification": {
        "accent": "#0ea5e9",
        "accent_soft": "#e0f2fe",
        "accent_deep": "#0369a1",
        "surface": "#f8fafc",
        "surface_alt": "#ffffff",
        "danger": "#ef4444",
    },
    "commerce-checkout": {
        "accent": "#f59e0b",
        "accent_soft": "#fef3c7",
        "accent_deep": "#92400e",
        "surface": "#fffbeb",
        "surface_alt": "#ffffff",
        "danger": "#dc2626",
    },
    "mobility-map-booking": {
        "accent": "#10b981",
        "accent_soft": "#d1fae5",
        "accent_deep": "#047857",
        "surface": "#ecfdf5",
        "surface_alt": "#ffffff",
        "danger": "#ef4444",
    },
    "account-cancellation": {
        "accent": "#ef4444",
        "accent_soft": "#fee2e2",
        "accent_deep": "#991b1b",
        "surface": "#fff7f7",
        "surface_alt": "#ffffff",
        "danger": "#dc2626",
    },
}

SCENARIO_COPY: dict[str, dict[str, dict[str, Any]]] = {
    "fintech-phone-verification": {
        "ko": {
            "short_title": "휴대폰 인증",
            "screen_title": "휴대폰 번호를 확인해요",
            "screen_helper": "가입을 계속하려면 문자로 받은 인증번호를 입력하세요.",
            "primary": "인증하고 계속하기",
            "field": "010-****-4821",
            "field_label": "인증 대상 번호",
            "error": "인증번호가 맞지 않아요.",
            "timer": "02:31 후 재전송",
            "terms": "필수 약관 동의 완료",
            "outcomes": ["인증 작업만 보이는 단일 폼", "오류와 재전송을 입력 영역 가까이에 배치", "조건 충족 전 CTA는 안전하게 비활성"],
            "composition": ["단일 컬럼 · 20pt 좌우 패딩", "입력/오류/CTA가 같은 왼쪽 기준선", "하단 CTA 영역만 고정"],
        },
        "en": {
            "short_title": "Phone verification",
            "screen_title": "Verify your phone",
            "screen_helper": "Enter the code sent by SMS to continue signup.",
            "primary": "Verify and continue",
            "field": "010-****-4821",
            "field_label": "Phone number",
            "error": "The code does not match.",
            "timer": "Resend in 02:31",
            "terms": "Required terms accepted",
            "outcomes": ["Single-task verification form", "Error and resend states stay near the input", "Fixed CTA is safe until requirements pass"],
            "composition": ["Single column · 20pt side padding", "Fields, errors, and CTA share one left edge", "Only the bottom CTA is fixed"],
        },
    },
    "commerce-checkout": {
        "ko": {
            "short_title": "주문/결제",
            "screen_title": "결제 전 확인",
            "screen_helper": "쿠폰과 포인트가 반영된 최종 금액을 확인하세요.",
            "primary": "68,400원 결제하기",
            "amount_label": "최종 결제금액",
            "amount": "68,400원",
            "item": "상품 2개 · 오늘 출발",
            "delivery": "배송비 0원",
            "coupon": "쿠폰 -5,000원",
            "points": "포인트 2,400P",
            "payment": "카드 · **** 4821",
            "outcomes": ["최종 금액이 첫 번째 시각 초점", "할인/포인트 변경에도 breakdown 유지", "결제 실패는 CTA 근처에서 복구"],
            "composition": ["금액 카드 1개 + 보조 카드 2개", "가격 행은 오른쪽 끝 정렬", "결제 CTA에 금액 반복"],
        },
        "en": {
            "short_title": "Checkout",
            "screen_title": "Review payment",
            "screen_helper": "Confirm the final amount after coupons and points.",
            "primary": "Pay ₩68,400",
            "amount_label": "Total payment",
            "amount": "₩68,400",
            "item": "2 items · ships today",
            "delivery": "Delivery ₩0",
            "coupon": "Coupon -₩5,000",
            "points": "Points 2,400P",
            "payment": "Card · **** 4821",
            "outcomes": ["Final amount is the visual anchor", "Discount and points keep the breakdown visible", "Payment failure recovers near the CTA"],
            "composition": ["One amount card + two support cards", "Price rows align to the right edge", "Payment CTA repeats the amount"],
        },
    },
    "mobility-map-booking": {
        "ko": {
            "short_title": "경로 예약",
            "screen_title": "강남역 → 한강공원",
            "screen_helper": "지도 맥락을 유지한 채 경로와 요금을 비교합니다.",
            "primary": "예약하고 결제하기",
            "sheet_title": "경로 선택",
            "route_fast": "빠른 경로",
            "route_fast_meta": "18분 · 추천",
            "route_value": "저렴한 경로",
            "route_value_meta": "24분 · 8분 대기",
            "outcomes": ["지도는 배경 맥락, 선택은 시트에서 처리", "요금/ETA/CTA를 한 시트 안에 배치", "권한 거부 시 주소 목록으로 전환"],
            "composition": ["상단 55% 지도 + 하단 시트", "시트가 지도 컨트롤을 모두 가리지 않음", "경로 행 높이와 가격 위치 고정"],
        },
        "en": {
            "short_title": "Route booking",
            "screen_title": "Gangnam → Han River",
            "screen_helper": "Compare routes and fares without losing map context.",
            "primary": "Reserve and pay",
            "sheet_title": "Choose route",
            "route_fast": "Fast route",
            "route_fast_meta": "18m · recommended",
            "route_value": "Value route",
            "route_value_meta": "24m · 8m wait",
            "outcomes": ["Map provides context; choices live in the sheet", "Fare, ETA, and CTA stay in one sheet", "Denied location falls back to address list"],
            "composition": ["Top 55% map + lower sheet", "Sheet does not cover every map control", "Route rows keep fixed height and price edge"],
        },
    },
    "account-cancellation": {
        "ko": {
            "short_title": "계정 탈퇴",
            "screen_title": "탈퇴 전에 확인하세요",
            "screen_helper": "삭제되는 정보와 대안을 먼저 확인한 뒤 진행합니다.",
            "primary": "계정 탈퇴하기",
            "risk_title": "삭제되는 정보",
            "risk_1": "보관함·포인트",
            "risk_2": "구독 혜택",
            "risk_3": "복구 불가",
            "alternative_1": "계정 일시정지",
            "alternative_2": "고객센터 상담",
            "reason": "서비스를 더 이상 사용하지 않아요",
            "confirm": "결과를 이해했습니다",
            "outcomes": ["위험 고지를 첫 화면 위쪽에 배치", "대안과 고객센터를 탈퇴 CTA보다 먼저 제시", "사유와 확인 후 파괴적 CTA 활성"],
            "composition": ["위험 카드 + 대안 카드 + 확인 폼", "파괴적 CTA는 일반 액션과 색/위치 분리", "지원 경로가 마지막까지 남음"],
        },
        "en": {
            "short_title": "Delete account",
            "screen_title": "Review before leaving",
            "screen_helper": "Confirm what will be removed and see alternatives first.",
            "primary": "Delete account",
            "risk_title": "What will be removed",
            "risk_1": "Saved data",
            "risk_2": "Subscription perks",
            "risk_3": "Cannot be restored",
            "alternative_1": "Pause account",
            "alternative_2": "Contact support",
            "reason": "I no longer use the service",
            "confirm": "I understand the consequences",
            "outcomes": ["Risk disclosure appears near the top", "Alternatives and support appear before deletion", "Reason and confirmation gate the destructive CTA"],
            "composition": ["Risk card + alternatives + confirmation form", "Destructive CTA is separated by color and position", "Support path remains visible until the end"],
        },
    },
}


def load_site_data() -> dict[str, Any]:
    text = DATA_FILE.read_text(encoding="utf-8")
    match = re.search(r"Object\.freeze\((.*)\);\s*$", text, flags=re.S)
    if not match:
        raise SystemExit("Could not parse docs/site-data.js Object.freeze payload")
    return json.loads(match.group(1))


def localize(value: Any, lang: str) -> Any:
    if isinstance(value, dict):
        return value.get(lang) or value.get("en") or value.get("ko") or ""
    return value


def attrs(**kwargs: Any) -> str:
    parts = []
    for key, value in kwargs.items():
        if value is None:
            continue
        key = key.replace("_", "-")
        parts.append(f'{key}="{escape(str(value), quote=True)}"')
    return " ".join(parts)


def rect(x: float, y: float, w: float, h: float, rx: float, fill: str, stroke: str | None = None, sw: float = 1, opacity: float | None = None) -> str:
    return f"<rect {attrs(x=x, y=y, width=w, height=h, rx=rx, fill=fill, stroke=stroke, stroke_width=sw, opacity=opacity)}/>"


def circle(cx: float, cy: float, r: float, fill: str, opacity: float | None = None, stroke: str | None = None, sw: float = 1) -> str:
    return f"<circle {attrs(cx=cx, cy=cy, r=r, fill=fill, opacity=opacity, stroke=stroke, stroke_width=sw)}/>"


def path(d: str, stroke: str, sw: float, fill: str = "none", opacity: float | None = None) -> str:
    return f"<path {attrs(d=d, fill=fill, stroke=stroke, stroke_width=sw, stroke_linecap='round', stroke_linejoin='round', opacity=opacity)}/>"


def text(x: float, y: float, value: str, size: int = 16, weight: int = 700, fill: str = "#111827", anchor: str | None = None, opacity: float | None = None, letter_spacing: str | None = None) -> str:
    return f"<text {attrs(x=x, y=y, fill=fill, font_size=size, font_weight=weight, text_anchor=anchor, opacity=opacity, letter_spacing=letter_spacing)}>{escape(str(value))}</text>"


def wrap_text(value: str, lang: str, width: int) -> list[str]:
    if not value:
        return []
    # Korean has fewer safe break points; allow hard wrapping but keep short lines.
    return textwrap.wrap(value, width=width, break_long_words=(lang == "ko"), replace_whitespace=False) or [value]


def multiline(x: float, y: float, value: str, lang: str, width: int, line_h: int, size: int, weight: int, fill: str, max_lines: int) -> str:
    lines = wrap_text(value, lang, width)[:max_lines]
    return "\n".join(text(x, y + i * line_h, line, size, weight, fill) for i, line in enumerate(lines))


def pill(x: float, y: float, w: float, label: str, fill: str, text_fill: str, size: int = 12) -> str:
    return "\n".join([
        rect(x, y, w, 30, 15, fill),
        text(x + w / 2, y + 20, label, size, 850, text_fill, anchor="middle"),
    ])


def card_header(label: str, x: float, y: float, accent: str) -> str:
    return text(x, y, label.upper(), 12, 900, accent, letter_spacing="1.5")


def phone_frame(x: float, y: float, w: float, h: float, surface: str) -> list[str]:
    return [
        rect(x, y, w, h, 44, "#07111f", "#27374f", 2),
        rect(x + 10, y + 10, w - 20, h - 20, 34, surface),
        rect(x + w / 2 - 42, y + 23, 84, 7, 4, "#0f172a", opacity=0.22),
        text(x + 32, y + 45, "9:41", 12, 850, "#334155"),
        circle(x + w - 56, y + 39, 4, "#334155", 0.65),
        circle(x + w - 43, y + 39, 4, "#334155", 0.45),
        circle(x + w - 30, y + 39, 4, "#334155", 0.28),
    ]


def app_bar(x: float, y: float, w: float, title_value: str, close: bool = False) -> list[str]:
    icon = "×" if close else "‹"
    return [
        text(x + 28, y + 90, icon, 26, 900, "#111827"),
        text(x + 68, y + 88, title_value, 18, 900, "#111827"),
    ]


def button(x: float, y: float, w: float, label: str, fill: str, text_fill: str = "#ffffff") -> list[str]:
    return [rect(x, y, w, 56, 22, fill), text(x + w / 2, y + 35, label, 16, 900, text_fill, anchor="middle")]


def info_row(x: float, y: float, w: float, title_value: str, meta: str, accent: str, price: str | None = None) -> list[str]:
    parts = [rect(x, y, w, 58, 18, "#ffffff", "#e5e7eb", 1), text(x + 18, y + 25, title_value, 14, 900, "#111827"), text(x + 18, y + 45, meta, 12, 700, "#64748b")]
    if price:
        parts.append(text(x + w - 16, y + 35, price, 13, 900, "#111827", anchor="end"))
    else:
        parts.append(circle(x + w - 28, y + 29, 5, accent))
    return parts


def render_single_task_phone(copy: dict[str, Any], theme: dict[str, str], lang: str) -> str:
    x, y, w, h = 430, 44, 340, 672
    ix, iw = x + 34, w - 68
    parts = phone_frame(x, y, w, h, theme["surface"])
    parts += app_bar(x, y, w, copy["short_title"])
    parts += [
        multiline(ix, y + 150, copy["screen_title"], lang, 18, 29, 24, 900, "#0f172a", 2),
        multiline(ix, y + 210, copy["screen_helper"], lang, 24 if lang == "ko" else 34, 21, 14, 650, "#64748b", 2),
        rect(ix, y + 270, iw, 70, 20, "#ffffff", "#e2e8f0"),
        text(ix + 18, y + 298, copy["field_label"], 12, 800, "#64748b"),
        text(ix + 18, y + 324, copy["field"], 21, 900, "#111827"),
    ]
    box_w = 37
    gap = 8
    code_x = ix
    for i, digit in enumerate(["1", "4", "8", "", "", ""]):
        bx = code_x + i * (box_w + gap)
        parts.append(rect(bx, y + 370, box_w, 48, 12, "#ffffff", theme["accent"] if i == 3 else "#cbd5e1", 2))
        parts.append(text(bx + box_w / 2, y + 401, digit or "•", 21, 900, "#0f172a", anchor="middle", opacity=None if digit else 0.3))
    parts += [
        text(ix, y + 450, copy["error"], 13, 850, theme["danger"]),
        text(ix + iw, y + 450, copy["timer"], 13, 850, theme["accent_deep"], anchor="end"),
        rect(ix, y + 490, iw, 52, 18, "#ffffff", "#e2e8f0"),
        rect(ix + 18, y + 506, 22, 22, 7, theme["accent"]),
        text(ix + 52, y + 524, copy["terms"], 14, 800, "#111827"),
    ]
    parts += button(ix, y + h - 82, iw, copy["primary"], theme["accent"])
    return "\n".join(parts)


def render_checkout_phone(copy: dict[str, Any], theme: dict[str, str], lang: str) -> str:
    x, y, w, h = 430, 44, 340, 672
    ix, iw = x + 34, w - 68
    parts = phone_frame(x, y, w, h, theme["surface"])
    parts += app_bar(x, y, w, copy["short_title"])
    parts += [
        rect(ix, y + 116, iw, 92, 24, "#111827"),
        text(ix + 20, y + 150, copy["amount_label"], 13, 800, theme["accent"]),
        text(ix + 20, y + 187, copy["amount"], 30, 900, "#ffffff"),
        rect(ix, y + 228, iw, 68, 18, "#ffffff", "#fde68a"),
        text(ix + 18, y + 256, copy["item"], 15, 900, "#111827"),
        text(ix + 18, y + 280, copy["delivery"], 13, 750, "#64748b"),
    ]
    half = (iw - 14) / 2
    parts += [
        rect(ix, y + 316, half, 70, 18, "#ffffff", "#fed7aa"),
        text(ix + 16, y + 346, copy["coupon"], 14, 900, theme["accent_deep"]),
        rect(ix + half + 14, y + 316, half, 70, 18, "#ffffff", "#fed7aa"),
        text(ix + half + 30, y + 346, copy["points"], 14, 900, theme["accent_deep"]),
    ]
    rows = [("Items" if lang == "en" else "상품금액", "₩75,800" if lang == "en" else "75,800원"), ("Discount" if lang == "en" else "할인", "-₩7,400" if lang == "en" else "-7,400원"), ("Delivery" if lang == "en" else "배송비", "₩0" if lang == "en" else "0원")]
    yy = y + 420
    for label, value in rows:
        parts += [text(ix + 8, yy, label, 13, 750, "#64748b"), text(ix + iw - 8, yy, value, 13, 900, "#111827", anchor="end")]
        yy += 30
    parts += [
        rect(ix, y + 518, iw, 46, 16, "#ffffff", "#e5e7eb"),
        text(ix + 18, y + 547, copy["payment"], 14, 850, "#111827"),
    ]
    parts += button(ix, y + h - 82, iw, copy["primary"], "#111827")
    return "\n".join(parts)


def render_map_phone(copy: dict[str, Any], theme: dict[str, str], lang: str) -> str:
    x, y, w, h = 430, 44, 340, 672
    parts = phone_frame(x, y, w, h, theme["surface"])
    map_x, map_y, map_w, map_h = x + 14, y + 60, w - 28, 380
    parts += [
        rect(map_x, map_y, map_w, map_h, 30, "#dbeafe"),
        path(f"M{map_x+34} {map_y+220} C{map_x+110} {map_y+145}, {map_x+206} {map_y+300}, {map_x+278} {map_y+150}", "#94a3b8", 18, opacity=0.35),
        path(f"M{map_x+56} {map_y+280} C{map_x+128} {map_y+205}, {map_x+210} {map_y+260}, {map_x+268} {map_y+120}", theme["accent"], 7),
        circle(map_x + 56, map_y + 280, 13, "#22c55e", stroke="#ffffff", sw=4),
        circle(map_x + 268, map_y + 120, 13, theme["danger"], stroke="#ffffff", sw=4),
        rect(x + 34, y + 86, w - 68, 48, 18, "#ffffff", "#c7d2fe"),
        text(x + 52, y + 116, copy["screen_title"], 15, 900, "#111827"),
    ]
    sheet_x, sheet_y, sheet_w, sheet_h = x + 20, y + 392, w - 40, 270
    parts += [
        rect(sheet_x, sheet_y, sheet_w, sheet_h, 30, "#ffffff", "#d1d5db"),
        rect(sheet_x + sheet_w / 2 - 28, sheet_y + 14, 56, 5, 3, "#cbd5e1"),
        text(sheet_x + 24, sheet_y + 50, copy["sheet_title"], 21, 900, "#111827"),
    ]
    parts += info_row(sheet_x + 24, sheet_y + 72, sheet_w - 48, copy["route_fast"], copy["route_fast_meta"], theme["accent"], "₩12,400" if lang == "en" else "12,400원")
    parts += info_row(sheet_x + 24, sheet_y + 140, sheet_w - 48, copy["route_value"], copy["route_value_meta"], theme["accent"], "₩9,800" if lang == "en" else "9,800원")
    parts += button(sheet_x + 24, sheet_y + 210, sheet_w - 48, copy["primary"], theme["accent"])
    return "\n".join(parts)


def render_destructive_phone(copy: dict[str, Any], theme: dict[str, str], lang: str) -> str:
    x, y, w, h = 430, 44, 340, 672
    ix, iw = x + 34, w - 68
    parts = phone_frame(x, y, w, h, theme["surface"])
    parts += app_bar(x, y, w, copy["short_title"], close=True)
    parts += [
        multiline(ix, y + 146, copy["screen_title"], lang, 16 if lang == "ko" else 22, 29, 23, 900, theme["accent_deep"], 2),
        multiline(ix, y + 204, copy["screen_helper"], lang, 25 if lang == "ko" else 32, 20, 13, 650, "#64748b", 2),
        rect(ix, y + 260, iw, 98, 22, theme["accent_soft"], "#fecaca"),
        text(ix + 18, y + 292, copy["risk_title"], 15, 900, theme["accent_deep"]),
    ]
    for i, key in enumerate(["risk_1", "risk_2", "risk_3"]):
        parts.append(text(ix + 22, y + 322 + i * 22, "• " + copy[key], 13, 780, "#7f1d1d"))
    half = (iw - 14) / 2
    parts += [
        rect(ix, y + 382, half, 60, 18, "#ffffff", "#fecaca"),
        text(ix + 14, y + 416, copy["alternative_1"], 12, 850, "#111827"),
        rect(ix + half + 14, y + 382, half, 60, 18, "#ffffff", "#fecaca"),
        text(ix + half + 28, y + 416, copy["alternative_2"], 12, 850, "#111827"),
        rect(ix, y + 466, iw, 78, 18, "#ffffff", "#e5e7eb"),
        text(ix + 18, y + 494, "Reason" if lang == "en" else "탈퇴 사유", 13, 900, "#374151"),
        multiline(ix + 18, y + 520, copy["reason"], lang, 22 if lang == "ko" else 28, 18, 12, 700, "#64748b", 2),
        rect(ix, y + 560, iw, 42, 16, "#ffffff", "#e5e7eb"),
        rect(ix + 16, y + 571, 20, 20, 7, theme["danger"]),
        text(ix + 48, y + 587, copy["confirm"], 12, 800, "#111827"),
    ]
    parts += button(ix, y + h - 74, iw, copy["primary"], theme["accent_soft"], theme["accent_deep"])
    return "\n".join(parts)


PHONE_RENDERERS = {
    "fintech-phone-verification": render_single_task_phone,
    "commerce-checkout": render_checkout_phone,
    "mobility-map-booking": render_map_phone,
    "account-cancellation": render_destructive_phone,
}


def prompt_panel(item: dict[str, Any], copy: dict[str, Any], theme: dict[str, str], lang: str) -> str:
    x, y, w, h = 48, 58, 332, 644
    label_prompt = "요청 프롬프트" if lang == "ko" else "Requested prompt"
    label_result = "생성되는 UI/UX" if lang == "ko" else "Generated UI/UX"
    source_prompt = localize(item["sourcePrompt"], lang)
    parts = [
        rect(x, y, w, h, 30, "#111827", "#ffffff", opacity=None),
        card_header(label_prompt, x + 28, y + 48, theme["accent"]),
        multiline(x + 28, y + 92, source_prompt, lang, 17 if lang == "ko" else 29, 26, 19, 850, "#ffffff", 5),
        rect(x + 28, y + 268, w - 56, 1, 0, "#ffffff", opacity=0.12),
        card_header(label_result, x + 28, y + 314, theme["accent"]),
    ]
    yy = y + 346
    for outcome in copy["outcomes"]:
        parts += [
            rect(x + 28, yy, w - 56, 58, 18, "#1f2937", theme["accent"]),
            multiline(x + 48, yy + 24, outcome, lang, 18 if lang == "ko" else 29, 18, 14, 760, "#dbeafe", 2),
        ]
        yy += 76
    parts += [
        pill(x + 28, y + h - 72, 116, "Mobile UI", theme["accent"], "#07111f"),
        pill(x + 158, y + h - 72, 116, "UX QA", "#26364d", "#dbeafe"),
    ]
    return "\n".join(parts)


def insight_panel(item: dict[str, Any], copy: dict[str, Any], theme: dict[str, str], lang: str) -> str:
    x, y, w, h = 820, 58, 332, 644
    labels = {
        "ko": ("시각 구성", "상태 대응", "품질 게이트", "보이는 화면 기준"),
        "en": ("Visual composition", "State handling", "Quality gate", "Visible UI first"),
    }[lang]
    states = localize(item["states"], lang)[:5]
    components = localize(item["components"], lang)[:4]
    parts = [
        rect(x, y, w, h, 30, "#101827", "#ffffff", opacity=None),
        card_header(labels[0], x + 28, y + 48, theme["accent"]),
        multiline(x + 28, y + 86, labels[3], lang, 18 if lang == "ko" else 26, 28, 24, 900, "#ffffff", 2),
    ]
    yy = y + 154
    for line in copy["composition"]:
        parts += [rect(x + 28, yy, w - 56, 48, 16, "#172033", "#27364f"), text(x + 46, yy + 30, line, 13, 760, "#dbeafe")]
        yy += 60
    parts += [card_header(labels[1], x + 28, yy + 14, theme["accent"])]
    yy += 44
    for state in states:
        parts.append(pill(x + 28, yy, min(w - 56, 96 + len(str(state)) * 7), str(state), "#1f2937", "#e5f7ff", 11))
        yy += 38
    parts += [card_header(labels[2], x + 28, y + h - 138, theme["accent"])]
    qa_lines = ["no overlap", "no cropped text", "metadata outside app UI"] if lang == "en" else ["겹침 없음", "텍스트 잘림 없음", "메타데이터는 앱 밖에"]
    qy = y + h - 104
    for line in qa_lines:
        parts += [circle(x + 34, qy - 5, 4, theme["accent"]), text(x + 48, qy, line, 13, 800, "#dbeafe")]
        qy += 28
    # Keep component inventory visible but outside the phone, so the phone remains a real UI preview.
    comp_text = " · ".join(str(c) for c in components[:3])
    parts.append(multiline(x + 28, y + h - 18, comp_text, lang, 24 if lang == "ko" else 32, 16, 11, 650, "#94a3b8", 1))
    return "\n".join(parts)


def render_svg(item: dict[str, Any], lang: str) -> str:
    item_id = item["id"]
    theme = THEMES[item_id]
    copy = SCENARIO_COPY[item_id][lang]
    title_value = localize(item["title"], lang)
    renderer = PHONE_RENDERERS[item_id]
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{CANVAS_W}" height="{CANVAS_H}" viewBox="0 0 {CANVAS_W} {CANVAS_H}" role="img" aria-labelledby="title desc" data-template="{TEMPLATE_ID}" data-generated-by="{GENERATED_BY}">
  <title id="title">{escape(title_value)} prompt to generated mobile UI preview</title>
  <desc id="desc">Generated from a shared visual composition template: prompt, mobile UI screen, state handling, and rendered QA guidance.</desc>
  <metadata>{escape(GENERATED_BY)} · {TEMPLATE_ID}</metadata>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#050814"/><stop offset=".55" stop-color="#0f172a"/><stop offset="1" stop-color="#111827"/></linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="22" stdDeviation="24" flood-color="#000" flood-opacity=".30"/></filter>
    <style>text{{font-family:-apple-system,BlinkMacSystemFont,'Pretendard','Noto Sans KR','Segoe UI',sans-serif}} .card{{filter:url(#shadow)}}</style>
  </defs>
  <rect width="{CANVAS_W}" height="{CANVAS_H}" rx="44" fill="url(#bg)"/>
  {circle(1064, 92, 154, theme['accent'], 0.14)}
  {circle(614, 720, 214, theme['accent'], 0.08)}
  <g class="card">{prompt_panel(item, copy, theme, lang)}</g>
  <g class="card" data-phone-template="{escape(item_id)}">{renderer(copy, theme, lang)}</g>
  <g class="card">{insight_panel(item, copy, theme, lang)}</g>
</svg>'''


def main() -> None:
    data = load_site_data()
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    written = []
    for item in data["skillOutputs"]:
        for lang in ("en", "ko"):
            svg = render_svg(item, lang)
            path = OUT_DIR / f"{item['id']}-{lang}.svg"
            path.write_text(svg, encoding="utf-8")
            ET.parse(path)
            written.append(path.relative_to(ROOT))
    print(f"generated {len(written)} SVG previews with {TEMPLATE_ID}")
    for path in written:
        print(path)


if __name__ == "__main__":
    main()
