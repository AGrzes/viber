# Research Notes: Wrapper CLI Refactor for Viber Orchestration

## Decision 1: Default image profile naming
- **Decision**: Treat the default image profile name as `default` and use it when no image is specified.
- **Rationale**: Matches the requirement for a named default without extra flags and keeps behavior explicit.
- **Alternatives considered**: Optional boolean flag or config-only default (rejected for less predictable UX).

## Decision 2: Podman user identity preservation
- **Decision**: Use `--userns=keep-id` and `--user UID:GID` on `podman run`.
- **Rationale**: Ensures file ownership aligns with the host user and avoids root-owned artifacts.
- **Alternatives considered**: Only `--user` (misses user namespace mapping), or rely on Podman defaults.

## Decision 3: Auth file mount target
- **Decision**: Mount `${HOME}/.codex/auth.json` to `/workdir/.codex/auth.json` when present.
- **Rationale**: Keeps the auth file in the working directory tree expected by agents.
- **Alternatives considered**: Mount to `/root/.codex/auth.json` (inconsistent with /workdir workspace).

## Decision 4: Config path environment variables
- **Decision**: Export `VIBER_PROJECT_CONFIG` and `VIBER_GLOBAL_CONFIG` for resolved config paths; set `CODEX_HOME=/workdir/.codex` when auth.json is mounted.
- **Rationale**: Explicit environment variables make downstream tools deterministic and discoverable.
- **Alternatives considered**: No env injection (less discoverable), generic names (risk collisions).

## Decision 5: Deterministic build and test commands
- **Decision**: Use `pnpm install`, `pnpm --filter viber-cli build` (tsc), `pnpm --filter viber-cli test` (vitest).
- **Rationale**: Deterministic toolchain aligns with constitution and monorepo conventions.
- **Alternatives considered**: ad-hoc node invocations or LLM-guided edits (rejected).
