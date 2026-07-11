# Mobile UI Generator

Mobile UI Generator turns a screen request into one numeric canonical spec and
complete source for HTML/CSS, React Native, Flutter, and SwiftUI. The included
proof set is responsive, bilingual, fixture-only, and statically verifiable.

[Showcase](https://jinyoung89.github.io/mobile-ui-generator-skill/) ·
[한국어](README.ko.md) ·
[Skill instructions](skills/mobile-ui-generator/SKILL.md) ·
[Canonical schema](skills/mobile-ui-generator/schemas/mobile-ui-spec.schema.json)

## What you get

- A strict JSON spec for layout, safe areas, states, interactions, localization,
  accessibility, and platform mappings.
- Complete HTML/CSS, React Native, Flutter, and SwiftUI source derived from that
  spec, with local fixtures and no required API.
- Numeric layout tokens for 320, 390, and 430 px reference widths.
- Static validation evidence, source hashes, canonical IR, and public provenance.
- A generated website with responsive previews and inspectable code tabs for all
  four targets.

## Five proof examples

| Example | Preview | Canonical artifacts |
|---|---|---|
| Fintech signup | [Phone verification](https://jinyoung89.github.io/mobile-ui-generator-skill/examples/fintech-signup/) | [Source and spec](examples/proof/fintech-signup/) |
| Commerce checkout | [Address and payment review](https://jinyoung89.github.io/mobile-ui-generator-skill/examples/commerce-checkout-address/) | [Source and spec](examples/proof/commerce-checkout/) |
| Mobility booking | [Map and ride booking](https://jinyoung89.github.io/mobile-ui-generator-skill/examples/mobility-map-booking/) | [Source and spec](examples/proof/mobility-map-booking/) |
| Social feed | [Community feed](https://jinyoung89.github.io/mobile-ui-generator-skill/examples/social-feed/) | [Source and spec](examples/proof/social-feed/) |
| Messenger chat | [Conversation and composer](https://jinyoung89.github.io/mobile-ui-generator-skill/examples/messenger-chat/) | [Source and spec](examples/proof/messenger-chat/) |

Each proof directory contains the request, canonical `spec.json`, compiled IR,
four source targets, public provenance, and static verification results. The
[showcase](https://jinyoung89.github.io/mobile-ui-generator-skill/) presents the
same artifacts as responsive previews with HTML/CSS, React Native, Flutter, and
SwiftUI code tabs.

## Install

```bash
git clone https://github.com/jinyoung89/mobile-ui-generator-skill.git
cp -R mobile-ui-generator-skill/skills/mobile-ui-generator "$CODEX_HOME/skills/"
```

## Use

Ask an agent to use the installed skill and name the product job, states,
language, viewport range, and target platforms:

```text
Create a checkout screen for 320–430 px widths. Include empty, loading,
error, and success states. Return HTML/CSS, React Native, Flutter, and SwiftUI.
```

For a new spec, start from
[`templates/mobile-ui-spec.json`](skills/mobile-ui-generator/templates/mobile-ui-spec.json)
and validate it with the skill-local script:

```bash
python3 skills/mobile-ui-generator/scripts/validate_spec.py path/to/spec.json
```

## Canonical generation and static verification

The JSON spec is the source of truth. Platform source, responsive preview,
compiled IR, hashes, and provenance are generated from it; platform-specific
values do not become a second design contract.

Repository checks:

```bash
npm install
npm test -- tooling/test/proof-set.test.ts
npm run typecheck
python3 scripts/validate_patterns.py
python3 scripts/validate_site.py
npm run validate:boundary -- examples/proof
```

The first-release proof claim is deliberately static: canonical specs validate,
generated source is reproducible, files and hashes agree, and the public boundary
passes. Native build, native run, device/simulator execution, and native capture
are **not claimed and are not required** for this proof set.

## Privacy boundary

Public artifacts contain generalized guidance, synthetic local fixtures, and
repository-generated outputs only. The boundary checker rejects private paths,
credentials, source-identifying material, unsupported links, and unsafe files.
Source screenshots, private acquisition data, and hidden provenance are not
published.

## Repository map

```text
skills/mobile-ui-generator/   # installable skill, schema, templates, references
examples/proof/               # five canonical specs and four-target source sets
tooling/                      # compiler, generators, validators, and tests
site/                         # generated showcase source
docs/                         # published static site
```

## License

MIT
