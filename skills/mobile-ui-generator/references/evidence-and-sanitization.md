# Evidence and Sanitization Policy

This skill may be improved from private/local analysis of curated mobile UI reference screens. The public skill should communicate that its design knowledge is pattern-informed and observation-informed, while never revealing where the reference material came from.

## Public-safe statement

Use wording like:

- "distilled from curated mobile UI reference analysis";
- "generalized from observed mobile screen structures";
- "pattern-informed mobile UI guidance";
- "public-safe design patterns derived from private/local observations".

Do not imply that the public repository contains the underlying reference material. It contains only generalized design guidance.

## What must stay private

Do not publish or mention:

- origin site names, provider names, account names, or source brands used only for collection;
- collection URLs, endpoint paths, request details, auth details, or local commands;
- unredacted screen captures, original downloaded files, local manifests, or local file paths;
- per-app traceability that reveals where a specific observation came from;
- any credential, session, or account artifact.

## Public conversion pipeline

Use this sequence when turning local observations into public skill knowledge:

1. **Collect privately.** Keep reference screens, manifests, crops, and local analysis artifacts under ignored local folders.
2. **Analyze privately.** Extract pattern labels, layout traits, component candidates, state examples, color/asset traits, and repeated UI structures.
3. **Aggregate.** Summarize observations by generic pattern ID such as `checkout`, `search`, `bottom_sheet_map`, `review_write`, or `analytics_report`.
4. **Generalize.** Remove app names, origin names, URLs, and exact file paths. Convert findings into reusable design rules.
5. **Publish only the abstraction.** Update public references with pattern anatomy, component inventories, state matrices, visual guidance, and anti-patterns.
6. **Validate.** Run public-leak checks and pattern coverage validation before publishing.

## Evidence levels

When improving a pattern, treat evidence strength explicitly in private notes:

| Level | Meaning | Public use |
|---|---|---|
| `label_only` | Pattern label or category was observed | Use only as backlog/gap signal |
| `metadata` | Pattern plus dimensions, colors, asset/crop candidates | Good for coverage and visual direction |
| `layout_observed` | Repeated layout/component traits were inspected | Good for pattern anatomy |
| `state_observed` | Empty/error/loading/success/permission variants were observed | Good for state matrix |
| `cross_domain` | Same pattern seen across several domains | Good for robust public guidance |

Public files do not need to expose the evidence level, but maintainers should prefer `layout_observed`, `state_observed`, and `cross_domain` before claiming a pattern is mature.

## How to phrase maturity

Good:

```text
This pattern library is distilled from curated mobile UI reference analysis and generalized for public use.
```

Good:

```text
The public references contain reusable pattern guidance, not the underlying reference set.
```

Avoid:

```text
This pattern came from [specific origin/source/app set].
```

Avoid:

```text
See the original screen at [URL/path].
```

## Update checklist

Before publishing a pattern update:

- [ ] Pattern ID is generic.
- [ ] No origin/source names are present.
- [ ] No local paths, URLs, auth details, or collection commands are present.
- [ ] No unredacted screen images are added.
- [ ] The public rule is useful without knowing the source.
- [ ] The pattern has components, states, interactions, accessibility notes, and anti-patterns.
