# Data Model: Wrapper CLI Refactor

## Entities

### Session
- **Represents**: A single container run with resolved image, mappings, and identity options.
- **Fields**:
  - `mode` (interactive/one-off)
  - `imageProfile` (optional)
  - `imageReference` (optional)
  - `mappings` (list of Workspace Mapping)
  - `uid` / `gid` (host identity)
  - `usernsMode` (keep-id)
  - `authMount` (optional Auth File Mount)
- **Validation rules**:
  - Exactly one of `imageProfile` or `imageReference` may be set (or neither if default profile applies).

### Image Profile
- **Represents**: A named image selection.
- **Fields**: `name`, `baseImageRef`.
- **Validation rules**: A profile named `default` is used when no image is specified.

### Image Reference
- **Represents**: Direct image identifier provided explicitly.
- **Fields**: `imageRef`.

### Workspace Mapping
- **Represents**: Host directory mounted into container.
- **Fields**: `sourcePath`, `targetPath`, `mode`.
- **Validation rules**: If no explicit mappings, mount current working directory to `/workdir`.

### Auth File Mount
- **Represents**: Optional auth file in the workspace.
- **Fields**: `sourcePath` (`${HOME}/.codex/auth.json`), `targetPath` (`/workdir/.codex/auth.json`).

### Host Identity
- **Represents**: Current user identity for file ownership.
- **Fields**: `uid`, `gid`, `usernsMode`.

## Relationships Summary
- Session uses Image Profile or Image Reference.
- Session includes one or more Workspace Mappings.
- Session may include an Auth File Mount if present.
