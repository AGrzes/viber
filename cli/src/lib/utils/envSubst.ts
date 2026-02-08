export function substituteEnv(value: string, env: NodeJS.ProcessEnv): string {
  return value.replace(/\$\{([A-Za-z_][A-Za-z0-9_]*)\}|\$([A-Za-z_][A-Za-z0-9_]*)/g, (_, key1, key2) => {
    const key = key1 ?? key2
    return env[key] ?? ''
  })
}

export function substituteEnvMap(
  envMap: Record<string, string> | undefined,
  hostEnv: NodeJS.ProcessEnv
): Record<string, string> {
  const result: Record<string, string> = {}
  if (!envMap) return result

  for (const [key, value] of Object.entries(envMap)) {
    result[key] = substituteEnv(value, hostEnv)
  }

  return result
}
