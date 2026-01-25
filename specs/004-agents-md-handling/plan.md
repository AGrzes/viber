# Implementation Plan: AGENTS.md Handling

**Branch**: `[004-agents-md-handling]` | **Date**: January 25, 2026 | **Spec**: `/workdir/specs/004-agents-md-handling/spec.md`
**Input**: Feature specification from `/specs/004-agents-md-handling/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. Refer to repository docs for the execution workflow if needed.

## Summary

Add global and project-scoped AGENTS.md plain-text entries with named global entries (default is the `default` name); allow per-session selection and no-global; combine global+project text into a temp AGENTS.md mounted at startup; provide external-editor editing flows with clear error handling and selection precedence.

## Technical Context

**Language/Version**: TypeScript (Node.js ES2022, tsconfig target ES2022)  
**Primary Dependencies**: commander, prompts, zod, debug  
**Storage**: Local filesystem config files (existing CLI config store)  
**Testing**: vitest  
**Target Platform**: Local CLI on developer machines (container sessions via podman)  
**Project Type**: single (CLI)  
**Performance Goals**: Session start with combined AGENTS.md available within 2 seconds  
**Constraints**: Deterministic merge order (global then project); explicit selection precedence; error on invalid selections  
**Scale/Scope**: Single-user local usage; small config sizes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Simplicity: PASS — extend existing config and session setup paths; no new layers.
- Modularity: PASS — config, CLI commands, and session file assembly remain separated.
- OSS First: PASS — reuse existing CLI, validation, and editor invocation patterns.
- Tests as Harness: PASS — add minimal unit tests for selection, merge, and editor flows.
- Deterministic Tools: PASS — use existing build/test tooling and schema validation.
- Pragmatic Scope: PASS — primary flows plus guardrails from spec.
- Self-Explanatory: PASS — clear command names and config fields.

## Project Structure

### Documentation (this feature)

```text
specs/004-agents-md-handling/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Source Code (repository root)

```text
cli/
├── src/
│   ├── cli/
│   │   └── commands/
│   ├── lib/
│   │   ├── config/
│   │   └── utils/
│   ├── models/
│   └── services/
└── tests/
```

**Structure Decision**: Single CLI project under `cli/` with commands in `cli/src/cli/commands`, config logic in `cli/src/lib/config`, session wiring in `cli/src/services`, and tests in `cli/tests`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |

## Constitution Check (Post-Design)

- Simplicity: PASS
- Modularity: PASS
- OSS First: PASS
- Tests as Harness: PASS
- Deterministic Tools: PASS
- Pragmatic Scope: PASS
- Self-Explanatory: PASS
