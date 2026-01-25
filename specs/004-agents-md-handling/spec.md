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
3. **Given** a project-level default global content is configured, **When** the CLI starts without an explicit selection, **Then** the project-level default is used.
4. **Given** a project or session sets skip-global, **When** the CLI starts, **Then** no global content is included in the combined AGENTS.md.
5. **Given** a project-level explicit null is set for global content, **When** the CLI starts without an explicit selection, **Then** no global content is included.
6. **Given** conflicting CLI flags that both select a global name and skip global, **When** the CLI starts, **Then** it fails with a clear error.

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
- What happens when skip-global is set and only project content is present?
- What happens when both skip-global and a global selection are passed via CLI? The system errors with a clear message.

## Testing Requirements *(mandatory)*

- Verify combined agent content is produced on start when global and/or project content is configured.
- Verify default named global content is used when no explicit selection is provided.
- Verify explicit named global content overrides the default when requested.
- Verify the edit flow persists changes for global and project content.
- Verify the system handles missing or invalid named content with a clear error and no session crash.
- Verify no AGENTS.md is created or mounted when no agent content is configured.
- Verify editor non-zero exit or no-change does not update stored content.
- Verify project-level default selection is used when no explicit session selection is provided.
- Verify skip-global excludes global content even when a global default exists.
- Verify explicit null project setting results in no global content being included.
- Verify conflicting CLI flags (select name and skip-global) produce a clear error.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow users to configure project-specific agent content.
- **FR-002**: The system MUST allow users to configure multiple named global agent contents with one default selection.
- **FR-003**: The system MUST allow users to select which named global content is active for a session; if no selection is provided, the default MUST be used.
- **FR-004**: When any agent content is configured, the system MUST generate a combined AGENTS.md for the session using the active global content plus the project content when present.
- **FR-005**: The system MUST preserve the combined content order as global content first and project content second.
- **FR-006**: The system MUST make the combined AGENTS.md available to the session at the standard AGENTS.md location.
- **FR-007**: The system MUST provide an edit flow that opens an external editor to modify global or project agent content.
- **FR-008**: The system MUST persist edits made via the external editor back to the appropriate global or project configuration.
- **FR-009**: The system MUST provide a clear, user-facing error when a requested named global content does not exist.
- **FR-010**: The system MUST handle empty or missing content gracefully and avoid creating invalid AGENTS.md output.
- **FR-011**: When no global or project content is configured, the system MUST NOT create or mount AGENTS.md for the session.
- **FR-012**: If the editor exits non-zero or produces no changes, the system MUST NOT update stored content.
- **FR-013**: The system MUST allow a project-level default selection for the active global content name, used when no explicit session selection is provided.
- **FR-014**: The system MUST allow a project or session to skip global content entirely when generating the combined AGENTS.md.
- **FR-015**: The system MUST allow a project-level explicit null to indicate no global content default.
- **FR-016**: The system MUST treat conflicting CLI flags (select name and skip-global) as an error.
- **FR-017**: The system MUST apply selection precedence as: CLI flags, then project config, then global default.
- **FR-018**: The system MUST fail startup with a clear error when a requested named global content does not exist.
- **FR-019**: The system MUST treat named global content entries as case-sensitive and require exact-name uniqueness.

### Requirement Acceptance Criteria

- **FR-001**: A project can store and retrieve its own agent content without affecting other projects.
- **FR-002**: At least two named global contents can be stored and one can be designated as default.
- **FR-003**: Starting a session without a selection uses the default; starting with a selection uses the chosen name.
- **FR-004**: When global and/or project content exists, the session has a combined AGENTS.md available.
- **FR-005**: The combined content always places global content before project content.
- **FR-006**: Tools in the session can read the combined content from the standard AGENTS.md location.
- **FR-007**: An edit flow launches the user's editor with current content for global or project scope.
- **FR-008**: After saving and exiting the editor, the updated content is stored and used in the next session.
- **FR-009**: Requesting a non-existent named content yields a clear error message and no silent fallback.
- **FR-010**: Empty or missing content results in a valid, readable AGENTS.md (or no file) without session failure.
- **FR-011**: When no content is configured, no AGENTS.md is mounted for the session.
- **FR-012**: Editor non-zero exit or no-change does not update stored content.
- **FR-013**: If a project-level default is set and no explicit session selection is provided, that project default is used.
- **FR-014**: When skip-global is set, the combined AGENTS.md contains only project content (if any).
- **FR-015**: When a project-level explicit null is set and no explicit session selection is provided, no global content is included.
- **FR-016**: When conflicting CLI flags are provided, startup fails with a clear error.
- **FR-017**: CLI selections override project config selections when both are provided.
- **FR-018**: Requesting a non-existent named global content fails startup with a clear error.
- **FR-019**: Named global content entries are unique by exact, case-sensitive name.

### Key Entities *(include if feature involves data)*

- **Global Agent Content**: A named instruction set stored at the user level, including one default designation.
- **Global Content Name**: A case-sensitive identifier that must be unique across named global entries.
- **Project Agent Content**: A project-scoped instruction set stored for a specific repository or workspace.
- **Active Agent Selection**: The chosen global content name for a session (default or explicit).
- **Project Default Global Selection**: A project-scoped default for which global content name to use.
- **Skip-Global Setting**: A project or session setting that suppresses inclusion of global content.
- **Project Explicit Null**: A project-scoped setting indicating no default global content should be applied.
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
- Selection precedence is: CLI flags, then project config (named default or explicit null), then global default.
- The standard AGENTS.md location is consistent across sessions and is the expected lookup path for tools.
- Agent content is stored and edited as plain text.
