import { describe, it, expect } from 'vitest'
import type { FolderMapping, VolumeMappingsCollection } from '../../../src/lib/config/schema.js'

function migrateLegacyMappings(legacyMappings: FolderMapping[]): VolumeMappingsCollection {
  const result: VolumeMappingsCollection = {}
  for (const mapping of legacyMappings) {
    const targetPath = mapping.targetPath ?? mapping.sourcePath
    const mode = mapping.mode !== 'rw' ? `:${mapping.mode}` : ''
    result[mapping.sourcePath] = `${targetPath}${mode}`
  }
  return result
}

describe('Legacy Mappings Migration', () => {
  it('should convert legacy array to simple string format', () => {
    const legacyMappings: FolderMapping[] = [
      { sourcePath: '/host/path1', targetPath: '/container/path1', mode: 'rw' },
      { sourcePath: '/host/path2', targetPath: '/container/path2', mode: 'ro' },
    ]
    const result = migrateLegacyMappings(legacyMappings)
    expect(result['/host/path1']).toBe('/container/path1')
    expect(result['/host/path2']).toBe('/container/path2:ro')
  })

  it('should omit :rw suffix for read-write mode', () => {
    const legacyMappings: FolderMapping[] = [
      { sourcePath: '/host/rw', targetPath: '/app/rw', mode: 'rw' },
      { sourcePath: '/host/ro', targetPath: '/app/ro', mode: 'ro' },
    ]
    const result = migrateLegacyMappings(legacyMappings)
    expect(result['/host/rw']).toBe('/app/rw')
    expect(result['/host/ro']).toBe('/app/ro:ro')
  })
})
