# Feature Specification: Wrapper CLI Refactor for Viber Orchestration

**Feature Branch**: `001-wrapper-cli-refactor`  
**Created**: January 24, 2026  
**Status**: Draft  
**Input**: User description: "Refactoring of already implemented viber cli orchestration Current implementation in wrapper/cli - Adapt to changes in constitution (actually install deps, compile and test code) - For image resolution do not have imageSourceType + imageSource but imageSource/imageProfile as or/or - Add running podman with userns_mode: keep-id and UID:GID of current user - Add handling of default mapping of cwd to workdir - Add using of default image profile use when profile is not specified (named default so not additional flags on profile are needed) - Add handling of amounting ${HOME}/.codex/auth.json to working directory"
**Constitution Guardrails**: Keep scope to primary use cases; reuse proven OSS; define clear module contracts; include minimal unit tests that prove core behavior works; prefer deterministic tools over LLM transformations.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Run a session with correct identity and workspace (Priority: P1)

As a single operator, I want sessions to run with my host user identity and have my current workspace mounted predictably so file ownership and paths behave correctly.

**Why this priority**: Correct identity and workspace mapping are essential for safe day-to-day use.

**Independent Test**: Start a session from a project directory and verify files created inside the session are owned by the host user and the current directory is available at the expected container path.

**Acceptance Scenarios**:

1. **Given** a valid local runtime and project directory, **When** I start a session without explicit mappings, **Then** my current directory is mounted at `/workdir` inside the session.
2. **Given** a valid local runtime, **When** I start a session, **Then** files created in the session are owned by my host user (UID/GID preserved).
3. **Given** `${HOME}/.codex/auth.json` exists, **When** I start a session, **Then** it is mounted into the session working directory for agent access.

---

### User Story 2 - Resolve images predictably (Priority: P2)

As a single operator, I want image selection to be explicit and predictable so I can run sessions without extra flags when a default profile is set.

**Why this priority**: Reliable image resolution prevents accidental environment drift.

**Independent Test**: Configure a default image profile and start a session without specifying a profile or image reference; the session must use the default profile image.

**Acceptance Scenarios**:

1. **Given** a default image profile is configured, **When** I start a session without specifying an image profile or image reference, **Then** the default profile is used.
2. **Given** both image profile and image reference are provided, **When** I start a session, **Then** the system rejects the configuration as invalid.

---

### User Story 3 - Maintain deterministic build and test workflow (Priority: P3)

As a maintainer, I want deterministic install, build, and test steps so the refactor can be validated reliably and repeatedly.

**Why this priority**: The constitution requires a minimal unit-test baseline and deterministic tooling for validation.

**Independent Test**: Run the documented install, compile, and unit test commands and confirm they complete without manual intervention.

**Acceptance Scenarios**:

1. **Given** a clean checkout, **When** I run the documented install and compile steps, **Then** the codebase builds without manual edits.
2. **Given** the documented test command, **When** I run it, **Then** the minimal unit tests execute and pass.

---

### Edge Cases

- What happens when `${HOME}/.codex/auth.json` is missing?
- How does the system behave when the default image profile is not configured?
- What happens if the current directory cannot be mounted to `/workdir`?
- How does the system respond when Podman is unavailable or not configured?

## Testing Requirements *(mandatory)*

- Unit test: resolving default mapping mounts current directory to `/workdir` when no mappings are provided.
- Unit test: image resolution rejects configurations where both image profile and image reference are set.
- Unit test: default image profile is used when no image profile or image reference is specified.
- Unit test: session run arguments include host UID/GID preservation and auth.json mount when present.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST treat image profile and image reference as mutually exclusive configuration fields.
- **FR-002**: System MUST use the configured default image profile when no image profile or image reference is provided.
- **FR-003**: System MUST fail with a clear error when both image profile and image reference are provided.
- **FR-004**: System MUST mount the current working directory to `/workdir` when no explicit mappings are provided.
- **FR-005**: System MUST preserve host UID/GID ownership for files created in sessions.
- **FR-006**: System MUST mount `${HOME}/.codex/auth.json` into the session working directory when the file exists.
- **FR-007**: System MUST provide deterministic install, compile, and test commands documented for maintainers.
- **FR-008**: System MUST use deterministic tools for formatting, compilation, and code generation where applicable.

### Key Entities *(include if feature involves data)*

- **Session**: A single run of the agent in a container with resolved image and mappings.
- **Image Profile**: A named image selection used when specified or when defaulted.
- **Image Reference**: A direct image identifier supplied explicitly for a session.
- **Workspace Mapping**: The host directory mounted to `/workdir` when defaults apply.
- **Auth File Mount**: The optional `${HOME}/.codex/auth.json` file made available in-session.
- **Host Identity**: The UID/GID of the current user used for session file ownership.

### Assumptions

- The existing wrapper/cli module already starts sessions and reads configuration.
- Podman is installed and accessible on the developer machine.

### Out of Scope

- Adding new container runtimes or multi-user capabilities.
- Redesigning the CLI command surface beyond the behaviors listed above.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of session starts without explicit mappings mount the host working directory at `/workdir`.
- **SC-002**: 100% of sessions started with a default image profile and no explicit image override use the default profile.
- **SC-003**: In a clean environment, install + compile completes in under 5 minutes for a single maintainer.
- **SC-004**: All required unit tests run and pass in under 60 seconds on a typical developer machine.
