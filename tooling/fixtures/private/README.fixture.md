# Synthetic private observation fixture

`observations.json` is deliberately fabricated test data. It is not derived from screenshots,
providers, applications, reviewers, users, or any other source. Its URLs use the reserved
`.test` domain, paths do not exist, identities are fictional, asset pointers are fake, and all
credential-like values are inert placeholders.

The fixture exercises fields that must never cross the one-way public export boundary. A real
release export requires an explicit private JSON file outside the repository and an explicit,
safely named staging directory:

```sh
npm run export:public-knowledge -- \
  --input /absolute/external/path/private-observations.json \
  --output /absolute/path/public-knowledge-staging \
  --mode release
```

The conservative release threshold is five independent sample groups. `--min-samples` may raise
that threshold but cannot lower it in release mode. Below-threshold groups are omitted, so the
export never invents observed statistics. The command performs no network access and replaces
only the selected staging directory after both input and output schema validation succeed.

For local fixture-only verification, use `--mode fixture`; never use fixture mode for release
artifacts.
