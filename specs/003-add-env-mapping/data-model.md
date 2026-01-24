# Data Model

## Entities

### EnvMappingEntry

- **key**: string, required; must match `[A-Za-z_][A-Za-z0-9_]*` (case-sensitive)
- **value**: string, required; empty string allowed

### EnvMappingSet

- **scope**: enum (`global`, `project`)
- **entries**: list of EnvMappingEntry

### ProjectConfig

- **envMappings**: EnvMappingSet (scope = `project`)
- **mappings**: existing folder mappings (unchanged)
- **imageProfile / imageReference**: existing image selection (unchanged)

### GlobalConfig

- **envMappings**: EnvMappingSet (scope = `global`)
- **defaultImageProfile / defaultMappings / imageProfiles / skillsPalettes**: existing fields (unchanged)

## Relationships

- A ProjectConfig may include one project-scoped EnvMappingSet.
- A GlobalConfig may include one global-scoped EnvMappingSet.
- Session env assembly merges global entries with project entries; project entries override key collisions.

## Validation Rules

- Keys must match `[A-Za-z_][A-Za-z0-9_]*`.
- Values are stored as-is; empty strings are valid.
- Project scope operations require a resolved project config; otherwise fail.

## State Transitions

- **set**: create or update a key in the target scope.
- **delete**: remove a key from the target scope.
- **get**: retrieve a key value if present; otherwise report missing.
- **list**: return all keys in the target scope.

## Notes

- Mapping values may include host-variable interpolation at session start (e.g., `E1=$HOST_VAR`).
