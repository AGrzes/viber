import { CliError } from '../utils/errors.js'
import { TemplateDefinition, TemplateDefinitionSchema } from './types.js'

export type TemplateMap = Record<string, TemplateDefinition>

export function mergeTemplateDefinitions(
  globalTemplates: TemplateDefinition[] = [],
  projectTemplates: TemplateDefinition[] = []
): TemplateMap {
  const merged: TemplateMap = {}

  for (const template of [...globalTemplates, ...projectTemplates]) {
    if (!merged[template.name]) {
      merged[template.name] = template
      continue
    }

    merged[template.name] = mergeTwo(merged[template.name], template)
  }

  return merged
}

function mergeTwo(base: TemplateDefinition, override: TemplateDefinition): TemplateDefinition {
  const mergedPayload = {
    name: override.name,
    path: override.path || base.path,
    template: override.template || base.template,
    parameters: mergeParameters(base.parameters ?? {}, override.parameters ?? {}),
  }

  try {
    return TemplateDefinitionSchema.parse(mergedPayload)
  } catch (err) {
    throw new CliError(
      `Template "${override.name}" is invalid after merge: ${(err as Error).message}`
    )
  }
}

type PlainObject = Record<string, unknown>

function mergeParameters(base: PlainObject, override: PlainObject): PlainObject {
  const result: PlainObject = { ...base }

  for (const [key, value] of Object.entries(override)) {
    if (isPlainObject(result[key]) && isPlainObject(value)) {
      result[key] = mergeParameters(result[key] as PlainObject, value as PlainObject)
    } else {
      result[key] = value
    }
  }

  return result
}

function isPlainObject(value: unknown): value is PlainObject {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}
