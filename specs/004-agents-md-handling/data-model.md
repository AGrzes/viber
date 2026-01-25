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
  - `agentsRef` (string | undefined)
- **Rules**:
  - `agents` is the project text when a string is present
  - `agents` set to null explicitly excludes global content
  - `agentsRef` stores the referenced global name when set

### ActiveAgentSelection

- **Fields**:
  - `selectedName` (string | null)
  - `noGlobal` (boolean)
- **Rules**:
  - Precedence: CLI selection, then project `agentsRef`, then global `default` entry
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
- `ProjectAgents.agentsRef` references a `GlobalAgents` name.
- `GeneratedAgentFile` is derived from `ActiveAgentSelection` and `ProjectAgents.agents`.
