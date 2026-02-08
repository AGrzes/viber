import { describe, expect, it } from 'vitest'
import { CliError, getErrorMessage } from '../../../src/lib/utils/errors.js'

describe('getErrorMessage', () => {
  it('returns message from CliError', () => {
    expect(getErrorMessage(new CliError('oops'))).toBe('oops')
  })

  it('returns message from Error', () => {
    expect(getErrorMessage(new Error('boom'))).toBe('boom')
  })

  it('stringifies unknown values', () => {
    expect(getErrorMessage('plain')).toBe('plain')
  })
})
