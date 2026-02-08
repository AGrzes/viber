import { describe, expect, it, vi } from 'vitest'

const enableMock = vi.hoisted(() => vi.fn())
const debugMock = vi.hoisted(() =>
  Object.assign((namespace: string) => ({ namespace }), {
    enable: enableMock,
  })
)

vi.mock('debug', () => ({
  default: debugMock,
}))

import { enableDebug, log } from '../../../src/lib/utils/log.js'

describe('log utilities', () => {
  it('creates debug namespaces', () => {
    expect(log.cli).toBeDefined()
    expect(log.config).toBeDefined()
  })

  it('enables debug namespaces', () => {
    enableDebug('viber:*')
    expect(enableMock).toHaveBeenCalledWith('viber:*')
  })
})
