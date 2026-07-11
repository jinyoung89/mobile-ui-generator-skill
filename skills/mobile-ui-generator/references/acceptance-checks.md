# Acceptance checks

## Source gate

Run `validate_spec.py` and `validate_artifact.py`. Reject unresolved template
markers, TODO/TBD text, omitted sections, placeholder imports, external network
calls, missing fixture states, missing provenance, and platform code that cannot
be parsed. Every action outcome must resolve to a local state, screen, modal, or
fixture result.

An implementation or showcase bundle passes this gate only when it includes
complete HTML/CSS, React Native, Flutter, and SwiftUI source from the same
canonical spec. Every target includes its fixture and support files; comments,
snippets, and ellipses do not count as an implementation.

## Build and interaction gate (first-release static contract)

- HTML/CSS: parse HTML, CSS, and JavaScript; reject broken local references and
  unresolved imports.
- React Native: format and statically parse/type-check the complete screen and
  fixture modules when the checker is available; otherwise run the repository
  source validator and record the unavailable checker without claiming it ran.
- Flutter: format and statically inspect the complete Dart screen and fixture
  modules for required constructs and canonical numeric values.
- SwiftUI: format or parse the complete Swift screen and fixture modules and run
  the repository source-contract validator.
- Cross-target: compare canonical numeric tokens, content fixtures, state names,
  accessibility labels, action outcomes, safe-area behavior, and responsive
  rules. Any unexplained drift blocks the bundle.

Use local fixture data only. A validator that silently skips a declared source
file or target fails this gate.

## Render gate (authoritative HTML responsive preview)

Render the authoritative HTML/CSS source at compact, standard, and large widths.
Exercise every state required by the selected pattern, plus short-keyboard,
large-text, and long-copy profiles when applicable. Review the rendered output
and the complete HTML, CSS, and runtime files together.

Assert no horizontal overflow, unexpected overlap, text clipping, broken shared
edges, unsafe fixed regions, or touch targets below policy. Check loading, empty,
error, success, disabled, permission, keyboard, recovery, and destructive states
required by the pattern matrix. High-risk actions retain explicit consequence
copy, confirmation, cancellation, and recovery paths.

## Native integration evidence — optional downstream

Native dependency installation, build, test, simulator/emulator or device run,
and native screenshot capture are optional downstream integration steps. Run
them only when explicitly requested and the target toolchain is available. Keep
their results separate from first-release verification and label unrun evidence
as `not requested` or `not available`, never `passed`.

The first-release bundle neither requires nor claims a native build, install,
launch, simulator/emulator run, device run, or native capture.

## Showcase gate

Showcase mode publishes only an immutable bundle whose manifest points to the
same spec ID, source hashes, platform, profile, and passing verification record.
Code tabs and previews must be loaded from that bundle. If one target or state
fails, block the whole example and revise the shared rule.
