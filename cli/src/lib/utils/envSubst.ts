import { CliError } from './errors.js'

export type EnvMap = Record<string, string | undefined>

const ENV_VAR_REGEX = /\$\{([A-Za-z_][A-Za-z0-9_]*)\}|\$([A-Za-z_][A-Za-z0-9_]*)/g

const TEMPLATE_PATH_ERROR = 'Missing environment variables for template path'

export function substituteEnvPath(rawPath: string, env: EnvMap): string {
  return substituteEnvValue(rawPath, env, true, TEMPLATE_PATH_ERROR)
}

export function substituteEnvValue(
  raw: string,
  env: EnvMap,
  errorOnMissing = false,
  errorPrefix?: string
): string {
  const missingVars: string[] = []

  const resolved = raw.replace(ENV_VAR_REGEX, (_match, braced, simple) => {
    const key = braced || simple
    const value = env[key]
    if (value == null || value === '') {
      if (errorOnMissing) {
        missingVars.push(key)
        return ''
      }
      return ''
    }
    return value
  })

  if (missingVars.length > 0) {
    const prefix = errorPrefix ?? 'Missing environment variables for substitution'
    throw new CliError(`${prefix}: ${missingVars.join(', ')}`)
  }

  return resolved
}
