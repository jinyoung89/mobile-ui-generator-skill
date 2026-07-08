#!/usr/bin/env python3
"""Validate public-safe mobile UI skill reference coverage.

Checks the actual skill package, not just the website:
- SKILL.md is design-first and links every required reference file.
- Detailed mobile pattern library covers expected pattern IDs.
- Design references cover principles, style taxonomy, domain playbooks,
  component/state guidance, and quality review.
- Public files avoid source-specific collection terms.
"""
from __future__ import annotations

from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
SKILL_DIR = ROOT / "skills/mobile-ui-generator"
SKILL = SKILL_DIR / "SKILL.md"
REF_DIR = SKILL_DIR / "references"
PATTERN_REF = REF_DIR / "mobile-pattern-library.md"

REQUIRED_REFERENCES = {
    "evidence-and-sanitization.md": [
        "Public-safe statement",
        "What must stay private",
        "Public conversion pipeline",
        "Evidence levels",
        "Update checklist",
    ],
    "design-principles.md": [
        "Decision order",
        "Visual hierarchy",
        "Typography system",
        "Color system",
        "Accessibility baseline",
    ],
    "mobile-pattern-library.md": [
        "Pattern anatomy",
        "phone_verification",
        "checkout",
        "bottom_sheet_map",
        "analytics_report",
    ],
    "visual-style-taxonomy.md": [
        "Style selection rule",
        "minimal_swiss",
        "glass_layered",
        "ai_native",
        "Visual anti-patterns",
    ],
    "domain-playbooks.md": [
        "Fintech / banking / wallet",
        "Commerce / marketplace / store",
        "Healthcare / clinic / booking",
        "IoT / smart home / device control",
        "Domain selection checklist",
    ],
    "component-state-checklist.md": [
        "Global state matrix",
        "Top app bar",
        "Bottom sheet",
        "CTA rules",
        "Handoff checklist",
    ],
    "quality-review-checklist.md": [
        "Review levels",
        "Product and pattern fit",
        "State coverage",
        "Output quality gate",
        "Final self-check",
    ],
}

EXPECTED_PATTERN_IDS = [
    "splash",
    "onboarding_intro",
    "preference_setup",
    "permission_request",
    "tutorial_coachmark",
    "login",
    "signup",
    "phone_verification",
    "identity_verification",
    "terms_agreement",
    "account_cancellation",
    "main_home",
    "bottom_tabs",
    "my_page",
    "search",
    "filter_sort",
    "PLP",
    "PDP",
    "bookmark_wishlist",
    "cart",
    "checkout",
    "simple_payment",
    "coupon_points",
    "review",
    "review_write",
    "transaction_history",
    "transfer",
    "map_location",
    "bottom_sheet_map",
    "reservation_booking",
    "delivery_tracking",
    "feed",
    "chat",
    "write_post",
    "media_capture",
    "gamification",
    "ranking",
    "points_rewards",
    "customer_support",
    "faq",
    "empty_state",
    "error_state",
    "application_request_flow",
    "generate_create_flow",
    "lookup_query_flow",
    "edit_update_flow",
    "recommendation",
    "curation_feed",
    "cross_sell_upsell",
    "invite_referral",
    "gift_send_receive",
    "benefits_hub",
    "ai_assistant_panel",
    "chatbot_support",
    "audio_recording",
    "voice_interaction",
    "device_control",
    "analytics_report",
]

EXPECTED_DOMAIN_MODIFIERS = [
    "pet_care_domain",
    "real_estate_domain",
    "beauty_wellness_domain",
    "dating_domain",
    "mental_health_domain",
    "recruiting_domain",
    "parenting_childcare_domain",
    "music_audio_domain",
    "fitness_health_domain",
    "business_tool_domain",
]

# Split terms so public code search does not surface source/collection phrases as project copy.
BLOCKED_PUBLIC_TERMS = [
    "ui" + "bowl",
    "crawl" + "er",
    "connect" + "or",
    "raw" + " screenshots",
    "private" + " corpus",
    "reference" + " corpus",
    "private" + " datasets",
]

SKILL_MUST_CONTAIN = [
    "evidence-and-sanitization.md",
    "design-principles.md",
    "mobile-pattern-library.md",
    "visual-style-taxonomy.md",
    "domain-playbooks.md",
    "component-state-checklist.md",
    "quality-review-checklist.md",
    "private/local analysis of curated mobile UI screens",
    "Start from product intent",
    "Build the pattern system before writing copy",
    "Language mode is a copy/output setting",
    "quality_gate",
]


def fail(message: str) -> None:
    print(f"FAIL: {message}", file=sys.stderr)
    raise SystemExit(1)


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def main() -> None:
    if not SKILL.exists():
        fail("missing SKILL.md")
    if not PATTERN_REF.exists():
        fail("missing mobile pattern reference")

    skill = read(SKILL)
    for needle in SKILL_MUST_CONTAIN:
        if needle not in skill:
            fail(f"SKILL.md missing {needle!r}")
    if "Choose language mode first" in skill:
        fail("SKILL.md regressed to language-first flow")

    reference_texts = {}
    for rel, needles in REQUIRED_REFERENCES.items():
        path = REF_DIR / rel
        if not path.exists():
            fail(f"missing reference file: {rel}")
        text = read(path)
        reference_texts[rel] = text
        for needle in needles:
            if needle not in text:
                fail(f"{rel} missing required content {needle!r}")

    pattern_ref = reference_texts["mobile-pattern-library.md"]
    pattern_ids = re.findall(r"^### `([^`]+)`", pattern_ref, flags=re.M)
    if len(pattern_ids) < 60:
        fail(f"expected at least 60 detailed patterns, got {len(pattern_ids)}")

    missing_patterns = [pid for pid in EXPECTED_PATTERN_IDS if f"### `{pid}`" not in pattern_ref]
    if missing_patterns:
        fail(f"missing pattern IDs: {missing_patterns}")

    missing_domains = [modifier for modifier in EXPECTED_DOMAIN_MODIFIERS if modifier not in pattern_ref]
    if missing_domains:
        fail(f"missing domain modifiers: {missing_domains}")

    for required in [
        "required_components",
        "states",
        "interactions",
        "copy_requirements",
        "accessibility",
        "anti_patterns",
    ]:
        if required not in pattern_ref:
            fail(f"pattern reference missing field {required}")

    all_public_text = "\n".join([skill, *reference_texts.values()]).lower()
    for term in BLOCKED_PUBLIC_TERMS:
        if term.lower() in all_public_text:
            fail(f"blocked public term found: {term}")

    print(
        "pattern validation passed: "
        f"{len(pattern_ids)} patterns, "
        f"{len(EXPECTED_DOMAIN_MODIFIERS)} domain modifiers, "
        f"{len(REQUIRED_REFERENCES)} reference files"
    )


if __name__ == "__main__":
    main()
