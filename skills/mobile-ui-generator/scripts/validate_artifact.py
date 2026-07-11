#!/usr/bin/env python3
"""Validate a generated platform artifact manifest and its source bundle."""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from pathlib import Path

PLATFORMS = {
    "html-css": {"files": {".html", ".css", ".js"}, "required": {".html", ".css"}},
    "react-native": {"files": {".tsx", ".ts", ".json"}, "required": {".tsx"}},
    "flutter": {"files": {".dart"}, "required": {".dart"}},
    "swiftui": {"files": {".swift"}, "required": {".swift"}},
}
BAD_MARKERS = re.compile(r"(?:TODO|TBD|FIXME|lorem ipsum|<YOUR[_ -]|\{\{[^}]+\}\}|\.\.\.)", re.I)


def fail(errors: list[str], field: str, message: str) -> None:
    errors.append(f"{field}: {message}")


def load_manifest(path: Path) -> tuple[dict, Path, list[str]]:
    errors: list[str] = []
    try: data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc: return {}, path.parent, [f"manifest: {exc}"]
    if not isinstance(data, dict): return {}, path.parent, ["manifest: expected object"]
    base = path.parent
    if isinstance(data.get("artifact_root"), str): base = (path.parent / data["artifact_root"]).resolve()
    return data, base, errors


def validate(manifest_path: Path, spec_path: Path | None = None) -> list[str]:
    manifest, base, errors = load_manifest(manifest_path)
    if not manifest: return errors
    platform = manifest.get("platform")
    if platform not in PLATFORMS: fail(errors, "platform", "must be html-css, react-native, flutter, or swiftui")
    for field in ("artifact_id", "spec_id", "skill_version", "generated_by"):
        if not isinstance(manifest.get(field), str) or not manifest[field].strip(): fail(errors, field, "required non-empty string")
    if manifest.get("generated_by") != "mobile-ui-generator": fail(errors, "generated_by", "must be mobile-ui-generator")
    sources = manifest.get("source_files")
    if not isinstance(sources, list) or not sources: fail(errors, "source_files", "must be a non-empty list")
    seen: set[str] = set()
    hashes: list[str] = []
    suffixes: set[str] = set()
    for index, relative in enumerate(sources if isinstance(sources, list) else []):
        field = f"source_files[{index}]"
        if not isinstance(relative, str) or not relative or Path(relative).is_absolute() or ".." in Path(relative).parts:
            fail(errors, field, "must be a relative path inside artifact root")
            continue
        if relative in seen: fail(errors, field, "duplicate source path")
        seen.add(relative)
        source = (base / relative).resolve()
        try: source.relative_to(base.resolve())
        except ValueError: fail(errors, field, "resolves outside artifact root"); continue
        if not source.is_file(): fail(errors, field, "file does not exist"); continue
        suffixes.add(source.suffix.lower())
        text = source.read_text(encoding="utf-8")
        if BAD_MARKERS.search(text): fail(errors, field, "contains an unresolved placeholder or omitted implementation")
        hashes.append(hashlib.sha256(source.read_bytes()).hexdigest())
    if platform in PLATFORMS:
        expected = PLATFORMS[platform]
        if not expected["required"].issubset(suffixes): fail(errors, "source_files", f"missing required source type(s): {sorted(expected['required'] - suffixes)}")
        if any(suffix not in expected["files"] for suffix in suffixes): fail(errors, "source_files", f"unsupported source type for {platform}")
    declared_hash = manifest.get("source_hash")
    actual_hash = hashlib.sha256("\n".join(sorted(hashes)).encode()).hexdigest() if hashes else None
    if declared_hash is not None and declared_hash != actual_hash: fail(errors, "source_hash", "does not match source files")
    if spec_path:
        try: spec = json.loads(spec_path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as exc: fail(errors, "spec", str(exc))
        else:
            if isinstance(spec, dict) and manifest.get("spec_id") != spec.get("id"): fail(errors, "spec_id", "does not match canonical spec id")
    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("artifact", type=Path)
    parser.add_argument("--spec", type=Path)
    parser.add_argument("--json", action="store_true", dest="as_json")
    args = parser.parse_args()
    errors = validate(args.artifact, args.spec)
    result = {"valid": not errors, "errors": errors}
    if args.as_json: print(json.dumps(result, indent=2))
    elif errors:
        print("Artifact validation failed", file=sys.stderr); print("\n".join(errors), file=sys.stderr)
    else: print("Artifact validation passed")
    return 1 if errors else 0


if __name__ == "__main__": raise SystemExit(main())
