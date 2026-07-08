<p align="center">
  <img src="docs/assets/readme-banner.svg" alt="Mobile UI Generator Skill" width="100%" />
</p>

# Mobile UI Generator Skill

<p align="center">
  <em>Reference-backed mobile UI briefs from a private, authorized mobile UI corpus.</em>
</p>

<p align="center">
  <a href="https://jinyoung89.github.io/mobile-ui-generator-skill/">Website</a>
  · <a href="skills/mobile-ui-reference-generator/SKILL.md">Skill</a>
  · <a href="examples/briefs/fintech-signup.md">Example brief</a>
</p>

---

## What it is

**Mobile UI Generator Skill** helps agents turn a local reference corpus into structured mobile UI briefs and JSON specs.

Instead of asking an agent to invent a generic signup, checkout, onboarding, or booking screen from memory, the skill uses already-prepared local metadata to:

1. retrieve relevant mobile UI references;
2. infer screen types and product domains;
3. select matching asset cues;
4. compile Markdown + JSON briefs;
5. run quality gates for coverage, relevance, prompt completeness, and asset fit.

No unsolicited image generation is part of this workflow. The output is **structured evidence** for design/code/Figma agents.

## Privacy boundary

This public repository intentionally does **not** include:

- raw mobile screenshots or downloaded media;
- private connector details, API endpoints, or credentials;
- private crawler/connector code;
- generated local datasets under `data/` or `output/`.

Those pieces stay local/private. The public repo is the skill packaging, showcase page, and sanitized examples.

## Current private corpus summary

The local corpus used to validate the skill currently reports:

| Metric | Value |
|---|---:|
| Indexed UI/media rows | **56,665** |
| Apps/services | **349** |
| Pattern groups | **62** |
| Normalized screen types | **45+** |
| Media handled | PNG, JPG, WebP, MP4, SVG, JSON/Lottie-style metadata |

## Install the agent skill

If your agent supports `SKILL.md` installs:

```bash
npx skills add https://github.com/jinyoung89/mobile-ui-generator-skill \
  --skill mobile-ui-reference-generator
```

Or copy this file directly into your agent skills folder:

```text
skills/mobile-ui-reference-generator/SKILL.md
```

## What the skill produces

| Output | Purpose |
|---|---|
| `reference-manifest.jsonl` | local rows with app/category/screen-type/reference metadata |
| `asset-manifest.jsonl` | icons, splash assets, crops, media metadata, color cues |
| `pattern-book.md` | screen-type pattern summary |
| `mobile-ui-brief.md` | reference-backed prompt + code/Figma brief |
| `mobile-ui-brief.json` | machine-readable UI spec |
| `quality-report.md` | integrity, coverage, prompt, and asset relevance scores |

## Screen taxonomy

The taxonomy is grown from observed mobile UI patterns, then normalized into agent-friendly screen types:

| Flow | Screen types |
|---|---|
| Acquisition | `splash`, `onboarding`, `permission` |
| Auth | `login`, `signup`, `identity_verification`, `terms` |
| Commerce | `product_list`, `product_detail`, `cart`, `payment`, `order_complete`, `order_history` |
| Finance | `finance_account`, `transfer`, `investment_portfolio`, `wallet` |
| Social/content | `feed`, `chat`, `notification`, `profile`, `saved_items`, `review_rating` |
| Mobility | `map_location`, `reservation_booking`, `navigation_route`, `payment` |
| Utility | `settings`, `customer_support`, `announcement`, `empty_state` |

## Quality gates

Quality is not the number of screenshots. The skill checks whether references actually help generation:

| Gate | Checks |
|---|---|
| Integrity | files exist, images decode, MP4/SVG/JSON metadata is preserved, duplicates controlled |
| Coverage | app, domain, screen-type, and pattern diversity |
| Relevance | multi-step queries retrieve matching target screens first |
| Asset fit | assets are selected from the same target screen/app before generic fallbacks |
| Brief completeness | reference evidence, asset references, native-mobile constraints, Korean copy guidance, valid JSON spec |

## Example mobile views

The website includes three HTML/CSS mobile views produced from the skill's current brief templates, not from an image generator:

- fintech signup / phone verification;
- commerce product-detail to checkout;
- mobility map booking and payment.

Open the showcase:

```text
https://jinyoung89.github.io/mobile-ui-generator-skill/
```

## Repository layout

```text
skills/mobile-ui-reference-generator/SKILL.md
examples/briefs/                  # public sample briefs
examples/specs/                   # public sample UI specs
docs/index.html                   # static showcase page
docs/assets/                      # public SVG artwork
```

## License

MIT
