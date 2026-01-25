import { CliError } from '../utils/errors.js'
import { ENV_KEY_PATTERN, EnvMappingEntrySchema, type EnvMappingEntry } from './schema.js'

export function isValidEnvKey(key: string): boolean {
  return ENV_KEY_PATTERN.test(key)
}

export function assertValidEnvKey(key: string): void {
  if (!isValidEnvKey(key)) {
    throw new CliError(`Invalid environment variable name: ${key}`)
  }
}

export function normalizeEnvMappings(entries: EnvMappingEntry[] | undefined): EnvMappingEntry[] | undefined {
  if (!entries || entries.length === 0) return undefined
  return entries.map((entry) => EnvMappingEntrySchema.parse(entry))
}

export function parseEnvMappingEntry(key: string, value: string): EnvMappingEntry {
  return EnvMappingEntrySchema.parse({ key, value })
}
