import path from 'node:path'
import { CliError } from './errors.js'

export type EnvMap = Record<string, string | undefined>

export type EnvSubstOptions = {
  allowEmpty?: boolean
}

const ENV_VAR_REGEX = /\$\{([A-Za-z_][A-Za-z0-9_]*)\}|\$([A-Za-z_][A-Za-z0-9_]*)/g

export type MissingValueBehavior = 'error' | 'empty'

export function substituteEnvPath(
  rawPath: string,
  env: EnvMap,
  options: EnvSubstOptions = {}
): string {
  const { allowEmpty = false } = options
  const resolved = substituteEnvValue(rawPath, env, {
    missing: allowEmpty ? 'empty' : 'error',
  })

  if (!path.posix.isAbsolute(resolved)) {
    throw new CliError(`Resolved template path must be absolute: ${resolved}`)
  }

  return path.posix.normalize(resolved)
}

type SubstituteOptions = {
  missing?: MissingValueBehavior
}

export function substituteEnvValue(
  raw: string,
  env: EnvMap,
  options: SubstituteOptions = {}
): string {
  const { missing = 'empty' } = options
  const missingVars: string[] = []

  const resolved = raw.replace(ENV_VAR_REGEX, (_match, braced, simple) => {
    const key = braced || simple
    const value = env[key]
    if (value == null || value === '') {
      if (missing === 'empty') {
        return ''
      }
      missingVars.push(key)
      return ''
    }
    return value
  })

  if (missingVars.length > 0) {
    throw new CliError(`Missing environment variables for substitution: ${missingVars.join(', ')}`)
  }

  return resolved
}
