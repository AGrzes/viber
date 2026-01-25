import { describe, expect, it } from 'vitest'
import { mergeTemplateDefinitions } from '../../../src/lib/templates/merge.js'

describe('template merge', () => {
  it('prefers local values and deep merges parameters', () => {
    const globalTemplates = [
      {
        name: 'shared-config',
        path: '/app/config/base.json',
        template: '{"mode":"base","flags":{{flags}}}',
        parameters: {
          flags: ['global'],
          nested: { alpha: 1, beta: 2 },
        },
      },
    ]

    const projectTemplates = [
      {
        name: 'shared-config',
        path: '/app/config/local.json',
        template: '{"mode":"local","flags":{{flags}}}',
        parameters: {
          flags: ['local'],
          nested: { beta: 3, gamma: 4 },
        },
      },
    ]

    const merged = mergeTemplateDefinitions(globalTemplates, projectTemplates)
    const mergedTemplate = merged['shared-config']

    expect(mergedTemplate.path).toBe('/app/config/local.json')
    expect(mergedTemplate.template).toContain('"mode":"local"')
    expect(mergedTemplate.parameters.nested).toEqual({ alpha: 1, beta: 3, gamma: 4 })
  })
})
