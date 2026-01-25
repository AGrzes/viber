import { CliError } from "../utils/errors.js";
import {
  getProjectConfigPath,
  readGlobalConfig,
  readProjectConfig,
  writeGlobalConfig,
  writeProjectConfig,
} from "./store.js";
import { type GlobalConfig, type ProjectConfig } from "./schema.js";

export const AGENTS_REF_PREFIX = "@ref:";

export type ProjectAgentsValue = {
  projectText?: string;
  referenceName?: string;
  noGlobal: boolean;
};

function requireProjectConfigPath(cwd: string): string {
  const configPath = getProjectConfigPath(cwd);
  if (!configPath) {
    throw new CliError("No project config found in current or parent directories.");
  }
  return configPath;
}

export function parseProjectAgentsValue(
  value: string | null | undefined
): ProjectAgentsValue {
  if (value === null) {
    return { noGlobal: true };
  }
  if (value === undefined) {
    return { noGlobal: false };
  }
  if (value.startsWith(AGENTS_REF_PREFIX)) {
    const referenceName = value.slice(AGENTS_REF_PREFIX.length);
    return { referenceName, noGlobal: false };
  }
  return { projectText: value, noGlobal: false };
}

export function upsertGlobalAgents(
  existing: Record<string, string> | undefined,
  name: string,
  content: string
): Record<string, string> {
  return {
    ...(existing ?? {}),
    [name]: content,
  };
}

export function removeGlobalAgentFromMap(
  existing: Record<string, string> | undefined,
  name: string
): { next: Record<string, string>; removed: boolean } {
  const next = { ...(existing ?? {}) };
  const removed = Object.prototype.hasOwnProperty.call(next, name);
  if (removed) {
    delete next[name];
  }
  return { next, removed };
}

export function applyProjectAgentsValue(
  project: ProjectConfig,
  value: string | null | undefined
): ProjectConfig {
  const next: ProjectConfig = { ...project };
  if (value === undefined) {
    delete next.agents;
    return next;
  }
  next.agents = value;
  return next;
}

export async function listGlobalAgents(): Promise<Record<string, string>> {
  const global = await readGlobalConfig();
  return global?.agents ?? {};
}

export async function getGlobalAgent(name: string): Promise<string | null> {
  const agents = await listGlobalAgents();
  return agents[name] ?? null;
}

export async function setGlobalAgent(name: string, content: string): Promise<void> {
  const global: GlobalConfig = (await readGlobalConfig()) ?? {};
  const agents = upsertGlobalAgents(global.agents, name, content);
  await writeGlobalConfig({
    ...global,
    agents,
  });
}

export async function clearGlobalAgent(name: string): Promise<void> {
  const global: GlobalConfig = (await readGlobalConfig()) ?? {};
  const { next, removed } = removeGlobalAgentFromMap(global.agents, name);
  if (!removed) {
    throw new CliError(`Agent content not found: ${name}`);
  }
  await writeGlobalConfig({
    ...global,
    agents: next,
  });
}

export async function getProjectAgentsValue(
  cwd = process.cwd()
): Promise<string | null | undefined> {
  const configPath = requireProjectConfigPath(cwd);
  const project = await readProjectConfig(configPath);
  return project.agents;
}

export async function setProjectAgentsValue(
  value: string | null | undefined,
  cwd = process.cwd()
): Promise<void> {
  const configPath = requireProjectConfigPath(cwd);
  const project = await readProjectConfig(configPath);
  const next = applyProjectAgentsValue(project, value);
  await writeProjectConfig(configPath, next);
}

export async function setProjectAgentsText(
  content: string,
  cwd = process.cwd()
): Promise<void> {
  await setProjectAgentsValue(content, cwd);
}

export async function clearProjectAgents(cwd = process.cwd()): Promise<void> {
  await setProjectAgentsValue(undefined, cwd);
}

export async function setProjectNoGlobal(cwd = process.cwd()): Promise<void> {
  await setProjectAgentsValue(null, cwd);
}

export async function setProjectReference(
  name: string,
  cwd = process.cwd()
): Promise<void> {
  await setProjectAgentsValue(`${AGENTS_REF_PREFIX}${name}`, cwd);
}

export async function clearProjectReference(cwd = process.cwd()): Promise<void> {
  const value = await getProjectAgentsValue(cwd);
  if (value === null) {
    await setProjectAgentsValue(undefined, cwd);
    return;
  }
  if (typeof value === "string" && value.startsWith(AGENTS_REF_PREFIX)) {
    await setProjectAgentsValue(undefined, cwd);
  }
}
