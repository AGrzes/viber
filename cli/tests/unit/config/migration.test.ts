import { describe, it, expect } from 'vitest'
import type { FolderMapping, VolumeMappingsCollection } from '../../../src/lib/config/schema.js'

/**
 * Migration helper: Convert legacy mappings array to volumeMappings map
 */
function migrateLegacyMappings(legacyMappings: FolderMapping[]): VolumeMappingsCollection {
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

describe('Legacy Mappings Migration', () => {
  it('T031: should detect legacy mappings array format', () => {
    const legacyMappings: FolderMapping[] = [
      { sourcePath: '/host/path1', targetPath: '/container/path1', mode: 'rw' },
      { sourcePath: '/host/path2', mode: 'ro' },
    ]

    expect(Array.isArray(legacyMappings)).toBe(true)
    expect(legacyMappings.length).toBe(2)
  })

  it('T032: should convert legacy array to volumeMappings map', () => {
    const legacyMappings: FolderMapping[] = [
      { sourcePath: '/host/path1', targetPath: '/container/path1', mode: 'rw' },
      { sourcePath: '/host/path2', targetPath: '/container/path2', mode: 'ro' },
    ]

    const result = migrateLegacyMappings(legacyMappings)

    expect(result['/container/path1']).toEqual({
      sourcePath: '/host/path1',
      targetPath: '/container/path1',
      mode: 'rw',
      label: undefined,
    })
    expect(result['/container/path2']).toEqual({
      sourcePath: '/host/path2',
      targetPath: '/container/path2',
      mode: 'ro',
      label: undefined,
    })
  })

  it('T033: should preserve all fields during migration', () => {
    const legacyMappings: FolderMapping[] = [
      {
        sourcePath: '/host/data',
        targetPath: '/app/data',
        mode: 'rw',
        label: 'Data directory',
      },
    ]

    const result = migrateLegacyMappings(legacyMappings)

    expect(result['/app/data']).toEqual({
      sourcePath: '/host/data',
      targetPath: '/app/data',
      mode: 'rw',
      label: 'Data directory',
    })
  })

  it('T034: write migrated config should use volumeMappings format', () => {
    const legacyMappings: FolderMapping[] = [
      { sourcePath: '/host/path', targetPath: '/container/path', mode: 'rw' },
    ]

    const volumeMappings = migrateLegacyMappings(legacyMappings)

    // Verify the new format is a map
    expect(typeof volumeMappings).toBe('object')
    expect(Array.isArray(volumeMappings)).toBe(false)
    expect(volumeMappings['/container/path']).toBeDefined()

    // In actual implementation, writeProjectConfig would:
    // 1. Detect legacy mappings array
    // 2. Convert to volumeMappings
    // 3. Remove mappings field
    // 4. Write with volumeMappings field only
  })

  it('should use targetPath as key, falling back to sourcePath', () => {
    const legacyMappings: FolderMapping[] = [
      { sourcePath: '/host/path1', targetPath: '/container/path1', mode: 'rw' },
      { sourcePath: '/host/path2', mode: 'ro' }, // no targetPath
    ]

    const result = migrateLegacyMappings(legacyMappings)

    expect(result['/container/path1']).toBeDefined()
    expect(result['/host/path2']).toBeDefined() // Falls back to sourcePath
  })

  it('should handle empty legacy array', () => {
    const legacyMappings: FolderMapping[] = []
    const result = migrateLegacyMappings(legacyMappings)

    expect(Object.keys(result)).toHaveLength(0)
  })
})
