# Feature Specification: AGENTS.md Configuration Handling

**Feature Branch**: `002-agents-config`  
**Created**: January 25, 2026  
**Status**: Draft  
**Input**: User description: "Add AGENTS.md handling to viber cli - Provide option to specify content on project level - Provide option to specify multiple named contents on global level (map key -> content) with one default - If agents are configured then on start flusf content global + local to temp file and mount it under CODEX_HOME/AGENTS.md - Provide content editing capacity launching external editor (like git do with commit messages)"
**Constitution Guardrails**: Keep scope to primary use cases; reuse proven OSS; define clear module contracts; include minimal unit tests that prove core behavior works; prefer deterministic tools over LLM transformations.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Global named AGENTS content (Priority: P1)

A user defines multiple named AGENTS.md contents at the global level, sets one as the default, and relies on the default when no specific name is chosen.

**Why this priority**: Global defaults determine the baseline experience for every session and are the foundation for any further overrides.

**Independent Test**: Can be fully tested by configuring two global named contents with a default and starting a session without specifying a name, delivering the default content as the effective AGENTS.md.

**Acceptance Scenarios**:

1. **Given** multiple global named contents and a default name, **When** a session starts without a specific name, **Then** the default content is used.
2. **Given** multiple global named contents and a default name, **When** a session explicitly selects a valid name, **Then** the selected content is used.

---

### User Story 2 - Project-level AGENTS content and merge (Priority: P2)

A user sets project-level AGENTS content that augments the selected global content, and the session receives the combined content under `CODEX_HOME/AGENTS.md`.

**Why this priority**: Project-specific instructions are common and must reliably layer on top of global defaults.

**Independent Test**: Can be fully tested by setting global content and project content, starting a session, and verifying the effective AGENTS.md includes both in the correct order.

**Acceptance Scenarios**:

1. **Given** a selected global content and project content, **When** a session starts, **Then** the effective AGENTS.md includes global content followed by project content.
2. **Given** only project content and no global content, **When** a session starts, **Then** the effective AGENTS.md includes only the project content.

---

### User Story 3 - Edit AGENTS content in an external editor (Priority: P3)

A user edits either global or project AGENTS content by launching their external editor and saves changes back to configuration.

**Why this priority**: Editing large instruction blocks is most efficient in an editor; this enables practical day-to-day updates.

**Independent Test**: Can be fully tested by launching the edit flow, changing content, and observing the updated configuration on the next session.

**Acceptance Scenarios**:

1. **Given** existing AGENTS content, **When** the user opens the edit flow and saves changes, **Then** the updated content is stored and used on the next session.
2. **Given** the user exits the editor without saving, **When** the edit flow ends, **Then** the stored content remains unchanged.

---

### Edge Cases

- What happens when a user selects a global name that does not exist?
- How does the system handle an empty or whitespace-only AGENTS content?
- What happens when no global default is defined but multiple named contents exist?
- How does the system behave if the external editor exits with an error or is unavailable?
- What happens when project content is present but global content is missing?

## Testing Requirements *(mandatory)*

- Verify default global named content is used when no name is selected.
- Verify selected global named content is used when a valid name is provided.
- Verify global content is combined with project content in the correct order.
- Verify external editor flow updates stored content on save and leaves it unchanged on cancel.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow users to define multiple named AGENTS contents at the global level.
- **FR-002**: The system MUST allow users to set exactly one global default AGENTS content name.
- **FR-003**: The system MUST allow users to select a specific global named content for a session; when not specified, the default MUST be used.
- **FR-004**: The system MUST allow users to define project-level AGENTS content.
- **FR-005**: When any AGENTS content is configured, the system MUST assemble an effective AGENTS.md by combining the selected global content (if present) and project content (if present) with global content first.
- **FR-006**: The system MUST provide a way to edit global and project AGENTS content using an external editor and store the result on save.
- **FR-007**: If the external editor exits without saving or returns an error, the system MUST leave existing stored content unchanged and inform the user.
- **FR-008**: If a selected global name does not exist, the system MUST show a clear error and fall back to the default only when a default is configured.
- **FR-009**: If no AGENTS content is configured, the system MUST NOT create or mount an effective AGENTS.md for the session.
- **FR-010**: The effective AGENTS.md MUST be mounted for the session under `CODEX_HOME/AGENTS.md` before any user commands are executed.

### Key Entities *(include if feature involves data)*

- **Global AGENTS Content Set**: A collection of named AGENTS content entries plus the designated default name.
- **Project AGENTS Content**: The project-specific AGENTS content that augments global content.
- **Effective AGENTS Content**: The combined content used for the session and mounted at `CODEX_HOME/AGENTS.md`.

### Assumptions

- AGENTS content is plain text and can be combined by concatenating with a single newline between global and project content.
- The user has or can configure an external editor for text editing.
- Existing configuration storage supports storing a map of names to content and a separate default name.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can configure and select a named global AGENTS content in under 2 minutes on a fresh setup.
- **SC-002**: 95% of sessions with any AGENTS configuration have the effective AGENTS.md available before the first command is run.
- **SC-003**: Users can update AGENTS content via the editor and see changes applied on the next session without additional manual steps in 90% of attempts.
- **SC-004**: Sessions without any AGENTS configuration start with zero added prompts or errors related to AGENTS handling.
