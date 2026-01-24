# Data Model: Viber CLI Private Orchestration Framework

## Entities

### Project
- **Represents**: A local workspace with an optional project configuration.
- **Fields**: `rootPath`, `configPath` (optional), `name` (optional).
- **Relationships**: Has zero or one Project Configuration.

### Project Configuration
- **Represents**: Project-specific settings.
- **Fields**:
  - `mappings` (list of Folder Mapping)
  - `imageProfile` (optional, string; mutually exclusive with `imageReference`)
  - `imageReference` (optional, string; mutually exclusive with `imageProfile`)
  - `skillsPalette` (optional reference to Skills Palette)
  - `networkPolicy` (optional; if set overrides runtime default)
- **Validation rules**:
  - Exactly one of `imageProfile` or `imageReference` MAY be set (or neither if global default applies).
  - `mappings` must have unique `targetPath` per entry.

### Global Configuration
- **Represents**: User-wide defaults stored locally.
- **Fields**:
  - `defaultImageProfile` (optional)
  - `defaultMappings` (list of Folder Mapping)
  - `imageProfiles` (list of Image Profile)
  - `skillsPalettes` (list of Skills Palette)
- **Relationships**: Owns image profiles and skills palettes.

### Folder Mapping
- **Represents**: A host path mounted into a session.
- **Fields**:
  - `sourcePath`
  - `targetPath` (optional; defaults to same as source)
  - `mode` (enum: `rw`, `ro`)
  - `label` (optional)
- **Validation rules**: `sourcePath` must exist; `mode` must be one of `rw` or `ro`.

### Image Profile
- **Represents**: A named image environment definition.
- **Fields**:
  - `name` (unique)
  - `baseImageRef`
  - `notes` (optional)
  - `buildSteps` (optional list of human-readable steps)
- **Validation rules**: `name` must be unique within Global Configuration.

### Image Reference
- **Represents**: A direct container image identifier.
- **Fields**: `imageRef` (string, required).

### Skills Palette
- **Represents**: A named set of reusable skills.
- **Fields**: `name`, `entries` (list of skill identifiers or labels).
- **Validation rules**: `name` must be unique within Global Configuration.

### Session
- **Represents**: A launched interactive or one-off agent session.
- **Fields**: `id`, `mode` (interactive/one-off), `imageSource` (profile or reference), `mappings`, `status`.
- **State transitions**: `planned` → `running` → `exited` or `failed`.

## Relationships Summary
- Global Configuration contains many Image Profiles and Skills Palettes.
- Project Configuration may reference one Image Profile or one Image Reference.
- Project Configuration uses Folder Mappings; Global Configuration can provide default mappings.

## Derived Rules
- If no Project Configuration exists, use Global Configuration plus implicit mapping of current directory.
- If both Project and Global values exist, Project overrides Global.
