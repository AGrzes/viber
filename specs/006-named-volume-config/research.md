# Research: Named Volume Configuration

**Date**: 2026-02-08  
**Feature**: 006-named-volume-config

## Test Framework Resolution

**Decision**: Vitest (already in use)

**Rationale**: 
- Project already uses Vitest (`vitest` package in devDependencies)
- Test command: `pnpm test` runs `vitest run`
- Existing test files use `.test.ts` convention in `tests/unit/` directory
- Vitest provides fast, TypeScript-native testing with good DX

**Alternatives Considered**:
- Jest: More mature but slower; would add unnecessary dependency
- Node's built-in test runner: Too minimal for existing codebase patterns

**Implementation Notes**:
- Place new tests in `cli/tests/unit/config/volumeMappings.test.ts`
- Follow existing test patterns from `tests/unit/templates/` and `tests/unit/sessionEnv.test.ts`

---

## Container Runtime Volume Integration

**Decision**: Podman `-v` flag with named volume syntax

**Rationale**:
- Existing code uses Podman via `cli/src/lib/podman/runner.ts`
- Current implementation: `-v sourcePath:targetPath:mode` for bind mounts
- Named volumes use same flag: `-v volumeName:targetPath:mode` (no leading `/` in volumeName)
- Podman automatically creates named volumes if they don't exist
- Named volumes persist across container deletions (unlike bind mounts of missing paths)

**Alternatives Considered**:
- Docker volumes API: Would require separate `docker volume create` calls (more complex)
- Tmpfs mounts: Don't persist across restarts (doesn't meet FR-006)

**Implementation Notes**:
- Modify `buildPodmanArgs()` in `runner.ts` to detect volumeName vs sourcePath
- If `volumeName` present (and no `sourcePath`): use `-v volumeName:targetPath:mode`
- If `sourcePath` present: use existing `-v sourcePath:targetPath:mode`
- No changes needed to spawn/exec logic - same Podman interface

---

## Map-Based Config Storage Pattern

**Decision**: Use TypeScript `Record<string, T>` type for volumeMappings

**Rationale**:
- JavaScript object merge is built-in: `{ ...global, ...project }`
- Target path as key ensures uniqueness and O(1) lookup
- Zod supports record validation: `z.record(z.string(), VolumeMappingSchema)`
- JSON serialization is native (no custom parsers needed)

**Alternatives Considered**:
- Array with manual deduplication: More code, O(n) complexity for merges
- Map<string, T>: Requires custom JSON serialization logic

**Implementation Notes**:
- Schema: `z.record(z.string().min(1), VolumeMappingSchema)`
- Validation: Ensure keys match `targetPath` field in value (or make targetPath optional since key serves that purpose)
- Consider: Make `targetPath` field optional in schema since key already provides it

---

## Legacy Migration Strategy

**Decision**: Detect array format on read, migrate on write, warn always

**Rationale**:
- Backward compatibility: Existing configs must continue to work (Constitution principle V)
- Progressive migration: Users see warnings but aren't forced to manually update
- Write-time migration: Natural trigger point when config is being modified anyway
- Simple detection: `Array.isArray(config.mappings)` vs `typeof config.mappings === 'object'`

**Alternatives Considered**:
- Hard breaking change: Violates backward compatibility constraint
- Silent migration without warnings: Users wouldn't know to update documentation/scripts
- Lazy migration (never auto-migrate): Technical debt accumulates forever

**Implementation Notes**:
- In `readProjectConfig()` / `readGlobalConfig()`: Check if `mappings` is array
- If array: 
  - Convert to map using `targetPath || sourcePath` as key
  - Emit warning via console.warn or debug logger
  - Store converted result in `volumeMappings` field (keep `mappings` untouched for now)
- In `writeProjectConfig()` / `writeGlobalConfig()`: 
  - If `mappings` array exists, convert to `volumeMappings` map
  - Remove `mappings` field from output
  - Write JSON with new format

---

## Zod Schema Evolution

**Decision**: Add optional `volumeMappings` field, keep `mappings` as optional deprecated field

**Rationale**:
- Allows gradual migration: Both fields can coexist during transition
- Zod refine() can enforce mutual exclusivity or migration logic
- Clear deprecation path: `mappings` marked with JSDoc `@deprecated`

**Alternatives Considered**:
- Immediate removal of `mappings`: Breaks existing configs (violates constraints)
- Union type `mappings: array | object`: Ambiguous, hard to document

**Implementation Notes**:
```typescript
export const VolumeMappingSchema = z.object({
  volumeName: z.string().optional(),
  sourcePath: z.string().optional(),
  targetPath: z.string().min(1),
  mode: z.enum(['rw', 'ro']),
  label: z.string().optional(),
}).refine(
  (data) => (data.volumeName && !data.sourcePath) || (!data.volumeName && data.sourcePath),
  'Must specify either volumeName or sourcePath, not both'
)

export const ProjectConfigSchema = z.object({
  // ... existing fields ...
  mappings: z.array(FolderMappingSchema).optional(), // @deprecated - use volumeMappings
  volumeMappings: z.record(z.string(), VolumeMappingSchema).optional(),
  // ... rest ...
})
```

---

## Workdir/DefaultMappings Preservation

**Decision**: volumeMappings extends (doesn't replace) existing mount behavior

**Rationale**:
- User expectation: Adding volumeMappings shouldn't break current workflow
- Least surprise: Default behavior remains unchanged
- Merge point: In resolver, combine defaultMappings + volumeMappings into final mount list

**Implementation Notes**:
- In `resolver.ts` where effectiveMappings is built:
  - Start with existing defaultMappings logic
  - Convert volumeMappings map to array
  - Append volumeMappings array to effectiveMappings
  - Handle conflicts: If same targetPath exists in both, volumeMappings wins (later in array)
- Document: volumeMappings can override defaultMappings if targetPath collides

---

## Performance Considerations

**Decision**: In-memory merge at config load time, no caching needed

**Rationale**:
- Config loaded once per CLI invocation
- Merge is O(n) where n = volume count (target: 20 max, actual likely <5)
- Object spread is native JS optimization
- No need for persistent cache or memoization

**Implementation Notes**:
- Profile if >100 volumeMappings becomes issue (unlikely given target of 20)
- Consider lazy evaluation if config reading becomes bottleneck (premature optimization)

---

## Open Questions

*None remaining* - All clarifications resolved during specification phase.

---

## References

- Podman volume documentation: https://docs.podman.io/en/latest/markdown/podman-volume.1.html
- Zod record schema: https://zod.dev/?id=records
- Existing runner.ts: `/cli/src/lib/podman/runner.ts`
- Existing schema.ts: `/cli/src/lib/config/schema.ts`
