# Feature Specification: Named Volume Configuration for viber-cli

**Feature Branch**: `006-named-volume-config`  
**Created**: 2026-02-08  
**Status**: Draft  
**Input**: User description: "Add option to store selected directories in container in named volume it should have default global config profile config and project config in form of set volumeName: path pairs to viber-cli"
**Constitution Guardrails**: Keep scope to primary use cases; reuse proven OSS; define clear module contracts; include minimal unit tests that prove core behavior works; prefer deterministic tools over LLM transformations.

## Clarifications

### Session 2026-02-08

- Q: How should the system ensure volume isolation when multiple projects use the same volume name? → A: Volume names are user-defined with manual scoping - developers must add project identifiers themselves if they want isolation
- Q: Should named volumes be a separate config section or extend the existing mappings structure? → A: New unified volumeMappings section replaces mappings for volume-backed paths, with migration from old mappings format and warnings for legacy usage
- Q: Should volume configurations be part of existing imageProfiles or a separate profile system? → A: Volume configs only at global/project level - no profile-specific volumes (profile generalization deferred to future work)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Configure Project-Level Named Volumes (Priority: P1)

A developer wants to persist specific directories (like node_modules, build cache, or database data) across container restarts within a single project. They define named volumes at the project level to speed up builds and preserve state.

**Why this priority**: This is the core use case that directly solves the persistence problem for project-specific data. Without this, developers lose all cached and generated files on container restart, causing significant delays.

**Independent Test**: Can be fully tested by creating a project config file, defining one volume mapping (e.g., "node_modules_cache: /app/node_modules"), starting a container, verifying the volume is created and mounted, and confirming data persists after container restart.

**Acceptance Scenarios**:

1. **Given** a project with a viber-cli configuration file, **When** a developer defines a volume mapping (volumeName: path), **Then** the named volume is created and mounted to the specified path in the container
2. **Given** a container running with configured named volumes, **When** the container is stopped and restarted, **Then** all data in the named volumes persists across restarts
3. **Given** multiple projects using the same volume name, **When** each project is run, **Then** they share the same named volume data (developers must manually scope names for isolation)

---

### User Story 2 - Configure Global Named Volumes (Priority: P2)

A developer wants to share certain directories (like package caches or tool installations) across all projects on their system. They configure global named volumes that apply to every container unless overridden.

**Why this priority**: This provides significant efficiency gains by allowing cache sharing across projects, but individual projects can still function without it. It's a performance optimization rather than a core requirement.

**Independent Test**: Can be tested by setting a global volume configuration, running containers from different projects, and verifying that they all share access to the same named volume data.

**Acceptance Scenarios**:

1. **Given** a global configuration file with volume mappings, **When** any project container starts, **Then** the global volumes are automatically mounted unless overridden by project config
2. **Given** shared package cache volumes, **When** multiple projects install dependencies, **Then** they reuse cached packages from the shared volume, reducing download time
3. **Given** both global and project configs defining volumes for the same path, **When** a container starts, **Then** the project-level configuration takes precedence

---

### User Story 3 - Default Named Volume Behavior (Priority: P1)

A developer using viber-cli for the first time without any configuration should have sensible default behavior that works out of the box, even if no custom volumes are configured.

**Why this priority**: This ensures new users have a working system immediately and understand the baseline behavior before customizing.

**Independent Test**: Can be tested by starting viber-cli without any configuration files and verifying that containers start successfully with documented default volume behavior (or no volumes if that's the default).

**Acceptance Scenarios**:

1. **Given** no configuration files exist, **When** a developer starts a container, **Then** the system uses default volume behavior as documented
2. **Given** default behavior is documented, **When** a developer reads the documentation, **Then** they understand what volumes (if any) are created by default
3. **Given** default volume behavior, **When** a developer later adds custom configuration, **Then** their custom config overrides defaults as expected

---

### Edge Cases

- What happens when a volume name conflicts between configuration levels (global vs project)?
- How does the system handle invalid path specifications (missing directories, permission issues)?
- What happens if a named volume already exists but with different settings?
- What happens if a configuration file specifies the same target path for multiple volume mappings?
- How does the system handle very long volume names or paths with special characters?
- What happens when a volume is still in use by another container?
- How does migration handle edge cases like partial configs or configs with both old and new format?
- What happens if a user manually edits a migrated config back to the old format?
- How are warnings displayed in non-interactive or scripted environments?

## Testing Requirements *(mandatory)*

- **Test 1: Basic Volume Persistence** - Create a project config with one named volume, write data to the mounted path, restart the container, verify data persists
- **Test 2: Configuration Hierarchy** - Set up global and project configs with overlapping volume definitions, verify project config takes precedence
- **Test 3: Volume Sharing** - Create two projects using the same volume name, verify they share data; create another project with a manually scoped name (e.g., "projectA-cache"), verify it has isolated data
- **Test 4: Invalid Configuration Handling** - Provide malformed volume configurations (invalid paths, duplicate mappings, missing names), verify clear error messages
- **Test 5: Legacy Migration** - Load a config with old "mappings" format, verify warning is displayed, write config and verify it uses new "volumeMappings" format
- **Test 6: Unified Mapping Types** - Define both bind mounts (sourcePath) and named volumes (volumeName) in volumeMappings, verify both work correctly

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to define volume mappings with either volumeName:targetPath (named volume) or sourcePath:targetPath (bind mount) pairs in configuration files
- **FR-002**: System MUST support two configuration levels: global and project, with project taking precedence over global
- **FR-003**: System MUST create and mount volumes automatically when a container starts based on active configuration
- **FR-004**: System MUST persist data in named volumes across container restarts and deletions
- **FR-005**: System MUST validate volume configuration syntax before applying it and provide clear error messages for invalid configurations
- **FR-006**: System MUST allow users to specify multiple volume mappings at each configuration level
- **FR-007**: System MUST merge volume configurations from both levels, with project-level taking highest precedence
- **FR-008**: System MUST document the default volume behavior when no configuration is provided
- **FR-009**: System MUST handle path conflicts gracefully when the same container path is specified multiple times
- **FR-010**: System MUST support standard path formats for volume names, source paths, and target paths
- **FR-011**: System MUST provide commands or options to view active volume configuration for the current context
- **FR-012**: Developers MAY manually scope volume names (e.g., "projectA-cache") to achieve isolation between projects; identical volume names across projects share the same underlying volume
- **FR-013**: System MUST detect legacy "mappings" configuration format and automatically migrate to new "volumeMappings" format when writing configuration
- **FR-014**: System MUST display a deprecation warning when loading configuration files using the legacy "mappings" format
- **FR-015**: System MUST support both bind mounts and named volumes within the unified volumeMappings structure

### Key Entities

- **Volume Mapping**: Represents a mount configuration that can be either a bind mount (sourcePath→targetPath) or a named volume (volumeName→targetPath). Attributes include: volume name (optional string), source path (optional string), target path (string), mode (rw/ro), configuration source (global/project). Exactly one of volumeName or sourcePath must be specified.
- **Configuration Level**: Hierarchical layer where volume mappings can be defined. Two levels: global (system-wide via ~/.viber/config.json) and project (directory-specific via .viber.json). Project level has highest priority for conflict resolution.
- **Legacy Mapping**: Old-style folder mapping (sourcePath + targetPath without volumeName). System must detect, migrate on write, and warn on read for backward compatibility.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Developers can configure project-level named volumes in under 2 minutes by adding volumeName:path pairs to a configuration file
- **SC-002**: Data persists in named volumes across 100% of container restarts and recreations
- **SC-003**: Configuration hierarchy (project > global) resolves correctly in 100% of test cases with overlapping definitions
- **SC-004**: Container startup time with configured volumes completes within 5 seconds of baseline startup time (minimal overhead)
- **SC-005**: Volume sharing behavior is correctly implemented - projects using identical volume names share data in 100% of tested scenarios
- **SC-006**: Invalid configuration produces clear, actionable error messages that developers can resolve without consulting documentation in 90% of cases
- **SC-007**: System handles at least 20 named volume mappings per project without performance degradation

## Assumptions

- Configuration files use JSON format (.viber.json for project, ~/.viber/config.json for global) with Zod schema validation
- Global configuration is stored in user's home directory at ~/.viber/config.json
- Project configuration is stored in the project's root directory as .viber.json
- Named volumes are created using the container runtime's standard volume management system
- Volume names follow container runtime naming conventions (alphanumeric, hyphens, underscores)
- Developers have appropriate permissions to create and manage volumes in their container environment
- Volume names are globally shared - identical volume names across projects refer to the same underlying volume (developers must manually add project identifiers if isolation is needed)
- Default behavior (when no config exists) uses the existing defaultMappings behavior from global config
- Volume data lifecycle is managed by the user through container runtime tools (not auto-deleted by viber-cli)
- Configuration changes require container restart to take effect
- Legacy "mappings" field will be supported indefinitely for reading, but new configs use "volumeMappings"
- Migration from "mappings" to "volumeMappings" preserves all existing bind mount functionality
- Profile-level volume configuration is out of scope for this feature (deferred to future profile generalization work)

## Out of Scope

- Automatic volume cleanup or garbage collection
- Volume data migration between different volume names
- Volume encryption or security policies (handled by container runtime)
- Volume backup and restore functionality
- Cross-machine volume synchronization
- Volume size limits or quota management
- GUI or interactive configuration editor (CLI-based configuration only)
- Volume performance monitoring or analytics
- Automatic volume optimization or defragmentation
- Profile-level volume configuration (deferred to future profile system generalization)
