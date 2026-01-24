# Feature Specification: Env Mapping Management

**Feature Branch**: `[003-add-env-mapping]`  
**Created**: January 24, 2026  
**Status**: Draft  
**Input**: User description: "Another round of fixing viber cli - now I will make it more targeted THere is dumb non-feature of setting VIBER_GLOBAL_CONFIG in container. It does not make sense. Get rid of it. What makes sense is to be able to provide KV mapping for env variables on global and local level so - Command to set, list, get, delete mapping, globally and in nearest project - Optionally opportunity to provide them in setup wizard - Merge of the envs when spawning container"
**Constitution Guardrails**: Keep scope to primary use cases; reuse proven OSS; define clear module contracts; include minimal unit tests that prove core behavior works; prefer deterministic tools over LLM transformations.

## Clarifications

### Session 2026-01-24

- Q: What validation rule should define a “valid environment variable name” for mapping keys? → A: Keys must match `[A-Za-z_][A-Za-z0-9_]*` (case-sensitive).
- Q: When the same key exists in both scopes, which value wins? → A: Project scope overrides global scope.
- Q: If no project configuration exists, should project-scoped set auto-create it or fail? → A: Fail; a project configuration must already exist (possibly higher in the directory hierarchy). Global scope commands must work anywhere.
- Q: Should empty string values be allowed? → A: Yes; empty strings are valid values and are stored explicitly.
- Q: Should stored mapping values support interpolation of host environment variables (for example `E1=$HOST_VAR`)? → A: Yes; allow interpolation inside values, without importing host env vars by default.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Use env mappings in container sessions (Priority: P1)

As a user, I want environment variable mappings defined globally and in my current project to be applied when a container session starts, so my tools and workflows work without manual export steps.

**Why this priority**: This is the primary value of the feature and affects every session.

**Independent Test**: Set one global mapping and one project mapping, start a session, and verify both are present in the container environment with project values taking precedence.

**Acceptance Scenarios**:

1. **Given** a global mapping `FOO=one` and a project mapping `BAR=two`, **When** a session starts from that project, **Then** the container environment includes `FOO=one` and `BAR=two`.
2. **Given** a global mapping `FOO=one` and a project mapping `FOO=two`, **When** a session starts from that project, **Then** the container environment includes `FOO=two`.
3. **Given** no env mappings, **When** a session starts, **Then** no additional env mappings are injected and `VIBER_GLOBAL_CONFIG` is not set in the container.

---

### User Story 2 - Manage env mappings via CLI (Priority: P2)

As a user, I want to set, get, list, and delete env mappings in global or project scope so I can manage them without editing config files by hand.

**Why this priority**: This is required to create and maintain mappings in a consistent, supported way.

**Independent Test**: Use the CLI to set, list, get, and delete a mapping in each scope and confirm the results.

**Acceptance Scenarios**:

1. **Given** no mapping for `API_URL`, **When** I set `API_URL=https://example` in project scope, **Then** `get` returns the value and `list` shows the entry.
2. **Given** an existing global mapping `API_URL=https://example`, **When** I delete it, **Then** it no longer appears in `list` and `get` reports it as missing.

---

### User Story 3 - Capture env mappings during setup (Priority: P3)

As a user running the setup wizard, I want the option to enter env mappings so they are saved along with other project settings.

**Why this priority**: It reduces setup time and makes new projects consistent from the start.

**Independent Test**: Run the setup wizard, add mappings, and confirm they are stored in the project configuration and applied in a session.

**Acceptance Scenarios**:

1. **Given** I choose to add mappings during setup, **When** I complete the wizard, **Then** the project configuration includes those mappings.
2. **Given** I skip mappings during setup, **When** I complete the wizard, **Then** no mappings are added.

### Edge Cases

- What happens when a mapping key is not a valid environment variable name?
- How does the system handle an empty string value for a mapping?
- What happens when `get` or `delete` is called for a key that does not exist?
- What happens when no project configuration exists and a project-scoped mapping is set? It must fail with a clear error.

## Testing Requirements *(mandatory)*

- Unit test that merged env mappings are injected with project scope overriding global scope.
- Unit test that `VIBER_GLOBAL_CONFIG` is never injected into the container environment.
- Unit test that CLI set/get/list/delete work for both global and project scopes, including missing-key behavior.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST remove the existing behavior that injects `VIBER_GLOBAL_CONFIG` into the container environment.
- **FR-002**: System MUST allow users to store env mappings as key/value pairs at both global and project scope.
- **FR-003**: System MUST provide CLI commands to set, get, list, and delete env mappings in global scope.
- **FR-004**: System MUST provide CLI commands to set, get, list, and delete env mappings for the nearest project scope.
- **FR-005**: System MUST merge global and project mappings when starting a session, with project mappings overriding global mappings on key conflicts.
- **FR-006**: System MUST validate mapping keys against `[A-Za-z_][A-Za-z0-9_]*` (case-sensitive) and reject invalid keys with a clear error.
- **FR-007**: System MUST allow mapping values to be empty strings, store them explicitly, and preserve them as provided.
- **FR-008**: System MUST offer an optional step in the setup wizard to add project-scoped env mappings.
- **FR-009**: System MUST fail with a clear error when setting a project-scoped mapping and no project configuration exists.
- **FR-010**: System MUST report missing keys clearly when `get` or `delete` is requested for an unmapped key.
- **FR-011**: System MUST allow global-scope mapping commands to run even when no project configuration exists.
- **FR-012**: System MUST support interpolation of host environment variables within mapping values (for example `E1=$HOST_VAR`) without importing host variables by default.

### Key Entities

- **Env Mapping Entry**: A key/value pair representing one environment variable mapping.
- **Env Mapping Set**: A collection of mapping entries associated with a scope (global or project).

### Assumptions

- Project scope is resolved from the nearest project configuration to the current working directory.
- Project-scoped mappings are intended to override global mappings by default.

### Dependencies

- Existing global and project configuration storage remains available and writable.
- Session startup continues to support injecting additional environment variables.

### Out of Scope

- Managing secrets beyond plain env mappings (for example, encrypted secret stores).
- Runtime overrides from ad-hoc command flags outside the mapping feature.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of container sessions include the correct merged env mappings based on current global and project configuration.
- **SC-002**: 95% of mapping management commands (set/get/list/delete) complete in under 2 seconds.
- **SC-003**: 0% of container sessions include `VIBER_GLOBAL_CONFIG` in the environment.
- **SC-004**: At least 90% of users can add a mapping during setup without needing to re-run the wizard.
