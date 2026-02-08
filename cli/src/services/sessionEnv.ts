import { interpolateEnvMap } from '../lib/utils/envMappings.js'
import { type FolderMapping, type Profile } from '../lib/config/schema.js'

export type SessionEnvResult = {
  env: Record<string, string>
  extraMounts: FolderMapping[]
}

export function buildSessionEnv(profile: Profile, hostEnv: NodeJS.ProcessEnv): SessionEnvResult {
  const env = interpolateEnvMap(profile.env, hostEnv)
  return { env, extraMounts: [] }
}
