import fs from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import { processTemplates } from '../../src/lib/templates/processor.js'

const templateSet = {
  agents: {
    path: '/codex/AGENTS.md',
    template: 'Title\n{{#each entries}}{{this}}\n{{/each}}',
    parameters: {
      entries: ['Rule A', 'Rule B'],
    },
  },
}

describe('template-based AGENTS generation', () => {
  it('renders AGENTS.md from templates', async () => {
    const files = await processTemplates({
      templateSet,
      env: {},
    })

    expect(files).toHaveLength(1)
    expect(files[0].containerPath).toBe('/codex/AGENTS.md')

    const content = await fs.readFile(files[0].tempPath, 'utf-8')
    expect(content).toContain('Title')
    expect(content).toContain('Rule A')
    expect(content).toContain('Rule B')
  })
})
