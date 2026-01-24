import { CliError } from "../utils/errors.js";
import { assertValidEnvKey, normalizeEnvMappings, parseEnvMappingEntry } from "./envMappings.js";
import {
  getProjectConfigPath,
  readGlobalConfig,
  readProjectConfig,
  writeGlobalConfig,
  writeProjectConfig,
} from "./store.js";
import { type EnvMappingEntry, type GlobalConfig, type ProjectConfig } from "./schema.js";

export type EnvMappingScope = "global" | "project";

function requireProjectConfigPath(cwd: string): string {
  const configPath = getProjectConfigPath(cwd);
  if (!configPath) {
    throw new CliError("No project config found in current or parent directories.");
  }
  return configPath;
}

function updateMappings(
  existing: EnvMappingEntry[] | undefined,
  key: string,
  value: string
): EnvMappingEntry[] {
  const next = (existing ?? []).filter((entry) => entry.key !== key);
  next.push(parseEnvMappingEntry(key, value));
  return next;
}

function removeMapping(existing: EnvMappingEntry[] | undefined, key: string): EnvMappingEntry[] {
  const next = (existing ?? []).filter((entry) => entry.key !== key);
  return next;
}

export async function listEnvMappings(
  scope: EnvMappingScope,
  cwd = process.cwd()
): Promise<EnvMappingEntry[]> {
  if (scope === "global") {
    const global = await readGlobalConfig();
    return global?.envMappings ?? [];
  }

  const configPath = requireProjectConfigPath(cwd);
  const project = await readProjectConfig(configPath);
  return project.envMappings ?? [];
}

export async function getEnvMapping(
  scope: EnvMappingScope,
  key: string,
  cwd = process.cwd()
): Promise<EnvMappingEntry | null> {
  const mappings = await listEnvMappings(scope, cwd);
  return mappings.find((entry) => entry.key === key) ?? null;
}

export async function setEnvMapping(
  scope: EnvMappingScope,
  key: string,
  value: string,
  cwd = process.cwd()
): Promise<void> {
  assertValidEnvKey(key);

  if (scope === "global") {
    const global: GlobalConfig = (await readGlobalConfig()) ?? {};
    const envMappings = updateMappings(global.envMappings, key, value);
    await writeGlobalConfig({
      ...global,
      envMappings: normalizeEnvMappings(envMappings),
    });
    return;
  }

  const configPath = requireProjectConfigPath(cwd);
  const project: ProjectConfig = await readProjectConfig(configPath);
  const envMappings = updateMappings(project.envMappings, key, value);
  await writeProjectConfig(configPath, {
    ...project,
    envMappings: normalizeEnvMappings(envMappings),
  });
}

export async function deleteEnvMapping(
  scope: EnvMappingScope,
  key: string,
  cwd = process.cwd()
): Promise<void> {
  const existing = await getEnvMapping(scope, key, cwd);
  if (!existing) {
    throw new CliError(`Env mapping not found: ${key}`);
  }

  if (scope === "global") {
    const global: GlobalConfig = (await readGlobalConfig()) ?? {};
    const envMappings = removeMapping(global.envMappings, key);
    await writeGlobalConfig({
      ...global,
      envMappings: normalizeEnvMappings(envMappings),
    });
    return;
  }

  const configPath = requireProjectConfigPath(cwd);
  const project: ProjectConfig = await readProjectConfig(configPath);
  const envMappings = removeMapping(project.envMappings, key);
  await writeProjectConfig(configPath, {
    ...project,
    envMappings: normalizeEnvMappings(envMappings),
  });
}
