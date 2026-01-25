import path from 'node:path'
import { CliError } from './errors.js'

export type EnvMap = Record<string, string | undefined>

export type EnvSubstOptions = {
  allowEmpty?: boolean
}

const ENV_VAR_REGEX = /\$\{([A-Za-z_][A-Za-z0-9_]*)\}/g

export function substituteEnvPath(
  rawPath: string,
  env: EnvMap,
  options: EnvSubstOptions = {}
): string {
  const { allowEmpty = false } = options
  const missingVars: string[] = []

  const resolved = rawPath.replace(ENV_VAR_REGEX, (_, key) => {
    const value = env[key]
    if (value == null || value === '') {
      if (allowEmpty) {
        return ''
      }
      missingVars.push(key)
      return ''
    }
    return value
  })

  if (missingVars.length > 0) {
    throw new CliError(`Missing environment variables for template path: ${missingVars.join(', ')}`)
  }

  if (!path.posix.isAbsolute(resolved)) {
    throw new CliError(`Resolved template path must be absolute: ${resolved}`)
  }

  return path.posix.normalize(resolved)
}
