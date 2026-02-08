import { substituteEnvMap } from '../lib/utils/envSubst.js'
import { type FolderMapping, type Profile } from '../lib/config/schema.js'

export type SessionEnvResult = {
  env: Record<string, string>
  extraMounts: FolderMapping[]
}

export function buildSessionEnv(profile: Profile, hostEnv: NodeJS.ProcessEnv): SessionEnvResult {
  const env = substituteEnvMap(profile.env, hostEnv)
  return { env, extraMounts: [] }
}
