# Data Model: Named Volume Configuration

**Date**: 2026-02-08  
**Feature**: 006-named-volume-config

## Entity Overview

This feature introduces map-based volume configuration with backward compatibility for array-based bind mounts.

---

## Core Entities

### VolumeMapping

**Description**: Represents a single mount configuration - either a named volume or bind mount.

**Schema** (TypeScript/Zod):
```typescript
{
  volumeName?: string     // Present for named volumes (e.g., "node_modules_cache")
  sourcePath?: string     // Present for bind mounts (e.g., "/host/path")
  targetPath: string      // Mount point in container (e.g., "/app/node_modules")
  mode: 'rw' | 'ro'       // Read-write or read-only
  label?: string          // Optional human-readable description
}
```

**Validation Rules**:
- Exactly one of `volumeName` or `sourcePath` must be specified
- `targetPath` must be non-empty absolute path
- `mode` must be 'rw' or 'ro'

**State Transitions**: N/A (immutable config data)

**Relationships**:
- Contained in: `VolumeMappingsCollection`
- Used by: `PodmanRunOptions.mappings`

---

### VolumeMappingsCollection

**Description**: Map/object keyed by target path containing volume mappings. Enables simple merge by target path key.

**Schema** (TypeScript/Zod):
```typescript
Record<string, VolumeMapping>
// Example:
{
  "/app/node_modules": {
    volumeName: "project-a-node-modules",
    targetPath: "/app/node_modules",
    mode: "rw"
  },
  "/cache": {
    volumeName: "build-cache",
    targetPath: "/cache",
    mode: "rw"
  }
}
```

**Validation Rules**:
- Keys must be non-empty strings (target paths)
- Keys should match `targetPath` field in value (enforced during resolution)
- No duplicate keys (guaranteed by object structure)

**Relationships**:
- Contains: Multiple `VolumeMapping` entities
- Stored in: `ProjectConfig.volumeMappings`, `GlobalConfig.volumeMappings`
- Merged into: `ResolvedConfig.effectiveMappings`

---

### LegacyMapping (Deprecated)

**Description**: Old array-based folder mapping format. Supported for backward compatibility.

**Schema** (TypeScript/Zod):
```typescript
{
  sourcePath: string
  targetPath?: string
  mode: 'rw' | 'ro'
  label?: string
}
```

**Migration Path**:
1. Read: Detect `Array.isArray(config.mappings)`
2. Convert: Transform to `VolumeMappingsCollection` using `targetPath || sourcePath` as key
3. Warn: Emit deprecation warning to user
4. Write: Remove `mappings` field, save as `volumeMappings` object

**Relationships**:
- Stored in: `ProjectConfig.mappings` (deprecated), `GlobalConfig.defaultMappings` (deprecated)
- Migrates to: `VolumeMappingsCollection`

---

### ProjectConfig

**Description**: Project-level configuration (.viber.json).

**Relevant Fields**:
```typescript
{
  // ... existing fields (templates, agents, etc.) ...
  mappings?: LegacyMapping[]                      // @deprecated
  volumeMappings?: VolumeMappingsCollection       // [NEW]
  // ... rest of config ...
}
```

**Changes**:
- Add optional `volumeMappings` field (map format)
- Keep `mappings` as deprecated optional field for backward compatibility

---

### GlobalConfig

**Description**: Global configuration (~/.viber/config.json).

**Relevant Fields**:
```typescript
{
  // ... existing fields ...
  defaultMappings?: LegacyMapping[]               // @deprecated
  volumeMappings?: VolumeMappingsCollection       // [NEW]
  // ... rest of config ...
}
```

**Changes**:
- Add optional `volumeMappings` field (map format)
- Keep `defaultMappings` as deprecated optional field for backward compatibility

---

### ResolvedConfig

**Description**: Merged configuration combining global and project configs.

**Relevant Fields**:
```typescript
{
  // ... existing fields ...
  effectiveMappings: FolderMapping[]              // Final merged array for runner
  // Internally: volumeMappings map is converted to array and merged
}
```

**Merge Logic**:
```
1. Start with workdir mount (if configured)
2. Add defaultMappings (legacy global, if present)
3. Merge global.volumeMappings (convert map to array)
4. Merge project.volumeMappings (convert map to array, overrides global by target path)
5. Result: effectiveMappings array passed to container runner
```

---

## Relationships Diagram

```
GlobalConfig
  ├─ volumeMappings: VolumeMappingsCollection
  └─ defaultMappings: LegacyMapping[] [deprecated]

ProjectConfig
  ├─ volumeMappings: VolumeMappingsCollection
  └─ mappings: LegacyMapping[] [deprecated]

ResolvedConfig
  ├─ effectiveMappings: FolderMapping[]
  │    ↑
  │    │ (merged from)
  │    │
  ├─ global.volumeMappings + project.volumeMappings
  └─ (also includes workdir + defaultMappings if present)

PodmanRunOptions
  └─ mappings: FolderMapping[]
       ↑
       └─ (receives effectiveMappings from ResolvedConfig)
```

---

## Data Flow

1. **Config Load**:
   - Read `.viber.json` (ProjectConfig)
   - Read `~/.viber/config.json` (GlobalConfig)
   - If legacy `mappings`/`defaultMappings` exist: emit warning

2. **Migration** (if legacy detected):
   - Convert array to map using targetPath as key
   - Store in `volumeMappings` field (in-memory)

3. **Resolution**:
   - Start with workdir + defaultMappings (existing behavior)
   - Convert global.volumeMappings map → array
   - Convert project.volumeMappings map → array
   - Merge arrays (project overrides global if same targetPath)
   - Store in `ResolvedConfig.effectiveMappings`

4. **Runtime**:
   - Pass effectiveMappings to `buildPodmanArgs()`
   - For each mapping: detect volumeName vs sourcePath
   - Generate `-v` flags appropriately

5. **Config Write** (if user modifies config):
   - If `mappings` array exists, convert to `volumeMappings` map
   - Remove `mappings` field
   - Write JSON with new format

---

## Notes

- **Backward Compatibility**: Legacy `mappings` array coexists with new `volumeMappings` map during transition
- **Merge Strategy**: Simple object spread for map merge; last-write-wins for array merge
- **Performance**: O(n) merge where n = number of volume mappings (target: <20)
- **Validation**: Zod schemas enforce mutual exclusivity of volumeName/sourcePath at parse time
