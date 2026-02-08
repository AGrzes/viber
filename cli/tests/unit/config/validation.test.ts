import { describe, expect, it } from 'vitest'
import { validateMappings } from '../../../src/lib/config/validation.js'

describe('validateMappings', () => {
  it('detects duplicate target paths', () => {
    const issues = validateMappings([
      { sourcePath: '/a', targetPath: '/same', mode: 'rw' },
      { sourcePath: '/b', targetPath: '/same', mode: 'ro' },
    ])

    expect(issues).toHaveLength(1)
    expect(issues[0].message).toMatch(/duplicate/i)
  })
})
