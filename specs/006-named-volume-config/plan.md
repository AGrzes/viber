# Implementation Plan: Named Volume Configuration for viber-cli

**Branch**: `006-named-volume-config` | **Date**: 2026-02-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-named-volume-config/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. Refer to repository docs for the execution workflow if needed.

## Summary

Add support for named volume configuration to viber-cli, allowing developers to persist container directories (node_modules, build caches, databases) across restarts. Implements a unified `volumeMappings` object/map structure that supports both bind mounts (sourcePath→targetPath) and named volumes (volumeName→targetPath), with global and project-level configuration, simple merge strategy (project overrides global by target path key), and automatic migration from legacy array-based `mappings` format.

## Technical Context

**Language/Version**: TypeScript targeting Node.js 20 (existing CLI runtime)  
**Primary Dependencies**: Zod (config validation), existing CLI libraries  
**Storage**: JSON config files (.viber.json for project, ~/.viber/config.json for global)  
**Testing**: Vitest (existing test framework - `pnpm test`)  
**Target Platform**: Linux/macOS/Windows CLI environment with Podman container runtime
**Project Type**: Single CLI tool (monorepo with /cli directory)  
**Performance Goals**: Config load/merge <100ms, container startup overhead <5s  
**Constraints**: Must preserve backward compatibility with existing mappings array format; must not break current workdir/defaultMappings behavior  
**Scale/Scope**: Support 20+ volume mappings per project without degradation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Initial Check (Pre-Research): ✅ PASS

- ✅ **Simplicity**: Extends existing config schema; uses simple object merge (Object.assign pattern); no extra abstraction layers
- ✅ **Modularity**: Changes contained to config module (schema.ts, resolver.ts, store.ts); clear contract: config in → resolved mappings out
- ✅ **OSS First**: Reuses Zod (already in project); no new dependencies needed
- ✅ **Tests as Harness**: Spec defines 6 minimal unit tests covering core behavior (persistence, hierarchy, migration, validation)
- ✅ **Deterministic Tools**: TypeScript compiler + Prettier for formatting (existing toolchain)
- ✅ **Pragmatic Scope**: Targets main use case (volume persistence); defers profile generalization
- ✅ **Self-Explanatory**: volumeMappings, targetPath, volumeName, sourcePath are domain terms; merge logic is standard object spread

### Post-Design Check: ✅ PASS

- ✅ **Simplicity Verified**: Research confirms no new dependencies; merge is single line `{ ...global, ...project }`; Podman integration requires only conditional check in existing runner
- ✅ **Modularity Verified**: Data model shows clean separation: schema validation → resolution → runner; contracts are explicit TypeScript interfaces
- ✅ **OSS First Verified**: Zero new dependencies added; Vitest already present; Zod already present; Handlebars already present
- ✅ **Tests as Harness Verified**: Defined 6 unit tests in quickstart + 2 test files planned (volumeMappings.test.ts, migration.test.ts); follows existing test patterns
- ✅ **Deterministic Tools Verified**: TypeScript compilation (tsc) for type safety; Prettier for formatting; no LLM transforms in build chain
- ✅ **Pragmatic Scope Verified**: Deferred profile support, GUI editors, auto-cleanup; focused on core volume persistence need
- ✅ **Self-Explanatory Verified**: API contracts show clear function signatures; data model relationships are straightforward; naming follows existing patterns (FolderMapping → VolumeMapping)

**GATE STATUS**: ✅ PASS - Design maintains constitutional compliance

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
cli/
├── src/
│   ├── lib/
│   │   ├── config/
│   │   │   ├── schema.ts           # [MODIFY] Add VolumeMappingSchema, update ProjectConfigSchema/GlobalConfigSchema
│   │   │   ├── resolver.ts         # [MODIFY] Add volumeMappings merge logic
│   │   │   ├── store.ts            # [MODIFY] Add migration from legacy mappings array
│   │   │   └── validation.ts       # [MODIFY] Add volumeMappings validation
│   │   └── podman/
│   │       └── runner.ts           # [MODIFY] Pass volumeMappings to container runtime
│   └── services/
│       └── (existing services)
└── tests/
    └── unit/
        └── config/
            ├── volumeMappings.test.ts  # [NEW] Unit tests for FR-001 through FR-014
            └── migration.test.ts        # [NEW] Legacy format migration tests

specs/006-named-volume-config/
├── plan.md              # This file
├── research.md          # Phase 0: Test framework + container runtime integration patterns
├── data-model.md        # Phase 1: VolumeMappingSchema entities
├── quickstart.md        # Phase 1: User guide for volumeMappings config
└── contracts/           # Phase 1: Zod schemas (extracted from code)
```

**Structure Decision**: Single project (CLI tool). Changes isolated to existing `/cli/src/lib/config/` module with new test files in `/cli/tests/unit/config/`. Follows established patterns in codebase (Zod schemas, config resolution, store operations).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
