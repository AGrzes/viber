# Implementation Plan: Viber CLI Private Orchestration Framework

**Branch**: `002-viber-cli-orchestration` | **Date**: January 24, 2026 | **Spec**: /workdir/specs/002-viber-cli-orchestration/spec.md
**Input**: Feature specification from `/specs/002-viber-cli-orchestration/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. Refer to repository docs for the execution workflow if needed.

## Summary

Deliver a single-user CLI that orchestrates agent sessions inside Podman containers, with project and global configuration resolution, folder mappings (RW/RO), named image profiles or direct image references, and a minimal config-init flow to avoid manual file edits. The technical approach is a Node.js 25 + TypeScript CLI that reads/writes local JSON config files, resolves configuration precedence, uses scoped debug logging, and shells out to Podman for session lifecycle.

## Technical Context

**Language/Version**: Node.js 25 (TypeScript 5.x)  
**Primary Dependencies**: commander (CLI command parsing), prompts (lightweight interactive inputs), zod (config validation), debug (scoped logging), typescript, tsx  
**Storage**: Local filesystem JSON files for project and global config  
**Testing**: node:test with lightweight integration tests for command flows  
**Target Platform**: Local developer machines with Podman installed (Linux/macOS; Windows via WSL if Podman is available)  
**Project Type**: single  
**Performance Goals**: Config commands complete in <1s; session start aligns with spec (<2 minutes)  
**Constraints**: No background daemon; rely on Podman CLI; avoid auto-sync of configuration; use pnpm for package management  
**Scale/Scope**: Single user; tens of projects and image profiles; config size <1MB

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Simplicity: Use a single CLI with direct Podman invocations; avoid daemons or orchestration layers.
- Modularity: Separate config resolution, Podman runner, and CLI command handlers with explicit interfaces.
- OSS First: Prefer proven libraries for CLI, prompting, and validation.
- Tests as Harness: Focus tests on config resolution and Podman command construction.
- Pragmatic Scope: Target primary workflows (init, start, one-off run, profile mgmt).
- Self-Explanatory: Commands and config fields are named after user intent.

## Project Structure

### Documentation (this feature)

```text
specs/002-viber-cli-orchestration/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── cli/
│   ├── index.ts
│   └── commands/
├── lib/
│   ├── config/
│   ├── podman/
│   └── utils/
├── models/
└── services/

tests/
├── integration/
└── unit/
```

**Structure Decision**: Single CLI project with shared libraries for config resolution and Podman execution.

## Complexity Tracking

No constitution violations anticipated.

## Phase 0: Outline & Research

### Unknowns and Decisions

- Decide the CLI command surface and minimum workflow set.
- Decide config file locations and JSON schema boundaries.
- Decide how to represent image profiles vs direct image references.

### Research Tasks

1. Confirm Node.js 20 LTS as baseline and stick to standard Node APIs where possible.
2. Choose minimal OSS libraries for CLI prompts and config validation.
3. Define Podman command patterns for interactive and one-off sessions.

### Outputs

- `/workdir/specs/002-viber-cli-orchestration/research.md`

## Phase 1: Design & Contracts

### Data Model

- Extract entities and validation rules from the spec into `data-model.md`.

### Contracts

- Produce an OpenAPI contract representing command-level operations (session start, one-off run, config init/update, image profile management).

### Quickstart

- Provide a developer quickstart for running the CLI locally with Podman.

### Agent Context Update

- Run `/workdir/.specify/scripts/bash/update-agent-context.sh codex` after design artifacts are created.

## Post-Design Constitution Check

- Simplicity: Single CLI with direct Podman invocation retained.
- Modularity: Config, Podman runner, and command handlers remain separable.
- OSS First: Only minimal proven libraries selected.
- Tests as Harness: Focus on config resolution and Podman command assembly.
- Pragmatic Scope: No multi-user, sync, or daemon features added.
- Self-Explanatory: Commands and config fields align with user intent.

## Phase 2: Implementation Plan

1. Implement config discovery and resolution (project + global + implicit mapping).
2. Implement schema validation and error reporting.
3. Implement Podman command builder and runner.
4. Implement CLI commands: init/update config, start session, one-off run, image profile CRUD.
5. Add targeted tests for config resolution and Podman command construction.
6. Document usage and examples in README/quickstart.
