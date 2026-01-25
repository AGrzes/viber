# Data Model: AGENTS.md Handling

## Entities

### GlobalAgentContent

- **Fields**:
  - `name` (string, case-sensitive, unique)
  - `content` (string, may be empty but persisted)
  - `isDefault` (boolean)
- **Validation**:
  - `name` must be unique by exact match
  - At most one entry marked as default

### GlobalAgentConfig

- **Fields**:
  - `entries` (map of `name` → `GlobalAgentContent`)
  - `defaultName` (string or null)
- **Rules**:
  - `defaultName` must refer to an existing entry when set

### ProjectAgentConfig

- **Fields**:
  - `content` (string or null)
  - `globalSelectionName` (string or null)
  - `skipGlobal` (boolean)
- **Rules**:
  - `globalSelectionName` may be null to indicate explicit no default
  - `skipGlobal` suppresses global content

### ActiveAgentSelection

- **Fields**:
  - `selectedName` (string or null)
  - `skipGlobal` (boolean)
- **Rules**:
  - Precedence: CLI selection, then project config, then global default
  - Conflicting CLI selection and skip-global is an error

### GeneratedAgentFile

- **Fields**:
  - `path` (string)
  - `content` (string)
  - `createdAt` (timestamp)
- **Rules**:
  - Created only when global or project content exists
  - Content order: global first, then project

## Relationships

- `GlobalAgentConfig` owns multiple `GlobalAgentContent` entries.
- `ProjectAgentConfig` references zero or one `GlobalAgentContent` by name.
- `ActiveAgentSelection` resolves to at most one `GlobalAgentContent` plus optional `ProjectAgentConfig.content`.
- `GeneratedAgentFile` is derived from `ActiveAgentSelection` and `ProjectAgentConfig`.
