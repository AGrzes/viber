# Contracts: Container File Template Injection

## Configuration Contract
- **Source**: Local project config + shared global config.
- **Template Shape**:
  - `name` (string)
  - `path` (string with `${VAR}` placeholders)
  - `template` (Handlebars string)
  - `parameters` (object, optional)
- **Suppression Control**: CLI argument `--suppress template-name` accepts multiple entries to skip templates.
- **Merge Behavior**: Templates with identical `name`s are deep-merged (local overrides global); missing required fields after merge produce an error.

## Runtime Contract
- **Input**: Resolved template definitions + suppression list + current env variables.
- **Output**: Temporary file per template and corresponding container mount that maps `tempPath` → `containerPath`.
- **Error Handling**:
  - Missing `name`, `path`, or `template` after merge ⇒ fail before container launch.
  - Template rendering error ⇒ fail fast with context.
  - Unsupplied env var referenced in `path` ⇒ report missing variable.
