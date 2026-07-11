#!/usr/bin/env python3
"""Validate a canonical mobile UI spec without third-party dependencies."""
from __future__ import annotations

import argparse
import json
import math
import re
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
REQUIRED = {
    "schema_version", "id", "request", "classification", "platform_policy",
    "layout", "typography", "colors", "components", "states", "interactions",
    "responsive_rules", "accessibility", "content", "assets_and_fallbacks",
    "fixture_data", "navigation_and_actions", "validation_rules", "focus_and_keyboard",
    "localization", "themes", "capabilities_and_dependencies", "platform_mappings",
    "quality_requirements",
}
PLATFORMS = ("html_css", "react_native", "flutter", "swiftui")
PRECEDENCE = ["safe_area", "fixed_region", "min_max", "content"]
MEASURE_UNITS = {"px", "pt", "dp", "sp", "ratio"}
PLACEHOLDER = re.compile(r"^(?:todo|tbd|pending|unknown|fill.?me|replace.?me)$", re.I)


class Validation:
    def __init__(self) -> None:
        self.errors: list[str] = []

    def error(self, field: str, message: str) -> None:
        self.errors.append(f"{field}: {message}")

    def obj(self, value: Any, field: str) -> dict[str, Any] | None:
        if not isinstance(value, dict):
            self.error(field, "expected object")
            return None
        return value

    def arr(self, value: Any, field: str, minimum: int = 1) -> list[Any] | None:
        if not isinstance(value, list):
            self.error(field, "expected array")
            return None
        if len(value) < minimum:
            self.error(field, f"requires at least {minimum} item(s)")
        return value

    def nonempty(self, value: Any, field: str) -> None:
        if not isinstance(value, str) or not value.strip():
            self.error(field, "expected non-empty string")

    def measure(self, value: Any, field: str, tokens: set[str], allow_content: bool = False) -> None:
        if allow_content and value in {"fill", "content"}:
            return
        row = self.obj(value, field)
        if row is None:
            return
        variants = [key for key in ("value", "token", "formula") if key in row]
        if len(variants) != 1:
            self.error(field, "exactly one of value, token, or formula is required")
            return
        if set(row) - {"value", "unit", "token", "formula", "min", "max"}:
            self.error(field, "unknown measure key")
        if "token" in row:
            if not isinstance(row["token"], str) or row["token"] not in tokens:
                self.error(field, "unresolved token")
            if any(key in row for key in ("unit", "min", "max")):
                self.error(field, "token measure cannot include unit or bounds")
            return
        if "value" in row:
            if not isinstance(row["value"], (int, float)) or isinstance(row["value"], bool) or not math.isfinite(row["value"]):
                self.error(field, "value must be finite number")
            if row.get("unit") not in MEASURE_UNITS:
                self.error(field, "unsupported unit")
            if "min" in row or "max" in row:
                self.error(field, "fixed measure cannot include bounds")
            return
        if not isinstance(row.get("formula"), str) or not re.fullmatch(r"[A-Za-z0-9_ .+*/()%-]+", row["formula"]):
            self.error(field, "unsafe formula")
        if row.get("unit") not in MEASURE_UNITS:
            self.error(field, "unsupported unit")
        if not isinstance(row.get("min"), (int, float)) or not isinstance(row.get("max"), (int, float)):
            self.error(field, "formula requires numeric min and max")
        elif row["min"] > row["max"]:
            self.error(field, "min must not exceed max")

    def run(self, value: Any) -> list[str]:
        root = self.obj(value, "$" )
        if root is None:
            return self.errors
        missing = sorted(REQUIRED - set(root))
        for field in missing:
            self.error(field, "required")
        unknown = sorted(set(root) - REQUIRED)
        for field in unknown:
            self.error(field, "unknown key")
        if root.get("schema_version") != 1:
            self.error("schema_version", "must be 1")
        if not isinstance(root.get("id"), str) or not re.fullmatch(r"[a-z][a-z0-9-]{2,96}", str(root.get("id", ""))):
            self.error("id", "must be lowercase kebab-case")

        request = self.obj(root.get("request"), "request")
        if request:
            for field in ("language", "user_job"): self.nonempty(request.get(field), f"request.{field}")
        classification = self.obj(root.get("classification"), "classification")
        if classification:
            self.nonempty(classification.get("app_category"), "classification.app_category")
            patterns = self.arr(classification.get("ui_patterns"), "classification.ui_patterns")
            if patterns and len(set(patterns)) != len(patterns): self.error("classification.ui_patterns", "must be unique")
            if classification.get("risk_level") not in {"low", "medium", "high"}: self.error("classification.risk_level", "unsupported risk")

        policy = self.obj(root.get("platform_policy"), "platform_policy")
        if policy:
            ref = policy.get("reference_viewport_width")
            span = self.obj(policy.get("supported_width_range"), "platform_policy.supported_width_range")
            if not isinstance(ref, int) or isinstance(ref, bool) or ref < 1: self.error("platform_policy.reference_viewport_width", "must be positive integer")
            if span:
                low, high = span.get("min"), span.get("max")
                if not isinstance(low, int) or not isinstance(high, int) or low < 1 or high < low: self.error("platform_policy.supported_width_range", "invalid range")
                elif isinstance(ref, int) and not (low <= ref <= high): self.error("platform_policy.reference_viewport_width", "must be within range")
            safe = self.obj(policy.get("safe_area"), "platform_policy.safe_area")
            if safe:
                if safe.get("unit") != "px": self.error("platform_policy.safe_area.unit", "canonical unit must be px")
                for key in ("top", "bottom"):
                    if not isinstance(safe.get(key), (int, float)) or safe[key] < 0: self.error(f"platform_policy.safe_area.{key}", "must be non-negative number")
            order = policy.get("constraint_precedence")
            if order != PRECEDENCE: self.error("platform_policy.constraint_precedence", "must be safe_area, fixed_region, min_max, content")
            rounding = self.obj(policy.get("rounding"), "platform_policy.rounding")
            if rounding:
                for platform in PLATFORMS:
                    if rounding.get(platform) not in {"nearest", "floor", "ceil"}: self.error(f"platform_policy.rounding.{platform}", "unsupported rounding")

        layout = self.obj(root.get("layout"), "layout")
        tokens: set[str] = set()
        if layout:
            token_map = self.obj(layout.get("tokens"), "layout.tokens")
            if token_map:
                tokens = set(token_map)
                if not tokens: self.error("layout.tokens", "must not be empty")
                for name, measure in token_map.items(): self.measure(measure, f"layout.tokens.{name}", tokens)
            for field in ("screen_horizontal_inset", "component_gap", "section_gap", "card_padding", "control_height", "corner_radius", "sticky_region_height", "scroll_content_bottom_inset", "max_readable_line_width"):
                self.measure(layout.get(field), f"layout.{field}", tokens)
            grid = self.obj(layout.get("grid"), "layout.grid")
            if grid: self.measure(grid.get("gutter"), "layout.grid.gutter", tokens)
            self.arr(layout.get("alignment_anchors"), "layout.alignment_anchors")
            constraints = self.obj(layout.get("constraints"), "layout.constraints")
            if constraints and constraints.get("precedence") != PRECEDENCE: self.error("layout.constraints.precedence", "must match policy precedence")

        typography = self.obj(root.get("typography"), "typography")
        if typography:
            roles = self.arr(typography.get("roles"), "typography.roles")
            role_ids: set[str] = set()
            for index, role in enumerate(roles or []):
                row = self.obj(role, f"typography.roles[{index}]")
                if not row: continue
                role_id = row.get("id")
                if role_id in role_ids: self.error(f"typography.roles[{index}].id", "duplicate")
                role_ids.add(str(role_id))
                for field in ("font_family", "overflow", "text_scale_policy"): self.nonempty(row.get(field), f"typography.roles[{index}].{field}")
                self.measure(row.get("size"), f"typography.roles[{index}].size", tokens)
                self.measure(row.get("line_height"), f"typography.roles[{index}].line_height", tokens)
                if "letter_spacing" in row: self.measure(row["letter_spacing"], f"typography.roles[{index}].letter_spacing", tokens)
                if not isinstance(row.get("weight"), int) or not 100 <= row["weight"] <= 1000: self.error(f"typography.roles[{index}].weight", "must be 100..1000")
                if not isinstance(row.get("max_lines"), int) or row["max_lines"] < 1: self.error(f"typography.roles[{index}].max_lines", "must be positive integer")

        accessibility = self.obj(root.get("accessibility"), "accessibility")
        if accessibility:
            if not isinstance(accessibility.get("minimum_contrast_ratio"), (int, float)) or accessibility["minimum_contrast_ratio"] < 4.5: self.error("accessibility.minimum_contrast_ratio", "must be at least 4.5")
            target = self.obj(accessibility.get("minimum_touch_target"), "accessibility.minimum_touch_target")
            if target and (target.get("width", 0) < 44 or target.get("height", 0) < 44): self.error("accessibility.minimum_touch_target", "must be at least 44x44")

        responsive = self.arr(root.get("responsive_rules"), "responsive_rules", 3)
        if responsive:
            ranges = []
            for index, rule in enumerate(responsive):
                row = self.obj(rule, f"responsive_rules[{index}]")
                width = self.obj(row.get("width"), f"responsive_rules[{index}].width") if row else None
                if width: ranges.append((width.get("min"), width.get("max")))
                if row and row.get("no_horizontal_overflow") is not True: self.error(f"responsive_rules[{index}].no_horizontal_overflow", "must be true")
                if row and row.get("fixed_regions_preserve_inset") is not True: self.error(f"responsive_rules[{index}].fixed_regions_preserve_inset", "must be true")
            if ranges and policy and isinstance(policy.get("supported_width_range"), dict):
                low = policy["supported_width_range"].get("min")
                if low not in [item[0] for item in ranges]: self.error("responsive_rules", "must cover supported minimum")

        capabilities = self.obj(root.get("capabilities_and_dependencies"), "capabilities_and_dependencies")
        if capabilities and capabilities.get("fixture_only") is not True: self.error("capabilities_and_dependencies.fixture_only", "must be true")
        quality = self.obj(root.get("quality_requirements"), "quality_requirements")
        if quality:
            for key in ("numeric_spec_validated", "all_states_fixture_backed", "platform_parity_report"):
                if quality.get(key) is not True: self.error(f"quality_requirements.{key}", "must be true")
        mappings = self.obj(root.get("platform_mappings"), "platform_mappings")
        if mappings:
            for platform in PLATFORMS:
                row = self.obj(mappings.get(platform), f"platform_mappings.{platform}")
                if row and row.get("native_substitutions_explicit") is not True: self.error(f"platform_mappings.{platform}.native_substitutions_explicit", "must be true")
        return self.errors


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("spec", type=Path)
    parser.add_argument("--json", action="store_true", dest="as_json")
    args = parser.parse_args()
    try:
        value = json.loads(args.spec.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        errors = [f"input: {exc}"]
    else:
        errors = Validation().run(value)
    if args.as_json:
        print(json.dumps({"valid": not errors, "errors": errors}, ensure_ascii=False, indent=2))
    elif errors:
        print("Spec validation failed", file=sys.stderr)
        print("\n".join(errors), file=sys.stderr)
    else:
        print("Spec validation passed")
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
