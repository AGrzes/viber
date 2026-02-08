import { substituteEnv } from '../utils/envSubst.js'

export function interpolateEnvValue(value: string, hostEnv: NodeJS.ProcessEnv): string {
  return substituteEnv(value, hostEnv)
}

export function interpolateEnvMap(
  env: Record<string, string> | undefined,
  hostEnv: NodeJS.ProcessEnv
): Record<string, string> {
  const interpolated: Record<string, string> = {}
  if (!env) return interpolated

  for (const [key, value] of Object.entries(env)) {
    interpolated[key] = interpolateEnvValue(value, hostEnv)
  }

  return interpolated
}
