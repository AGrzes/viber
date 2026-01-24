# Feature Specification: Viber CLI Private Orchestration Framework

**Feature Branch**: `002-viber-cli-orchestration`  
**Created**: January 24, 2026  
**Status**: Draft  
**Input**: User description: "Develop Viber CLI private agentic coding orchestration framework - By private it means it is single person operation so the publishing ready is non-goal - By orchestration framework we mean several things - Wrapper CLI tool that allows to quickly spin up agentic worker locally using containers (podman) so agent can run in YOLO mode without confirmation every 30s but also with much better sandboxing. The wrapper should manage various projects so configuration can be persisted (folder mapping, images with tooling,...) - It should work similarly to say `codex` cli so it launches interactive session but wrapped with container - It should have some project specific config (that can be dotfile found by going up hierarchy) that contains folder mapping and ability to specify multiple mappings (RWQ/RO) for things like reference documentation - It should provide some simplified way to create config than writing file by hand - but not necesarily full blown wizard - It shoud have some global config with defaults and reusable stuff like skills palete - It can launch one off container with say `podman run --rm ...` - It should have some managemnt of images (basically reference what images to use) - It can require some additoonal libs and some manual setup - it is one person operation so do not waste tie and complexituy on things like installer or making it one file exec - it can perfectly well be globally installed node.js cli tool (and assume node runtime was intalled)"
**Constitution Guardrails**: Keep scope to primary use cases; reuse proven OSS; define clear module contracts; plan only tests that mitigate real risk.

## Clarifications

### Session 2026-01-24

- Q: What is the default outbound network policy for sessions? → A: Use the runtime default; the tool does not impose a network policy unless explicitly configured.
- Q: Which container runtime(s) are supported? → A: Podman only.
- Q: Where is global configuration stored? → A: Locally per machine; no automatic sync.
- Q: When searching upward for project configuration, what is the stopping point? → A: Search up to the filesystem root (or drive root).
- Q: How should missing image profiles be handled, and is direct image reference allowed? → A: Direct image reference and named image profile are separate explicit parameters; missing profiles are errors.
- Q: When project and global settings overlap, what is the precedence? → A: Project overrides; global used only when project omits a value.
- Q: What happens when no project configuration is found? → A: Use global defaults with an implicit mapping of the current directory.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Start an isolated agent session for a project (Priority: P1)

As a single operator, I want to start an interactive agent session that runs inside an isolated local environment so my project work is safer and repeatable.

**Why this priority**: This is the primary value of the tool: launching a safe, interactive session quickly.

**Independent Test**: Can be fully tested by starting a session for a configured project and confirming the session opens with expected folders available.

**Acceptance Scenarios**:

1. **Given** a project with a valid configuration and a working local container runtime, **When** I start a session from that project directory, **Then** an interactive agent session opens with the configured folder mappings.
2. **Given** a project with a valid configuration, **When** I start a session using the configured image profile, **Then** the session starts using that profile without requiring additional manual steps.

---

### User Story 2 - Create or update project configuration quickly (Priority: P2)

As a single operator, I want a simple CLI flow to create or update project configuration so I do not have to edit files by hand.

**Why this priority**: Configuration is required for repeated use across multiple projects and should be easy to set up.

**Independent Test**: Can be fully tested by running the config flow and verifying that the resulting project configuration is valid and reusable.

**Acceptance Scenarios**:

1. **Given** a directory without a project configuration, **When** I use the CLI to create one, **Then** a valid configuration file is written in the project and can be detected later.
2. **Given** an existing project configuration, **When** I use the CLI to update mappings or image selection, **Then** the changes are saved and take effect on the next session start.

---

### User Story 3 - Reuse global defaults and image profiles across projects (Priority: P3)

As a single operator, I want global defaults and named image profiles so I can reuse settings across multiple projects and launch one-off sessions when needed.

**Why this priority**: Reuse saves time across multiple projects and enables quick experiments.

**Independent Test**: Can be fully tested by defining a global default or image profile and starting a one-off session that uses it.

**Acceptance Scenarios**:

1. **Given** a global default configuration, **When** I start a session in a project without an explicit image selection, **Then** the session uses the global default image profile.
2. **Given** a named image profile, **When** I start a one-off session using that profile, **Then** the session runs and exits without leaving persistent resources behind.

---

### Edge Cases

- What happens when no project configuration is found while searching parent directories?
- How does the system handle invalid or missing folder paths in mappings?
- What happens when Podman is unavailable or not configured?
- How does the system handle conflicting mapping modes for the same path?
- What happens when a referenced image profile does not exist?
- What happens when outbound network access is blocked by the runtime default?
- What happens when an explicit image reference cannot be found or pulled?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST discover the nearest project configuration by searching upward from the current working directory up to the filesystem root (or drive root).
- **FR-002**: System MUST support multiple folder mappings per project, each marked as read-write or read-only.
- **FR-003**: System MUST allow folder mappings to include paths outside the project root for reference materials.
- **FR-004**: System MUST support a global configuration containing reusable defaults (including default image profile and default mappings).
- **FR-005**: System MUST apply project-specific configuration as overrides to global defaults; global defaults are used only when project values are not provided.
- **FR-006**: System MUST provide a CLI flow that creates or updates project configuration without manual file editing.
- **FR-007**: System MUST support named image profiles that can be created, listed, updated, and removed.
- **FR-008**: Users MUST be able to start an interactive agent session for a project using the resolved configuration.
- **FR-009**: Users MUST be able to launch a one-off session using a specified image profile without persisting changes.
- **FR-010**: System MUST support a reusable skills palette that can be referenced by projects.
- **FR-011**: System MUST provide clear, actionable error messages when required prerequisites (such as Podman or an image profile) are missing.
- **FR-012**: System MUST persist project and global configuration so they remain available across sessions.
- **FR-013**: System MUST use the runtime default for network access unless an explicit network policy is configured by the user.
- **FR-014**: System MUST use Podman as the supported local container runtime.
- **FR-015**: System MUST store global configuration locally on the machine and MUST NOT include automatic synchronization.
- **FR-016**: System MUST allow an explicit direct image reference as a distinct configuration option from a named image profile.
- **FR-017**: System MUST fail with a clear error if a referenced image profile does not exist.
- **FR-018**: System MUST use global defaults and map the current directory when no project configuration is found.

### Key Entities *(include if feature involves data)*

- **Project**: A local workspace with an optional project configuration and a root directory path.
- **Project Configuration**: Project-specific settings including folder mappings, selected image profile, and referenced skills palette.
- **Global Configuration**: User-wide defaults including default image profile, default mappings, and available image profiles.
- **Folder Mapping**: A mapping entry with source path, mount label (optional), and access mode (read-write or read-only).
- **Image Profile**: A named profile describing the runtime environment selection for sessions.
- **Image Reference**: An explicit image identifier used directly for a session when provided.
- **Session**: A launched interactive or one-off agent runtime tied to a specific configuration resolution.
- **Skills Palette**: A reusable set of skills or capability bundles that projects can opt into.

### Assumptions

- The tool is intended for a single operator; no multi-user permissions or publishing workflow is required.
- Podman is available and configured by the user.
- Network connectivity and external dependencies are managed outside the tool.

### Out of Scope

- Multi-user access controls, team sharing, or enterprise governance.
- Automatic installer or one-file executable packaging.
- Managed cloud-hosted orchestration.
- Automatic synchronization of global configuration across machines.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can start an interactive session from a configured project in under 2 minutes, measured from command invocation to session readiness in a typical local environment.
- **SC-002**: A user can create or update a project configuration in under 5 minutes using only the CLI flow.
- **SC-003**: At least 90% of session starts across three different projects require no manual configuration changes after initial setup.
- **SC-004**: At least 90% of one-off sessions exit cleanly without leaving persistent resources behind.
