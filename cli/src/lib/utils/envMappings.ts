import { type EnvMappingEntry } from '../config/schema.js'
import { substituteEnv } from '../utils/envSubst.js'

export function mergeEnvMappings(
  globalEntries: EnvMappingEntry[] = [],
  projectEntries: EnvMappingEntry[] = []
): Record<string, string> {
  const merged: Record<string, string> = {}

  for (const entry of globalEntries) {
    merged[entry.key] = entry.value
  }

  for (const entry of projectEntries) {
    merged[entry.key] = entry.value
  }

  return merged
}

export function interpolateEnvValue(value: string, hostEnv: NodeJS.ProcessEnv): string {
  return substituteEnv(value, hostEnv)
}

export function interpolateEnvMappings(
  env: Record<string, string>,
  hostEnv: NodeJS.ProcessEnv
): Record<string, string> {
  const interpolated: Record<string, string> = {}

  for (const [key, value] of Object.entries(env)) {
    interpolated[key] = interpolateEnvValue(value, hostEnv)
  }

  return interpolated
}

export function buildEnvMappings(
  globalEntries: EnvMappingEntry[] | undefined,
  projectEntries: EnvMappingEntry[] | undefined,
  hostEnv: NodeJS.ProcessEnv
): Record<string, string> {
  const merged = mergeEnvMappings(globalEntries ?? [], projectEntries ?? [])
  return interpolateEnvMappings(merged, hostEnv)
}
