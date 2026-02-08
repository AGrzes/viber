import { describe, it, expect } from 'vitest'
import { VolumeMapSchema } from '../../../src/lib/config/schema.js'

describe('VolumeMapSchema', () => {
  it('parses simple volumeName -> targetPath', () => {
    const mapping = {
      'test-volume': '/app/data',
    }

    const result = VolumeMapSchema.parse(mapping)
    expect(result['test-volume']).toBe('/app/data')
  })

  it('parses volumeName -> targetPath:mode', () => {
    const mapping = {
      'test-volume': '/app/data:ro',
    }

    const result = VolumeMapSchema.parse(mapping)
    expect(result['test-volume']).toBe('/app/data:ro')
  })

  it('parses bind mount keys', () => {
    const mapping = {
      '/host/path': '/container/path',
    }

    const result = VolumeMapSchema.parse(mapping)
    expect(result['/host/path']).toBe('/container/path')
  })

  it('rejects empty keys or values', () => {
    expect(() => VolumeMapSchema.parse({ '': '/app/data' })).toThrow()
    expect(() => VolumeMapSchema.parse({ 'test-volume': '' })).toThrow()
  })
})
