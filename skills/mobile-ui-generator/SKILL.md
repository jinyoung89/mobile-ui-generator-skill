---
name: mobile-ui-generator
description: Use when a mobile screen or flow needs pattern-aware UI design, a numeric implementation spec, or complete HTML/CSS, React Native, Flutter, or SwiftUI output that must survive responsive, accessibility, and rendered-quality checks.
license: MIT
metadata:
  short-description: Generate numeric, four-target mobile UI artifacts
---

# Mobile UI Generator

## Purpose

Treat a mobile UI as a small, testable product surface. Start from the user's job,
app category, UI pattern, risk, states, and requested platform; then derive every
visible output from one versioned canonical mobile UI spec. Never invent a second
set of spacing or copy values for a platform or a website preview.

`Internal metadata vs user-facing UI`: category labels, pattern IDs, provenance,
and validation notes are implementation metadata. Keep them out of visible copy
unless the user explicitly asks to inspect them.

## Workflow

1. **Route the request.** Read [request-routing.md](references/request-routing.md).
   Classify `app_category`, 2–5 `ui_patterns`, risk, target states, language,
   viewport range, and requested targets. For a named category or pattern, search
   [taxonomy.md](references/taxonomy.md), [pattern-catalog.md](references/pattern-catalog.md),
   and [domain-guides.md](references/domain-guides.md).
2. **Choose the layout contract.** Read [layout-foundations.md](references/layout-foundations.md)
   and [responsive-and-safe-area.md](references/responsive-and-safe-area.md). Record
   numeric insets, gaps, control heights, type roles, safe-area policy, keyboard
   behavior, responsive rules, and fixed-region clearance before writing markup.
3. **Create the canonical spec.** Start from
   `schemas/mobile-ui-spec.schema.json` or `templates/mobile-ui-spec.json` and fill
   all required fields. Use fixture data for every local action and state. Validate
   it with:

   ```bash
   python3 scripts/validate_spec.py path/to/spec.json
   ```

   The spec is the source of truth for HTML/CSS, React Native, Flutter, and
   SwiftUI. Network services, real authentication, payment execution, push, and
   production backends are outside the runnable contract.
4. **Generate complete four-target source.** An implementation or
   `showcase/all-platforms` delivery must include complete HTML/CSS, React Native, Flutter, and SwiftUI
   source derived from the same spec. Include fixture modules and every file
   required to review or integrate each target; never replace omitted code with
   comments or placeholders. A design-only brief may stop at the canonical spec.
   Use [accessibility.md](references/accessibility.md) while mapping controls.
5. **Run the first-release verification.** Apply source/static checks to all four
   targets, then render the HTML/CSS target at compact, standard, and large widths.
   Review both the responsive preview and every source file using
   [acceptance-checks.md](references/acceptance-checks.md). A passing bundle must
   include safe-area behavior, required local fixture states, keyboard or scroll
   handling where relevant, and no unresolved placeholders. Validate each target
   manifest with:

   ```bash
   python3 scripts/validate_artifact.py artifact.json --spec path/to/spec.json
   ```

6. **Treat native execution as optional downstream integration.** Native builds,
   dependency installation, simulator/emulator or device runs, and native capture
   happen only when the user explicitly requests them and the toolchain is
   available. Report that evidence separately. Do not block or claim it as part
   of first-release verification.
7. **Revise from failures.** Fix the canonical spec, mapping, or shared template
   when a check fails. Do not hand-edit a single preview to hide a clipping,
   overflow, contrast, state, or parity failure. Re-run spec, source/static, and
   HTML rendered checks after every revision.

## Search and output

Use the public, local reference search before loading every document:

```bash
python3 scripts/search.py "commerce checkout loading" --area all -n 6
python3 scripts/search.py --pattern checkout -f json
python3 scripts/search.py --list-areas
```

Search results are generalized design guidance. They are not a license to include
source screenshots, collection paths, credentials, or hidden provenance in an
artifact. Keep a concise implementation note with the returned spec and targets:
category/pattern choice, numeric tokens, required states, platform substitutions,
and checks run.

## References

- [request-routing.md](references/request-routing.md) — request classification and delivery modes.
- [taxonomy.md](references/taxonomy.md) — category and pattern filters.
- [pattern-catalog.md](references/pattern-catalog.md) — pattern anatomy and state expectations.
- [domain-guides.md](references/domain-guides.md) — domain-specific trust and content guidance.
- [layout-foundations.md](references/layout-foundations.md) — numeric grid, tokens, and typography.
- [responsive-and-safe-area.md](references/responsive-and-safe-area.md) — width, inset, scroll, and keyboard rules.
- [accessibility.md](references/accessibility.md) — contrast, semantics, target size, and Dynamic Type.
- [acceptance-checks.md](references/acceptance-checks.md) — source/static, HTML preview, code-review, and showcase gates.

The earlier public references remain available for deeper pattern examples and
quality checklists: `design-principles.md`, `visual-composition-contract.md`,
`mobile-pattern-library.md`, `component-state-checklist.md`,
`visual-style-taxonomy.md`, `domain-playbooks.md`, and
`quality-review-checklist.md`. The evidence, taxonomy, and analysis companions
are `evidence-and-sanitization.md`, `taxonomy-filter-model.md`, and
`pattern-analysis-insights.md`. Load only what the request needs.

Compatibility anchors for existing installations: Start from app type and UI pattern fit; Build the pattern system before writing copy; Language mode is a copy/output setting; `app_type`, `ui_patterns`, and `quality_gate` remain stable handoff keys. Public guidance may be informed by private/local analysis of curated mobile UI screens, but only generalized rules belong in this package.
Legacy handoff templates remain `templates/mobile-ui-brief.md`,
`templates/mobile-ui-spec.json`, and `templates/pattern-observation.md`; use the
canonical spec template for new implementation work.
