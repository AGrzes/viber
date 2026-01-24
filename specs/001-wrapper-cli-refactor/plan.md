# Implementation Plan: Wrapper CLI Refactor for Viber Orchestration

**Branch**: `001-wrapper-cli-refactor` | **Date**: January 24, 2026 | **Spec**: /workdir/specs/001-wrapper-cli-refactor/spec.md
**Input**: Feature specification from `/specs/001-wrapper-cli-refactor/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. Refer to repository docs for the execution workflow if needed.

## Summary

Refactor the existing wrapper CLI so sessions preserve host identity, mount the workspace at `/workdir`, set the container working directory to `/workdir`, support default image profile resolution without extra flags, mount `${HOME}/.codex/auth.json` when present, and export environment values for resolved config paths. The technical approach is to update the current Node.js TypeScript CLI in `/workdir/cli` to adjust image resolution logic, Podman invocation options, environment injection, and deterministic install/build/test commands.

## Technical Context

**Language/Version**: Node.js 25 (TypeScript 5.x)  
**Primary Dependencies**: commander, prompts, zod, debug, tsx, vitest  
**Storage**: Local filesystem JSON config files  
**Testing**: vitest unit tests (mandatory minimal set)  
**Target Platform**: Local developer machines with Podman installed  
**Project Type**: monorepo (pnpm workspaces), CLI module in `/workdir/cli`  
**Performance Goals**: Install + build < 5 minutes; unit tests < 60 seconds  
**Constraints**: Use deterministic tooling (pnpm, tsc, generators) before LLM edits; preserve current CLI surface  
**Scale/Scope**: Single user; refactor focused on session behavior and image resolution

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Simplicity: Local refactor of existing CLI, no new orchestration layers.
- Modularity: Keep config resolution, Podman runner, and CLI handlers isolated.
- OSS First: Retain proven libraries already in use.
- Tests as Harness: Add minimal unit tests for core behavior.
- Deterministic Tools: Use pnpm, tsc, and deterministic generators where needed.
- Pragmatic Scope: Only behaviors listed in spec; no new runtime additions.
- Self-Explanatory: Naming reflects imageProfile/imageReference and defaults.

## Project Structure

### Documentation (this feature)

```text
specs/001-wrapper-cli-refactor/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Source Code (repository root)

```text
pnpm-workspace.yaml
cli/
├── package.json
├── tsconfig.json
├── src/
│   ├── cli/
│   │   ├── index.ts
│   │   └── commands/
│   ├── lib/
│   │   ├── config/
│   │   ├── podman/
│   │   └── utils/
│   ├── services/
│   └── models/
└── tests/
    ├── integration/
    └── unit/
```

**Structure Decision**: Use the existing monorepo layout with the CLI module in `/workdir/cli`.

## Complexity Tracking

No constitution violations anticipated.

## Phase 0: Outline & Research

### Unknowns and Decisions

- Confirm default image profile naming (`default`) and how it is resolved.
- Confirm Podman flags required for keep-id and UID:GID mapping.
- Confirm mount target for `${HOME}/.codex/auth.json` relative to `/workdir`.
- Confirm env variable names for project/global config paths and CODEX_HOME behavior.

### Research Tasks

1. Validate Podman run flags for `--userns=keep-id` and `--user UID:GID` usage.
2. Confirm existing config format and where default image profile is stored.
3. Decide mount target path for `auth.json` inside the container working directory.
4. Decide env variable names for config paths and CODEX_HOME.

### Outputs

- `/workdir/specs/001-wrapper-cli-refactor/research.md`

## Phase 1: Design & Contracts

### Data Model

- Update entities to reflect imageProfile/imageReference mutually exclusive fields and default profile naming.

### Contracts

- Provide a command-level OpenAPI contract for config resolve and session start/run.

### Quickstart

- Document deterministic install/build/test commands using pnpm and tsc.

### Agent Context Update

- Run `/workdir/.specify/scripts/bash/update-agent-context.sh codex` after design artifacts are created.

## Post-Design Constitution Check

- Simplicity: Refactor focused on session behavior only.
- Modularity: Config and Podman execution remain separate.
- OSS First: No new heavy dependencies introduced.
- Tests as Harness: Unit tests defined for defaults and Podman args.
- Deterministic Tools: Build/test use pnpm + tsc + vitest.
- Pragmatic Scope: No CLI redesign beyond required behavior.
- Self-Explanatory: Default profile and mapping behavior documented.

## Phase 2: Implementation Plan

1. Update image resolution to use `imageProfile` or `imageReference` (mutually exclusive) with default profile fallback.
2. Add default mapping of current directory to `/workdir` when mappings missing and set container working directory to `/workdir`.
3. Add Podman run options: `--userns=keep-id` and explicit UID:GID.
4. Mount `${HOME}/.codex/auth.json` into `/workdir/.codex/auth.json` when present and set `CODEX_HOME` accordingly.
5. Inject environment variables for resolved project/global config paths into sessions.
6. Add unit tests for mapping default, image resolution, workdir, env injection, and Podman args.
7. Validate deterministic install/build/test commands in quickstart.
