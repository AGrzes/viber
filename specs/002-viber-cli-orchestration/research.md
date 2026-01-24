# Research Notes: Viber CLI Private Orchestration Framework

## Decision 1: Runtime language and packaging
- **Decision**: Node.js 25 (TypeScript), single CLI package
- **Rationale**: Matches the current runtime, keeps a Node.js CLI workflow, and adds type safety for config and command contracts.
- **Alternatives considered**: JavaScript (fewer build steps but less safety), Python (not aligned with stated preference).

## Decision 2: Configuration format and locations
- **Decision**: JSON config files; project config `.viber.json` in project root; global config `~/.viber/config.json` (local only, no sync).
- **Rationale**: JSON is built-in, avoids extra parsing dependencies, and supports simple CLI generation.
- **Alternatives considered**: YAML or TOML (more human-friendly but adds dependencies and parsing complexity).

## Decision 3: Config discovery and precedence
- **Decision**: Search upward to filesystem root; project config overrides global defaults; if no project config, use global defaults with implicit mapping of current directory.
- **Rationale**: Predictable, matches clarifications, and supports quick-start usage.
- **Alternatives considered**: Stop at home or repo root; require config to proceed (rejected for usability).

## Decision 4: Image selection model
- **Decision**: Two explicit parameters: named image profile or direct image reference; missing profile is an error.
- **Rationale**: Matches clarified behavior and avoids ambiguity.
- **Alternatives considered**: Fallback to default or auto-create (rejected to prevent surprise behavior).

## Decision 5: CLI dependencies
- **Decision**: commander (commands), prompts (lightweight input), zod (schema validation), debug (scoped logging), typescript, tsx (TypeScript runtime), vitest (unit tests).
- **Rationale**: Proven OSS with minimal footprint; keeps logic readable and testable while enabling controlled debugging and fast unit tests.
- **Alternatives considered**: inquirer (heavier), custom arg parsing (reinventing), bespoke logging (unnecessary), node:test (less ergonomic for TypeScript unit tests).

## Decision 6: Package manager
- **Decision**: pnpm.
- **Rationale**: Fast installs and efficient disk usage; aligns with a CLI-focused workflow.
- **Alternatives considered**: npm (slower, larger node_modules), yarn (extra tooling variance).

## Decision 7: Podman execution model
- **Decision**: Build Podman CLI command lines and execute via Node child_process; no daemon required.
- **Rationale**: Simple and transparent; aligns with “YOLO mode” and avoids extra background services.
- **Alternatives considered**: Podman API bindings (additional complexity).
