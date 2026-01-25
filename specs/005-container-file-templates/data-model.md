# Data Model: Container File Templates

## Template Definition
- **Description**: A named configuration object defining how to generate a file and where to place it inside the container.
- **Fields**:
  - `name` (string): Unique identifier for the template within the merged set.
  - `path` (string): Container destination path, which may include `${ENV_VAR}` placeholders that must resolve before mounting.
  - `template` (string): Handlebars-compatible content to render using `parameters`.
  - `parameters` (object): Arbitrary key-value map provided to the template renderer; values may be nested objects.
- **Validation**:
  - `name`, `path`, and `template` are required; absence triggers a merge-time error.
  - `path` must resolve to an absolute container path after variable substitution (no empty segments).
  - `parameters` defaults to `{}` if omitted.
- **Lifecycle**:
  1. Collected from local/global configs.
  2. Deep-merged by `name` with local overrides.
  3. Rendered via Handlebars using `parameters`.
  4. Written to a temporary file and mounted into the container at the resolved `path`.

## Template Set
- **Description**: Combined collection of template definitions from global and local configs, minus suppressed names.
- **Relationships**: Contains multiple `Template Definition` entities.
- **Validation**:
  - Merge order ensures local values override global ones for duplicated `name` keys.
  - Templates listed in the suppression list are excluded before rendering.

## Suppression List
- **Description**: Runtime directive supplied via CLI arguments to omit specific templates.
- **Fields**:
  - `templates` (array of strings): Template `name`s to skip.
- **Lifecycle**: Applied after configs merge but before rendering to prevent temporary files for suppressed templates.

## Rendered File
- **Description**: Temporary filesystem artifact produced per template and mounted into the container.
- **Fields**:
  - `templateName` (string)
  - `tempPath` (filesystem path under the host's temp directory)
  - `containerPath` (resolved destination inside the container)
- **Validation**:
  - `tempPath` creation must succeed, and filesystem cleanup happens after container tear-down.
  - `containerPath` must exist within the container's permitted mount roots.
