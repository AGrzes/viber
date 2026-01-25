# Implementation Plan: Container File Templates

**Branch**: `005-container-file-templates` | **Date**: January 25, 2026 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/005-container-file-templates/spec.md`

## Summary

Add templated file generation to container runs by merging local/global configs, rendering Handlebars templates with provided parameters, and mounting the rendered result into the container at an env-resolved path via temporary files. This keeps template injection deterministic and configurable without exposing implementation details to users.

## Technical Context

**Language/Version**: TypeScript targeting Node.js 20 runtime used by the CLI tool.  
**Primary Dependencies**: Existing CLI supporting libraries plus `handlebars` (or equivalent template engine) for deterministic rendering.  
**Storage**: N/A (short-lived temporary files only).  
**Testing**: `vitest` with existing `pnpm test` setup for the CLI package.  
**Target Platform**: Linux-based container execution environment managed by the CLI.  
**Project Type**: CLI automation tooling that prepares container runs.  
**Performance Goals**: Template rendering and mount setup should complete within the container preparation window (target: under 5 seconds for typical configs).  
**Constraints**: File generation must run transiently without persisting user data beyond temp files and must respect existing container mount policies.  
**Scale/Scope**: Handles per-run template sets (up to ~20 templates) for a single container invocation.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Simplicity: Approach focuses on config-driven template merging and rendering without introducing extra execution layers.  
- Modularity: Template processing logic can live in a self-contained module with clear inputs (configs, suppressions) and outputs (temp files + mounts).  
- OSS First: Reuses the existing CLI stack and proven Handlebars library instead of custom text substitution.  
- Tests as Harness: Testing requirements already enumerate core unit tests for rendering and suppression guardrails.  
- Deterministic Tools: Rendering uses a deterministic template engine; formatting uses existing tooling (pnpm format).  
- Pragmatic Scope: Covers main flows (render, merge, suppress, mount) without speculative extras.  
- Self-Explanatory: Config fields (name, path, template) and operations are descriptive; comments only clarify env resolution nuances.

## Project Structure

### Documentation (this feature)

```text
specs/005-container-file-templates/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
├── tasks.md
```

### Source Code (repository root)

```text
cli/
├── package.json
├── src/
│   ├── commands/
│   ├── templates/
│   ├── utils/
│   └── index.ts
├── tests/
│   └── cli/
└── vitest.config.ts
```

**Structure Decision**: The CLI package inside `/workdir/cli` houses the entry points and shared utilities, so all feature work (config parsing, template rendering, container-spec mutation) extends `/cli/src` and its tests. No additional top-level projects are introduced.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |

## Post-Design Constitution Check

- Re-evaluated after Phase 1 artifacts; all gates still satisfied with no additional violations detected.
