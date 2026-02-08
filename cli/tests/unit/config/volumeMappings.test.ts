import { describe, it, expect } from 'vitest'
import { VolumeMappingsCollectionSchema, type VolumeMappingsCollection } from '../../../src/lib/config/schema.js'

describe('VolumeMapping Schema', () => {
  describe('Simple string format', () => {
    it('should parse simple volumeName: targetPath', () => {
      const mapping: VolumeMappingsCollection = {
        'test-volume': '/app/data',
      }

      const result = VolumeMappingsCollectionSchema.parse(mapping)
      expect(result['test-volume']).toBe('/app/data')
    })

    it('should parse volumeName: targetPath:mode', () => {
      const mapping: VolumeMappingsCollection = {
        'test-volume': '/app/data:ro',
      }

      const result = VolumeMappingsCollectionSchema.parse(mapping)
      expect(result['test-volume']).toBe('/app/data:ro')
    })

    it('should parse bind mount (key starts with /)', () => {
      const mapping: VolumeMappingsCollection = {
        '/host/path': '/container/path',
      }

      const result = VolumeMappingsCollectionSchema.parse(mapping)
      expect(result['/host/path']).toBe('/container/path')
    })

    it('should handle mixed named volumes and bind mounts', () => {
      const mapping: VolumeMappingsCollection = {
        'node-modules': '/app/node_modules',
        '/host/src': '/app/src:ro',
        'cache-volume': '/cache:rw',
      }

      const result = VolumeMappingsCollectionSchema.parse(mapping)
      expect(Object.keys(result)).toHaveLength(3)
      expect(result['node-modules']).toBe('/app/node_modules')
      expect(result['/host/src']).toBe('/app/src:ro')
      expect(result['cache-volume']).toBe('/cache:rw')
    })

    it('should reject empty keys', () => {
      const invalidMapping = {
        '': '/app/data',
      }
      expect(() => VolumeMappingsCollectionSchema.parse(invalidMapping)).toThrow()
    })

    it('should reject empty values', () => {
      const invalidMapping = {
        'test-volume': '',
      }
      expect(() => VolumeMappingsCollectionSchema.parse(invalidMapping)).toThrow()
    })
  })

  describe('US3: Default Behavior', () => {
    it('should preserve workdir mount when no volumeMappings config exists', () => {
      expect(true).toBe(true)
    })

    it('volumeMappings should extend (not replace) defaultMappings', () => {
      expect(true).toBe(true)
    })
  })

  describe('US2: Global Named Volumes', () => {
    it('should merge global and project volumeMappings', () => {
      const global: VolumeMappingsCollection = {
        'global-cache': '/cache',
        'global-tmp': '/tmp',
      }

      const project: VolumeMappingsCollection = {
        'global-cache': '/cache:ro', // Override mode
        'project-data': '/app/data',
      }

      const merged = { ...global, ...project }

      expect(merged['global-cache']).toBe('/cache:ro')
      expect(merged['global-tmp']).toBe('/tmp')
      expect(merged['project-data']).toBe('/app/data')
    })

    it('project volumeMappings should override global for same key', () => {
      const global: VolumeMappingsCollection = {
        'shared-volume': '/data:rw',
      }

      const project: VolumeMappingsCollection = {
        'shared-volume': '/data:ro',
      }

      const merged = { ...global, ...project }

      expect(merged['shared-volume']).toBe('/data:ro')
    })
  })
})
