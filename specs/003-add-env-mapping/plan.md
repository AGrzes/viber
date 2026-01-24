# Implementation Plan: Env Mapping Management

**Branch**: `[003-add-env-mapping]` | **Date**: 2026-01-24 | **Spec**: `/workdir/specs/003-add-env-mapping/spec.md`
**Input**: Feature specification from `/specs/003-add-env-mapping/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. Refer to repository docs for the execution workflow if needed.

## Summary

Add global and project-scoped environment variable mappings with CRUD commands, optional setup-wizard input, and session-time merge with project override; remove the existing `VIBER_GLOBAL_CONFIG` injection behavior. Values allow empty strings and support host-variable interpolation, but do not import host env vars by default.

## Technical Context

**Language/Version**: Node.js 25 (TypeScript 5.x)  
**Primary Dependencies**: commander, prompts, zod, debug, tsx  
**Storage**: Local filesystem JSON config files  
**Testing**: vitest  
**Target Platform**: Local CLI on developer machines (container sessions via podman)  
**Project Type**: single (CLI)  
**Performance Goals**: Mapping commands complete within 2 seconds  
**Constraints**: Works without a project config for global scope; project scope requires nearest config; deterministic behavior  
**Scale/Scope**: Single-user local usage; small config sizes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Simplicity: PASS — extend existing config store and session env merge; no new layers.
- Modularity: PASS — config storage, CLI commands, and session env assembly remain separated.
- OSS First: PASS — reuse existing CLI and validation libs already in use.
- Tests as Harness: PASS — add minimal unit tests for merge, validation, and CRUD.
- Deterministic Tools: PASS — use existing tooling and schema validation.
- Pragmatic Scope: PASS — only primary flows and guardrails.
- Self-Explanatory: PASS — use clear command names and config fields.

## Project Structure

### Documentation (this feature)

```text
specs/003-add-env-mapping/
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
│   └── services/
└── tests/
```

**Structure Decision**: Single CLI project under `cli/` with commands in `cli/src/cli/commands`, config logic in `cli/src/lib/config`, and session wiring in `cli/src/services`.

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
