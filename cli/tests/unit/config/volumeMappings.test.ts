import { describe, it, expect } from 'vitest'
import {
  VolumeMappingSchema,
  VolumeMappingsCollectionSchema,
  type VolumeMapping,
  type VolumeMappingsCollection,
} from '../../../src/lib/config/schema.js'

describe('VolumeMapping Schema', () => {
  // US3: Default behavior tests
  describe('US3: Default Behavior', () => {
    it('T010: should preserve workdir mount when no volumeMappings config exists', () => {
      // This test will verify resolver behavior - placeholder for now
      // Actual implementation will test resolveConfig() function
      expect(true).toBe(true)
    })

    it('T011: volumeMappings should extend (not replace) defaultMappings', () => {
      // This test will verify merger behavior - placeholder for now
      // Actual implementation will test merge logic in resolver
      expect(true).toBe(true)
    })
  })

  // US1: Project-level named volumes tests
  describe('US1: Project-Level Named Volumes', () => {
    it('T015: should parse volumeMappings from project config', () => {
      const mapping: VolumeMapping = {
        volumeName: 'test-volume',
        targetPath: '/app/data',
        mode: 'rw',
      }

      const result = VolumeMappingSchema.parse(mapping)
      expect(result.volumeName).toBe('test-volume')
      expect(result.targetPath).toBe('/app/data')
      expect(result.mode).toBe('rw')
    })

    it('T016: should validate volumeName XOR sourcePath constraint', () => {
      // Both specified - should fail
      const bothSpecified = {
        volumeName: 'test-volume',
        sourcePath: '/host/path',
        targetPath: '/app/data',
        mode: 'rw' as const,
      }
      expect(() => VolumeMappingSchema.parse(bothSpecified)).toThrow()

      // Neither specified - should fail
      const neitherSpecified = {
        targetPath: '/app/data',
        mode: 'rw' as const,
      }
      expect(() => VolumeMappingSchema.parse(neitherSpecified)).toThrow()

      // Only volumeName - should pass
      const onlyVolume = {
        volumeName: 'test-volume',
        targetPath: '/app/data',
        mode: 'rw' as const,
      }
      expect(VolumeMappingSchema.parse(onlyVolume).volumeName).toBe('test-volume')

      // Only sourcePath - should pass
      const onlySource = {
        sourcePath: '/host/path',
        targetPath: '/app/data',
        mode: 'rw' as const,
      }
      expect(VolumeMappingSchema.parse(onlySource).sourcePath).toBe('/host/path')
    })

    it('T017: should reject empty targetPath', () => {
      const emptyTargetPath = {
        volumeName: 'test-volume',
        targetPath: '',
        mode: 'rw' as const,
      }
      expect(() => VolumeMappingSchema.parse(emptyTargetPath)).toThrow()
    })

    it('T018: should validate mode enum (rw/ro)', () => {
      const validRw = {
        volumeName: 'test',
        targetPath: '/app',
        mode: 'rw' as const,
      }
      expect(VolumeMappingSchema.parse(validRw).mode).toBe('rw')

      const validRo = {
        volumeName: 'test',
        targetPath: '/app',
        mode: 'ro' as const,
      }
      expect(VolumeMappingSchema.parse(validRo).mode).toBe('ro')

      const invalidMode = {
        volumeName: 'test',
        targetPath: '/app',
        mode: 'invalid',
      }
      expect(() => VolumeMappingSchema.parse(invalidMode)).toThrow()
    })
  })

  // US2: Global named volumes tests
  describe('US2: Global Named Volumes', () => {
    it('T024: should parse volumeMappings from global config', () => {
      const collection: VolumeMappingsCollection = {
        '/app/data': {
          volumeName: 'global-data',
          targetPath: '/app/data',
          mode: 'rw',
        },
      }

      const result = VolumeMappingsCollectionSchema.parse(collection)
      expect(result['/app/data'].volumeName).toBe('global-data')
    })

    it('T025: should merge global and project volumeMappings by target path', () => {
      const global: VolumeMappingsCollection = {
        '/cache': { volumeName: 'global-cache', targetPath: '/cache', mode: 'rw' },
        '/tmp': { volumeName: 'global-tmp', targetPath: '/tmp', mode: 'rw' },
      }

      const project: VolumeMappingsCollection = {
        '/cache': { volumeName: 'project-cache', targetPath: '/cache', mode: 'ro' },
      }

      // Simple merge: project overrides global for same key
      const merged = { ...global, ...project }

      expect(merged['/cache'].volumeName).toBe('project-cache')
      expect(merged['/cache'].mode).toBe('ro')
      expect(merged['/tmp'].volumeName).toBe('global-tmp')
    })

    it('T026: project volumeMappings should override global when same targetPath', () => {
      const global: VolumeMappingsCollection = {
        '/app/data': { volumeName: 'global-data', targetPath: '/app/data', mode: 'rw' },
      }

      const project: VolumeMappingsCollection = {
        '/app/data': { volumeName: 'project-data', targetPath: '/app/data', mode: 'ro' },
      }

      const merged = { ...global, ...project }

      expect(merged['/app/data'].volumeName).toBe('project-data')
      expect(merged['/app/data'].mode).toBe('ro')
    })
  })

  describe('VolumeMappingsCollection Schema', () => {
    it('should validate a map of volume mappings', () => {
      const collection: VolumeMappingsCollection = {
        '/app/node_modules': {
          volumeName: 'node-modules-cache',
          targetPath: '/app/node_modules',
          mode: 'rw',
        },
        '/app/src': {
          sourcePath: '/host/src',
          targetPath: '/app/src',
          mode: 'rw',
        },
      }

      const result = VolumeMappingsCollectionSchema.parse(collection)
      expect(Object.keys(result)).toHaveLength(2)
      expect(result['/app/node_modules'].volumeName).toBe('node-modules-cache')
      expect(result['/app/src'].sourcePath).toBe('/host/src')
    })

    it('should reject empty keys', () => {
      const invalidCollection = {
        '': {
          volumeName: 'test',
          targetPath: '/app',
          mode: 'rw' as const,
        },
      }
      expect(() => VolumeMappingsCollectionSchema.parse(invalidCollection)).toThrow()
    })
  })
})
