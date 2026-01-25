import fs from 'node:fs/promises'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { processTemplates } from '../../../src/lib/templates/processor.js'

describe('template suppression', () => {
  it('skips suppressed templates entirely', async () => {
    const templateSet = {
      keep: {
        name: 'keep',
        path: '/tmp/${ENV}/keep',
        template: 'keep content',
        parameters: {},
      },
      skip: {
        name: 'skip',
        path: '/tmp/${ENV}/skip',
        template: 'skip content',
        parameters: {},
      },
    }

    const rendered = await processTemplates({
      templateSet,
      env: { ENV: 'prod' },
      suppressionList: ['skip'],
    })

    expect(rendered).toHaveLength(1)
    expect(rendered[0].templateName).toBe('keep')

    await fs.rm(path.dirname(rendered[0].tempPath), { recursive: true, force: true })
  })
})
