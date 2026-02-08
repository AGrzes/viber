# Volume Mapping Contracts

## Zod Schema Definitions

**Purpose**: Type-safe configuration validation for volume mappings.

### VolumeMappingSchema

```typescript
import { z } from 'zod'

export const VolumeMappingSchema = z.object({
  volumeName: z.string().min(1).optional(),
  sourcePath: z.string().min(1).optional(),
  targetPath: z.string().min(1),
  mode: z.enum(['rw', 'ro']),
  label: z.string().optional(),
}).refine(
  (data) => (data.volumeName && !data.sourcePath) || (!data.volumeName && data.sourcePath),
  {
    message: 'Must specify either volumeName or sourcePath, not both',
  }
)

export type VolumeMapping = z.infer<typeof VolumeMappingSchema>
```

**Validation Rules**:
- `volumeName`: Optional string (min length 1) - for named volumes
- `sourcePath`: Optional string (min length 1) - for bind mounts
- `targetPath`: Required string (min length 1) - container mount point
- `mode`: Required enum - either 'rw' or 'ro'
- `label`: Optional string - human-readable description
- **Refine**: Exactly one of volumeName or sourcePath must be present

---

### VolumeMappingsCollectionSchema

```typescript
export const VolumeMappingsCollectionSchema = z.record(
  z.string().min(1), 
  VolumeMappingSchema
)

export type VolumeMappingsCollection = z.infer<typeof VolumeMappingsCollectionSchema>
```

**Validation Rules**:
- Keys: Non-empty strings (target paths)
- Values: Valid `VolumeMapping` objects
- Structure: JavaScript object/map

---

### Updated ProjectConfigSchema

```typescript
export const ProjectConfigSchema = z.object({
  templates: z.array(TemplateDefinitionSchema).optional(),
  agents: z.string().nullable().optional(),
  agentsRef: z.string().optional(),
  envMappings: z.array(EnvMappingEntrySchema).optional(),
  
  // Legacy (deprecated)
  mappings: z.array(FolderMappingSchema).optional(),
  
  // New
  volumeMappings: VolumeMappingsCollectionSchema.optional(),
  
  imageProfile: z.string().optional(),
  imageReference: z.string().optional(),
  skillsPalette: z.string().optional(),
  networkPolicy: z.string().optional(),
}).refine(
  (value) => !(value.imageProfile && value.imageReference),
  'imageProfile and imageReference are mutually exclusive'
)
```

---

### Updated GlobalConfigSchema

```typescript
export const GlobalConfigSchema = z.object({
  templates: z.array(TemplateDefinitionSchema).optional(),
  agents: z.record(z.string()).optional(),
  envMappings: z.array(EnvMappingEntrySchema).optional(),
  
  // Legacy (deprecated)
  defaultMappings: z.array(FolderMappingSchema).optional(),
  
  // New
  volumeMappings: VolumeMappingsCollectionSchema.optional(),
  
  defaultImageProfile: z.string().optional(),
  imageProfiles: z.array(ImageProfileSchema).optional(),
  skillsPalettes: z.array(SkillsPaletteSchema).optional(),
})
```

---

### ResolvedConfig (no changes to schema)

```typescript
// effectiveMappings already exists as FolderMapping[]
// Internal merge logic converts volumeMappings map → array
export const ResolvedConfigSchema = z.object({
  // ... existing fields ...
  effectiveMappings: z.array(FolderMappingSchema),
  // ... rest ...
})
```

---

## API Contract

### Config Resolution Interface

```typescript
/**
 * Merge global and project volume mappings
 * 
 * @param globalMappings - Global-level volumeMappings (map format)
 * @param projectMappings - Project-level volumeMappings (map format)
 * @returns Merged mappings with project overriding global by target path key
 */
function mergeVolumeMappings(
  globalMappings: VolumeMappingsCollection | undefined,
  projectMappings: VolumeMappingsCollection | undefined
): VolumeMappingsCollection {
  return {
    ...(globalMappings ?? {}),
    ...(projectMappings ?? {}),
  }
}

/**
 * Convert volumeMappings map to FolderMapping array for runner
 * 
 * @param mappings - VolumeMappingsCollection (map format)
 * @returns Array of FolderMapping for container runner
 */
function volumeMappingsToArray(
  mappings: VolumeMappingsCollection
): FolderMapping[] {
  return Object.values(mappings).map(m => ({
    sourcePath: m.volumeName ?? m.sourcePath!,
    targetPath: m.targetPath,
    mode: m.mode,
    label: m.label,
  }))
}
```

---

### Migration Contract

```typescript
/**
 * Migrate legacy mappings array to volumeMappings map
 * 
 * @param legacyMappings - Array of FolderMapping (old format)
 * @returns VolumeMappingsCollection (new format)
 */
function migrateLegacyMappings(
  legacyMappings: FolderMapping[]
): VolumeMappingsCollection {
  const result: VolumeMappingsCollection = {}
  
  for (const mapping of legacyMappings) {
    const targetPath = mapping.targetPath ?? mapping.sourcePath
    result[targetPath] = {
      sourcePath: mapping.sourcePath,
      targetPath,
      mode: mapping.mode,
      label: mapping.label,
    }
  }
  
  return result
}
```

---

## Error Contracts

### Validation Errors

```typescript
// Thrown by Zod when schema validation fails
type ZodError = {
  issues: Array<{
    code: string
    path: (string | number)[]
    message: string
  }>
}

// Example error messages:
// - "Must specify either volumeName or sourcePath, not both"
// - "String must contain at least 1 character(s)" (for empty targetPath)
// - "Invalid enum value. Expected 'rw' | 'ro'" (for invalid mode)
```

### Config File Errors

```typescript
// File not found (non-fatal - use defaults)
type ConfigNotFoundError = {
  path: string
  message: 'Config file not found'
}

// JSON parse error (fatal)
type ConfigParseError = {
  path: string
  message: string // From JSON.parse
}

// Schema validation error (fatal)
type ConfigValidationError = {
  path: string
  errors: ZodError
}
```

---

## Deprecation Warnings

```typescript
/**
 * Emit deprecation warning for legacy mappings format
 * 
 * @param configPath - Path to config file using legacy format
 */
function warnLegacyMappings(configPath: string): void {
  console.warn(
    `DEPRECATION: ${configPath} uses legacy "mappings" array format. ` +
    `Please migrate to "volumeMappings" object format. ` +
    `See documentation at [URL]. ` +
    `Auto-migration will occur on next config write.`
  )
}
```
