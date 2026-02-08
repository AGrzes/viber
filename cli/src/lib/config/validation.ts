import path from 'node:path'
import { type FolderMapping } from './schema.js'

export type ValidationIssue = {
  field: string
  message: string
}

export function validateMappings(mappings: FolderMapping[]): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const targets = new Set<string>()

  for (const mapping of mappings) {
    const target = mapping.targetPath ?? mapping.sourcePath
    const normalizedTarget = path.resolve(target)

    if (targets.has(normalizedTarget)) {
      issues.push({
        field: 'targetPath',
        message: `Duplicate targetPath: ${normalizedTarget}`,
      })
    } else {
      targets.add(normalizedTarget)
    }
  }

  return issues
}
