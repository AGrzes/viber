import { describe, expect, it } from 'vitest'
import {
  parseProjectAgentsValue,
  removeGlobalAgentsEntryFromMap,
  upsertGlobalAgents,
} from '../../src/lib/config/agents.js'

describe('agents config helpers', () => {
  it('treats names as case-sensitive', () => {
    const initial = upsertGlobalAgents({}, 'default', 'A')
    const next = upsertGlobalAgents(initial, 'Default', 'B')

    expect(next.default).toBe('A')
    expect(next.Default).toBe('B')
  })

  it('removes a global agent entry', () => {
    const { next, removed } = removeGlobalAgentsEntryFromMap({ alpha: 'A' }, 'alpha')

    expect(removed).toBe(true)
    expect(next).toEqual({})
  })

  it('parses project no-global and references', () => {
    const noGlobal = parseProjectAgentsValue({ agents: null })
    const reference = parseProjectAgentsValue({ agentsRef: 'beta' })

    expect(noGlobal.noGlobal).toBe(true)
    expect(reference.referenceName).toBe('beta')
  })
})
