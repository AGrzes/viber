import { type EnvMappingEntry } from '../config/schema.js'

const ENV_REF_PATTERN = /\$\{([A-Za-z_][A-Za-z0-9_]*)\}|\$([A-Za-z_][A-Za-z0-9_]*)/g

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
  return value.replace(ENV_REF_PATTERN, (_match, braced, simple) => {
    const key = braced || simple
    return hostEnv[key] ?? ''
  })
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
