# Feature Specification: Named Volume Configuration for viber-cli

**Feature Branch**: `006-named-volume-config`  
**Created**: 2026-02-08  
**Status**: Draft  
**Input**: User description: "Add option to store selected directories in container in named volume it should have default global config profile config and project config in form of set volumeName: path pairs to viber-cli"
**Constitution Guardrails**: Keep scope to primary use cases; reuse proven OSS; define clear module contracts; include minimal unit tests that prove core behavior works; prefer deterministic tools over LLM transformations.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Configure Project-Level Named Volumes (Priority: P1)

A developer wants to persist specific directories (like node_modules, build cache, or database data) across container restarts within a single project. They define named volumes at the project level to speed up builds and preserve state.

**Why this priority**: This is the core use case that directly solves the persistence problem for project-specific data. Without this, developers lose all cached and generated files on container restart, causing significant delays.

**Independent Test**: Can be fully tested by creating a project config file, defining one volume mapping (e.g., "node_modules_cache: /app/node_modules"), starting a container, verifying the volume is created and mounted, and confirming data persists after container restart.

**Acceptance Scenarios**:

1. **Given** a project with a viber-cli configuration file, **When** a developer defines a volume mapping (volumeName: path), **Then** the named volume is created and mounted to the specified path in the container
2. **Given** a container running with configured named volumes, **When** the container is stopped and restarted, **Then** all data in the named volumes persists across restarts
3. **Given** multiple projects with different named volumes, **When** each project is run, **Then** each project uses its own isolated named volumes without conflicts

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

### User Story 3 - Configure Profile-Based Named Volumes (Priority: P3)

A developer works in different contexts (personal, work, client A, client B) and wants different volume configurations for each profile. They can switch between profiles to use different sets of named volumes.

**Why this priority**: This adds flexibility for advanced use cases but isn't essential for basic functionality. Most developers can manage with project and global configs.

**Independent Test**: Can be tested by creating multiple profiles with different volume configurations, activating each profile, and verifying that the correct volumes are used for that profile.

**Acceptance Scenarios**:

1. **Given** multiple profiles defined with different volume configurations, **When** a developer activates a specific profile, **Then** containers use the volume mappings defined for that profile
2. **Given** an active profile with volume configurations, **When** a project also has local volume config, **Then** the system merges configurations with priority: project > profile > global > default
3. **Given** a developer switching between profiles, **When** they start containers in different profiles, **Then** each uses the appropriate named volumes without manual intervention

---

### User Story 4 - Default Named Volume Behavior (Priority: P1)

A developer using viber-cli for the first time without any configuration should have sensible default behavior that works out of the box, even if no custom volumes are configured.

**Why this priority**: This ensures new users have a working system immediately and understand the baseline behavior before customizing.

**Independent Test**: Can be tested by starting viber-cli without any configuration files and verifying that containers start successfully with documented default volume behavior (or no volumes if that's the default).

**Acceptance Scenarios**:

1. **Given** no configuration files exist, **When** a developer starts a container, **Then** the system uses default volume behavior as documented
2. **Given** default behavior is documented, **When** a developer reads the documentation, **Then** they understand what volumes (if any) are created by default
3. **Given** default volume behavior, **When** a developer later adds custom configuration, **Then** their custom config overrides defaults as expected

---

### Edge Cases

- What happens when a volume name conflicts between configuration levels (global vs profile vs project)?
- How does the system handle invalid path specifications (missing directories, permission issues)?
- What happens if a named volume already exists but with different settings?
- How are volume mappings handled when switching between profiles mid-session?
- What happens if a configuration file specifies the same local path for multiple volume names?
- How does the system handle very long volume names or paths with special characters?
- What happens when a volume is still in use by another container?

## Testing Requirements *(mandatory)*

- **Test 1: Basic Volume Persistence** - Create a project config with one named volume, write data to the mounted path, restart the container, verify data persists
- **Test 2: Configuration Hierarchy** - Set up default, global, profile, and project configs with overlapping volume definitions, verify project config takes precedence
- **Test 3: Volume Isolation** - Create two projects with different volume names pointing to similar paths, verify data doesn't leak between projects
- **Test 4: Invalid Configuration Handling** - Provide malformed volume configurations (invalid paths, duplicate mappings, missing names), verify clear error messages
- **Test 5: Profile Switching** - Create two profiles with different volume configs, switch between them, verify correct volumes are mounted for each profile

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to define named volume mappings as volumeName:path pairs in configuration files
- **FR-002**: System MUST support four configuration levels: default, global, profile, and project, with clear precedence rules (project > profile > global > default)
- **FR-003**: System MUST create and mount named volumes automatically when a container starts based on active configuration
- **FR-004**: System MUST persist data in named volumes across container restarts and deletions
- **FR-005**: System MUST isolate named volumes between different projects to prevent data conflicts
- **FR-006**: System MUST validate volume configuration syntax before applying it and provide clear error messages for invalid configurations
- **FR-007**: System MUST allow users to specify multiple volume mappings at each configuration level
- **FR-008**: System MUST merge volume configurations from multiple levels, with project-level taking highest precedence
- **FR-009**: System MUST document the default volume behavior when no configuration is provided
- **FR-010**: System MUST allow profile switching without requiring manual volume reconfiguration
- **FR-011**: System MUST handle path conflicts gracefully when the same container path is specified multiple times
- **FR-012**: System MUST support standard path formats for both volume names and container paths
- **FR-013**: System MUST provide commands or options to view active volume configuration for the current context

### Key Entities

- **Volume Mapping**: Represents a pair of volumeName (unique identifier for the named volume) and path (mount point in container). Attributes include: volume name (string), container path (string), configuration source (default/global/profile/project)
- **Configuration Profile**: A named set of volume mappings and other settings. Attributes include: profile name, volume mappings collection, active/inactive status
- **Configuration Level**: Hierarchical layer where volume mappings can be defined. Four levels: default (built-in), global (system-wide), profile (context-specific), project (directory-specific). Each level has priority for conflict resolution

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Developers can configure project-level named volumes in under 2 minutes by adding volumeName:path pairs to a configuration file
- **SC-002**: Data persists in named volumes across 100% of container restarts and recreations
- **SC-003**: Configuration hierarchy (project > profile > global > default) resolves correctly in 100% of test cases with overlapping definitions
- **SC-004**: Container startup time with configured volumes completes within 5 seconds of baseline startup time (minimal overhead)
- **SC-005**: Volume isolation prevents data leakage between projects in 100% of tested scenarios
- **SC-006**: Invalid configuration produces clear, actionable error messages that developers can resolve without consulting documentation in 90% of cases
- **SC-007**: Developers can successfully switch between profiles and have correct volumes mounted without manual intervention in 100% of profile switches
- **SC-008**: System handles at least 20 named volume mappings per project without performance degradation

## Assumptions

- Configuration files use a standard format (JSON, YAML, or TOML) that supports key-value pairs
- Global configuration is stored in a user's home directory or system-wide location accessible across all projects
- Profile configurations are stored alongside global config with profile-specific naming
- Project configuration is stored in the project's root directory
- Named volumes are created using the container runtime's standard volume management system
- Volume names follow container runtime naming conventions (alphanumeric, hyphens, underscores)
- Developers have appropriate permissions to create and manage volumes in their container environment
- The same volume name can be reused across projects but will be treated as separate volumes (project isolation)
- Default behavior (when no config exists) is to not create any automatic named volumes, requiring explicit opt-in
- Volume data lifecycle is managed by the user through container runtime tools (not auto-deleted by viber-cli)
- Configuration changes require container restart to take effect
- The system uses the last-write-wins approach for configuration file updates

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
