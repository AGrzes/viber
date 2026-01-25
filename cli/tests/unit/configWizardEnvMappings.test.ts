import { describe, expect, it, vi } from 'vitest'

vi.mock('prompts', () => ({ default: vi.fn() }))

import prompts from 'prompts'
import { runConfigWizard } from '../../src/services/configWizard.js'

const promptMock = vi.mocked(prompts)

describe('config wizard env mappings', () => {
  it('captures env mappings when provided', async () => {
    const responses = [
      { imageChoice: 'none' },
      { add: false },
      { add: true },
      { key: 'API_URL', value: 'https://example' },
      { add: false },
    ]

    promptMock.mockImplementation(async () => responses.shift())

    const config = await runConfigWizard()

    expect(config.envMappings).toEqual([{ key: 'API_URL', value: 'https://example' }])
  })
})
