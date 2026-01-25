# Data Model: AGENTS.md Handling

## Entities

### GlobalAgents

- **Fields**:
  - `agents` (map of `name` → plain-text content)
- **Validation**:
  - `name` must be unique by exact, case-sensitive match

### ProjectAgents

- **Fields**:
  - `agents` (string | undefined | null)
- **Rules**:
  - `agents` is the project text when a plain string is present
  - `agents` set to null explicitly excludes global content
  - `agents` prefixed with `@ref:` stores a global reference name

### ActiveAgentSelection

- **Fields**:
  - `selectedName` (string | null)
  - `noGlobal` (boolean)
- **Rules**:
  - Precedence: CLI selection, then project reference, then global `default` entry
  - CLI no-global overrides project reference
  - Conflicting CLI selection and no-global is an error

### GeneratedAgentFile

- **Fields**:
  - `path` (string)
  - `content` (plain text)
  - `createdAt` (timestamp)
- **Rules**:
  - Created only when global or project content exists
  - Content order: global first, then project

## Relationships

- `GlobalAgents` owns multiple named entries.
- Project references are stored in `ProjectAgents.agents` with the `@ref:` prefix.
- `GeneratedAgentFile` is derived from `ActiveAgentSelection` and `ProjectAgents.agents`.
