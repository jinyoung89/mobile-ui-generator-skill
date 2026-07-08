#!/usr/bin/env python3
"""Validate public-safe mobile pattern coverage.

This script checks that the skill reference contains the generic pattern IDs we
expect the public skill to support. It intentionally avoids any source-specific
collection details.
"""
from __future__ import annotations

from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
REFERENCE = ROOT / "skills/mobile-ui-generator/references/mobile-pattern-library.md"
SKILL = ROOT / "skills/mobile-ui-generator/SKILL.md"

EXPECTED_PATTERN_IDS = [
    # acquisition/auth
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
    # home/search/detail
    "main_home",
    "bottom_tabs",
    "my_page",
    "search",
    "filter_sort",
    "PLP",
    "PDP",
    "bookmark_wishlist",
    # commerce/finance/booking
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
    # social/support/engagement
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
    # expansion patterns
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

# Keep these split so public code search does not surface source or collection terms
# as project copy. The joined values are used only at validation runtime.
BLOCKED_PUBLIC_TERMS = [
    "ui" + "bowl",
    "crawl" + "er",
    "connect" + "or",
    "raw" + " screenshots",
    "private" + " corpus",
    "reference" + " corpus",
    "private" + " datasets",
]


def fail(message: str) -> None:
    print(f"FAIL: {message}", file=sys.stderr)
    raise SystemExit(1)


def main() -> None:
    if not REFERENCE.exists():
        fail(f"missing {REFERENCE.relative_to(ROOT)}")
    reference = REFERENCE.read_text(encoding="utf-8")
    skill = SKILL.read_text(encoding="utf-8")

    pattern_ids = re.findall(r"^### `([^`]+)`", reference, flags=re.M)
    if len(pattern_ids) < 55:
        fail(f"expected at least 55 detailed patterns, got {len(pattern_ids)}")

    missing_patterns = [pid for pid in EXPECTED_PATTERN_IDS if f"### `{pid}`" not in reference]
    if missing_patterns:
        fail(f"missing pattern IDs: {missing_patterns}")

    missing_domains = [modifier for modifier in EXPECTED_DOMAIN_MODIFIERS if modifier not in reference]
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
        if required not in reference:
            fail(f"reference missing field {required}")

    if "references/mobile-pattern-library.md" not in skill:
        fail("SKILL.md must link the pattern reference")

    public_text = "\n".join([reference, skill]).lower()
    for term in BLOCKED_PUBLIC_TERMS:
        if term.lower() in public_text:
            fail(f"blocked public term found: {term}")

    print(f"pattern validation passed: {len(pattern_ids)} patterns, {len(EXPECTED_DOMAIN_MODIFIERS)} domain modifiers")


if __name__ == "__main__":
    main()
