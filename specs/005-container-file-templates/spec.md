# Feature Specification: Container File Templates

**Feature Branch**: `005-container-file-templates`  
**Created**: January 25, 2026  
**Status**: Draft  
**Input**: User description: "Now we want to be able to generate arbitrary files inside target container - The path in container should be defined in config - THe path in container should be able to use resolved env variables - THe config should define path and hendlebars template - The config should contain JS object to be used by template - The config should be merged between local and global - The file should be generated in temp and mounted - On command line level one should be able only to suppress some files Config shape templates: - name: string path: string template: string parameters: object Procedure - Gather all templates on both levels - Discard suppresed ones - Do deep merge by key - Render template - Save content to temp file - Calculate final path resolving envs - Add another mount to container spec"
**Constitution Guardrails**: Keep scope to primary use cases; reuse proven OSS; define clear module contracts; include minimal unit tests that prove core behavior works; prefer deterministic tools over LLM transformations.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Generate templated files for a container run (Priority: P1)

As a user, I want to define file templates and parameters in config so that each container run receives the expected files at the correct paths.

**Why this priority**: This delivers the core value of reliably injecting generated files into the target container.

**Independent Test**: Can be fully tested by configuring a single template and confirming the generated file is placed in the container path with rendered content.

**Acceptance Scenarios**:

1. **Given** a template definition with a name, path, template body, and parameters, **When** a container run is prepared, **Then** a rendered file is created and mounted at the resolved container path.
2. **Given** a template path that includes environment variable placeholders, **When** a container run is prepared with those variables defined, **Then** the final container path uses the resolved values.

---

### User Story 2 - Merge local and global template definitions (Priority: P2)

As a user, I want local templates to override or extend global templates so that project-specific needs are respected without duplicating shared configuration.

**Why this priority**: Enables reuse of shared templates while allowing local customization.

**Independent Test**: Can be fully tested by defining the same template name in global and local configs and confirming the merged result is used.

**Acceptance Scenarios**:

1. **Given** matching template names in global and local configs, **When** templates are gathered, **Then** a deep-merged template is used with local values taking precedence for conflicting fields.

---

### User Story 3 - Suppress unwanted templates via CLI (Priority: P3)

As a user, I want to suppress specific templates from being generated so I can opt out of certain files without changing config.

**Why this priority**: Provides a safe and quick way to skip files in different environments or runs.

**Independent Test**: Can be fully tested by suppressing a template name and confirming it is excluded from generation and mounting.

**Acceptance Scenarios**:

1. **Given** a suppression list provided at command line, **When** templates are processed, **Then** suppressed template names are excluded from rendering and mounting.

---

### Edge Cases

- What happens when a template references an environment variable that is not set?
- How does the system handle invalid template syntax or missing required parameters?
- What happens when two templates share a name but one omits a required field after merge?

## Testing Requirements *(mandatory)*

- Rendered file content matches the template output for a single template with parameters.
- Suppressed templates are not rendered or mounted even if present in global or local config.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST gather template definitions from both global and local configuration sources.
- **FR-002**: System MUST support template definitions with fields: name, path, template body, and parameters object.
- **FR-003**: System MUST discard templates whose names are explicitly suppressed at command line.
- **FR-004**: System MUST deep-merge templates by name, with local values taking precedence over global values for conflicts.
- **FR-005**: System MUST render templates using the provided parameters object.
- **FR-006**: System MUST write rendered output to a temporary file prior to container launch.
- **FR-007**: System MUST resolve environment variable placeholders in the container path before mounting.
- **FR-008**: System MUST add a mount entry so the generated temporary file appears at the resolved path in the target container.
- **FR-009**: System MUST surface a clear error when a required template field is missing after merge.
- **FR-010**: System MUST surface a clear error when template rendering fails.

### Key Entities *(include if feature involves data)*

- **Template Definition**: Named configuration entry containing container path, template body, and parameters.
- **Template Set**: The combined global and local collections of template definitions.
- **Suppression List**: Names of templates excluded for a specific run.
- **Rendered File**: The temporary file produced from a template and its final resolved container path.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: For a run with up to 20 templates, all non-suppressed templates are rendered and mounted successfully in a single run.
- **SC-002**: 100% of paths containing defined environment variables resolve to the expected container paths.
- **SC-003**: At least 95% of users can complete a run with templated files on the first attempt without manual intervention.
- **SC-004**: Support requests related to missing or mis-rendered generated files decrease by 50% within one release cycle.

## Assumptions

- The suppression list provided at command line identifies templates by name.
- Environment variables used in paths are expected to be defined for the run; missing variables produce a clear error.
- Temporary files created for mounting are cleaned up after the run completes.

## Dependencies

- Global and local configuration sources are accessible at run preparation time.
