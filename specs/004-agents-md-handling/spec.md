# Feature Specification: AGENTS.md Handling

**Feature Branch**: `004-agents-md-handling`  
**Created**: January 25, 2026  
**Status**: Draft  
**Input**: User description: "Add AGENTS.md handling to viber cli - Provide option to specify content on project level - Provide option to specify multiple named contents on global level (map key -> content) with one default - If agents are configured then on start flusf content global + local to temp file and mount it under CODEX_HOME/AGENTS.md - Provide content editing capacity launching external editor (like git do with commit messages)"
**Constitution Guardrails**: Keep scope to primary use cases; reuse proven OSS; define clear module contracts; include minimal unit tests that prove core behavior works; prefer deterministic tools over LLM transformations.

## Clarifications

### Session 2026-01-25

- Q: When no global or project agent content is configured, what should the CLI do about AGENTS.md for the session? → A: Do not create or mount AGENTS.md.
- Q: If the external editor exits non-zero or without changes, how should the CLI handle saving agent content? → A: Do not update stored content.
- Q: How should users select which named global content is active for a session? → A: Allow a CLI flag and a project-level default; use the global default when neither is set; allow a flag or project setting to skip global content entirely.
- Q: If both skip-global and an explicit global content name are set, which should take precedence? → A: CLI flags override project config; contradictory CLI flags are an error; project config supports explicit null for no default.
- Q: If a named global content is requested but does not exist, what should the CLI do? → A: Fail startup with a clear error.
- Q: How should the CLI treat uniqueness for named global content entries? → A: Names are case-sensitive and must be unique exactly as typed.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Use Combined Agent Instructions on Start (Priority: P1)

As a CLI user, I want the tool to apply my configured global and project agent instructions automatically when it starts so that my session uses the right guidance without manual steps.

**Why this priority**: This is the core value of the feature and enables consistent behavior for every run.

**Independent Test**: Can be fully tested by configuring global and project agent content, starting the CLI, and verifying the combined instructions are made available at the standard AGENTS.md location.

**Acceptance Scenarios**:

1. **Given** global agent content and project agent content are configured, **When** the CLI starts in that project, **Then** a combined AGENTS.md is available for the session with both contents in the expected order.
2. **Given** only global agent content is configured, **When** the CLI starts, **Then** a combined AGENTS.md is available containing only the global content.

---

### User Story 2 - Select a Named Global Agent Content (Priority: P2)

As a CLI user, I want to store multiple named global agent contents with one default so I can switch the active global instructions without rewriting them.

**Why this priority**: It enables reusable instruction sets across different tasks with minimal friction.

**Independent Test**: Can be fully tested by defining multiple named global contents, setting a default, and launching the CLI using the default or a chosen name.

**Acceptance Scenarios**:

1. **Given** multiple named global contents and a default are configured, **When** the CLI starts without an explicit selection, **Then** the default content is used.
2. **Given** multiple named global contents are configured, **When** the CLI is started with a specific content name, **Then** that named content is used.
3. **Given** a project reference is configured, **When** the CLI starts without an explicit selection, **Then** the referenced name is used.
4. **Given** a project sets no-global, **When** the CLI starts, **Then** no global content is included in the combined AGENTS.md.
5. **Given** conflicting CLI flags that both select a global name and no-global, **When** the CLI starts, **Then** it fails with a clear error.

---

### User Story 3 - Edit Agent Content in an External Editor (Priority: P3)

As a CLI user, I want to edit agent content in my preferred external editor so I can make substantial updates efficiently.

**Why this priority**: Editing long instruction text is a common workflow and should be comfortable and fast.

**Independent Test**: Can be fully tested by launching the edit flow, modifying content in the editor, and confirming the saved content is used in the next session.

**Acceptance Scenarios**:

1. **Given** an editor is available, **When** I launch the edit flow for global or project content, **Then** my editor opens with the current content and saves changes back to configuration.

---

### Edge Cases

- What happens when no global or project agent content is configured? The system does not create or mount an AGENTS.md for that session.
- How does the system handle an empty named content or an empty project content?
- What happens when the external editor exits without saving or returns a non-zero status? If the editor exits non-zero or without changes, the system does not update stored content.
- How does the system handle a requested named content that does not exist?
- What happens when no-global is set and only project content is present?
- What happens when both no-global and a global selection are passed via CLI? The system errors with a clear message.

## Testing Requirements *(mandatory)*

- Verify combined agent content is produced on start when global and/or project content is configured.
- Verify the `default` global entry is used when no explicit selection or project reference is provided.
- Verify explicit named global content overrides the default when requested.
- Verify the `viber agents edit` flow persists changes for global and project text.
- Verify the system handles missing named content with a clear error and no session crash.
- Verify no AGENTS.md is created or mounted when no agent content is configured.
- Verify editor non-zero exit or no-change does not update stored content.
- Verify `viber agents reference <name>` selects the referenced global entry.
- Verify `viber agents reference --no-global` excludes global content even when `default` exists.
- Verify `viber agents reference --clear` removes the project reference.
- Verify conflicting CLI flags (select name and no-global) produce a clear error.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow users to edit project agent text via `viber agents edit` and store it as plain text.
- **FR-002**: The system MUST allow users to edit global agent text via `viber agents edit --global <name>` and store it as plain text.
- **FR-003**: The system MUST treat named global entries as case-sensitive and require exact-name uniqueness.
- **FR-004**: The global default MUST be the entry named `default` (if present); no special handling is required on write.
- **FR-005**: The system MUST clear project agent text via `viber agents clear` and clear a global entry via `viber agents clear --global <name>`.
- **FR-006**: The system MUST allow project reference selection via `viber agents reference <name>`, clearing via `--clear`, and explicit no-global via `--no-global`.
- **FR-007**: CLI flags MUST override project reference settings when selecting global text for a session.
- **FR-008**: If both select-name and no-global are provided via CLI flags, startup MUST fail with a clear error.
- **FR-009**: Requesting a non-existent global name MUST fail startup with a clear error.
- **FR-010**: When global or project text exists, the system MUST generate a combined AGENTS.md with global content first and project content second.
- **FR-011**: When no global or project content is configured, the system MUST NOT create or mount AGENTS.md for the session.
- **FR-012**: If the editor exits non-zero or content is unchanged, the system MUST NOT update stored text.
- **FR-013**: When no explicit selection or project reference is set, the `default` global entry (if present) MUST be used.

### Requirement Acceptance Criteria

- **FR-001**: Running `viber agents edit` opens the editor and persists project text on save.
- **FR-002**: Running `viber agents edit --global <name>` opens the editor and persists that named text on save.
- **FR-003**: Names differing only by case are treated as distinct; duplicates by exact match are rejected.
- **FR-004**: If a `default` entry exists and no explicit selection/reference is set, it is used.
- **FR-005**: `viber agents clear` removes project text; `--global <name>` removes that entry.
- **FR-006**: `viber agents reference <name>` sets a project reference; `--clear` removes it; `--no-global` explicitly excludes global content.
- **FR-007**: CLI selection overrides any project reference value for the session.
- **FR-008**: Conflicting CLI flags (select name + no-global) produce a clear error and non-zero exit.
- **FR-009**: Selecting a missing global name fails with a clear error and non-zero exit.
- **FR-010**: Combined AGENTS.md places global content before project content.
- **FR-011**: No AGENTS.md is mounted when both global and project content are absent.
- **FR-012**: Editor non-zero exit or no-change does not update stored text.
- **FR-013**: If no selection/reference exists, the `default` entry is used when present.

### Key Entities *(include if feature involves data)*

- **Global Agents Map**: Map of `name` → plain-text content.
- **Global Content Name**: Case-sensitive identifier for global entries.
- **Project Agents Value**: Plain-text content for the project, or null to explicitly exclude global content.
- **Project Reference**: Optional global name stored for the project to select a global entry.
- **Generated Agent File**: The combined instruction output used for the current session.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% of sessions with configured agent content start with a usable AGENTS.md available within 2 seconds of CLI start.
- **SC-002**: 100% of sessions started with an explicit named global content use that content without falling back to the default.
- **SC-003**: Users complete an edit flow for agent content in under 3 minutes in 90% of attempts.
- **SC-004**: Support requests related to missing or misapplied agent instructions drop by 50% within one release cycle after rollout.

## Dependencies

- Users have access to an external editor configured for CLI editing flows.

## Assumptions

- The combined content uses simple concatenation with a blank line between global and project content.
- Selection precedence is: CLI flags, then project reference or no-global, then global `default` entry if present.
- The standard AGENTS.md location is consistent across sessions and is the expected lookup path for tools.
- Agent content is stored and edited as plain text.
- Project storage uses `agents` as string | undefined | null and optional `agentsRef` for a global name.
