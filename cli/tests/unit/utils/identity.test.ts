import { describe, expect, it } from 'vitest'
import { getHostIdentity } from '../../../src/lib/utils/identity.js'

describe('getHostIdentity', () => {
  it('returns uid/gid when available', () => {
    const identity = getHostIdentity()
    expect(identity).not.toBeNull()
    if (identity) {
      expect(typeof identity.uid).toBe('number')
      expect(typeof identity.gid).toBe('number')
    }
  })

  it('returns null when uid/gid are unavailable', () => {
    const originalUid = process.getuid
    const originalGid = process.getgid

    try {
      Object.defineProperty(process, 'getuid', { value: undefined, configurable: true })
      Object.defineProperty(process, 'getgid', { value: undefined, configurable: true })
      expect(getHostIdentity()).toBeNull()
    } finally {
      Object.defineProperty(process, 'getuid', { value: originalUid, configurable: true })
      Object.defineProperty(process, 'getgid', { value: originalGid, configurable: true })
    }
  })
})
