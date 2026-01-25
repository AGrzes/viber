# Research: AGENTS.md Handling

## Decision 1: Configuration storage and schema

- **Decision**: Reuse the existing CLI config store for both global and project agent settings.
- **Rationale**: Keeps storage consistent with current CLI behavior and avoids introducing new persistence layers.
- **Alternatives considered**: Separate config files for agents only; rejected due to extra surface area.

## Decision 2: Selection precedence and conflict handling

- **Decision**: Apply selection precedence as CLI flags, then project config (named default or explicit null), then global default; conflicting CLI flags are errors.
- **Rationale**: Explicit user intent should override stored defaults, and conflicts should surface early.
- **Alternatives considered**: Implicit precedence (e.g., skip-global always wins); rejected because it can hide user mistakes.

## Decision 3: AGENTS.md generation behavior

- **Decision**: Generate a combined AGENTS.md only when global or project content is configured; do not create or mount when both are absent.
- **Rationale**: Avoids misleading empty files while honoring the feature scope.
- **Alternatives considered**: Always creating an empty file; rejected for potential confusion.

## Decision 4: External editor behavior

- **Decision**: If the editor exits non-zero or content is unchanged, do not update stored content.
- **Rationale**: Avoids accidental overwrites and matches common CLI editing expectations.
- **Alternatives considered**: Save regardless of exit status; rejected to reduce risk.

## Decision 5: Named content uniqueness

- **Decision**: Treat named global content entries as case-sensitive with exact-name uniqueness.
- **Rationale**: Preserves explicit naming intent and avoids unexpected collisions.
- **Alternatives considered**: Case-insensitive uniqueness; rejected due to potential ambiguity.
