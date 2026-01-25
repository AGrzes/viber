export type EnvMap = Record<string, string | undefined>

const ENV_VAR_REGEX = /\$\{([A-Za-z_][A-Za-z0-9_]*)\}|\$([A-Za-z_][A-Za-z0-9_]*)/g

export function substituteEnv(raw: string, env: EnvMap): string {
  return raw.replace(ENV_VAR_REGEX, (_match, braced, simple) => {
    const key = braced || simple
    return env[key] ?? ''
  })
}
