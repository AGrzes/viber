import { CliError } from '../utils/errors.js'
import {
  getProjectConfigPath,
  readGlobalConfig,
  readProjectConfig,
  writeGlobalConfig,
  writeProjectConfig,
} from './store.js'
import { type GlobalConfig, type ProjectConfig } from './schema.js'

export type ProjectAgentsValue = {
  projectText?: string
  referenceName?: string
  noGlobal: boolean
}

function requireProjectConfigPath(cwd: string): string {
  const configPath = getProjectConfigPath(cwd)
  if (!configPath) {
    throw new CliError('No project config found in current or parent directories.')
  }
  return configPath
}

export function parseProjectAgentsValue(project?: ProjectConfig): ProjectAgentsValue {
  if (!project) {
    return { noGlobal: false }
  }
  if (project.agents === null) {
    return { noGlobal: true, referenceName: project.agentsRef }
  }
  return {
    noGlobal: false,
    projectText: project.agents ?? undefined,
    referenceName: project.agentsRef,
  }
}

export function upsertGlobalAgents(
  existing: Record<string, string> | undefined,
  name: string,
  content: string
): Record<string, string> {
  return {
    ...(existing ?? {}),
    [name]: content,
  }
}

export function removeGlobalAgentsEntryFromMap(
  existing: Record<string, string> | undefined,
  name: string
): { next: Record<string, string>; removed: boolean } {
  const next = { ...(existing ?? {}) }
  const removed = Object.prototype.hasOwnProperty.call(next, name)
  if (removed) {
    delete next[name]
  }
  return { next, removed }
}

export function applyProjectAgentsValue(project: ProjectConfig, value: string | null | undefined): ProjectConfig {
  const next: ProjectConfig = { ...project }
  if (value === undefined) {
    delete next.agents
    return next
  }
  next.agents = value
  return next
}

export async function listGlobalAgents(): Promise<Record<string, string>> {
  const global = await readGlobalConfig()
  return global?.agents ?? {}
}

export async function getGlobalAgentsEntry(name: string): Promise<string | null> {
  const agents = await listGlobalAgents()
  return agents[name] ?? null
}

export async function setGlobalAgentsEntry(name: string, content: string): Promise<void> {
  const global: GlobalConfig = (await readGlobalConfig()) ?? {}
  const agents = upsertGlobalAgents(global.agents, name, content)
  await writeGlobalConfig({
    ...global,
    agents,
  })
}

export async function clearGlobalAgentsEntry(name: string): Promise<void> {
  const global: GlobalConfig = (await readGlobalConfig()) ?? {}
  const { next, removed } = removeGlobalAgentsEntryFromMap(global.agents, name)
  if (!removed) {
    throw new CliError(`AGENTS content not found: ${name}`)
  }
  await writeGlobalConfig({
    ...global,
    agents: next,
  })
}

export async function getProjectAgentsValue(cwd = process.cwd()): Promise<string | null | undefined> {
  const configPath = requireProjectConfigPath(cwd)
  const project = await readProjectConfig(configPath)
  return project.agents
}

export async function setProjectAgentsValue(value: string | null | undefined, cwd = process.cwd()): Promise<void> {
  const configPath = requireProjectConfigPath(cwd)
  const project = await readProjectConfig(configPath)
  const next = applyProjectAgentsValue(project, value)
  await writeProjectConfig(configPath, next)
}

export async function setProjectAgentsText(content: string, cwd = process.cwd()): Promise<void> {
  await setProjectAgentsValue(content, cwd)
}

export async function clearProjectAgents(cwd = process.cwd()): Promise<void> {
  await setProjectAgentsValue(undefined, cwd)
}

export async function setProjectNoGlobal(cwd = process.cwd()): Promise<void> {
  await setProjectAgentsValue(null, cwd)
}

export async function setProjectReference(name: string, cwd = process.cwd()): Promise<void> {
  const configPath = requireProjectConfigPath(cwd)
  const project = await readProjectConfig(configPath)
  await writeProjectConfig(configPath, {
    ...project,
    agentsRef: name,
  })
}

export async function clearProjectReference(cwd = process.cwd()): Promise<void> {
  const configPath = requireProjectConfigPath(cwd)
  const project = await readProjectConfig(configPath)
  if (!project.agentsRef) return
  await writeProjectConfig(configPath, {
    ...project,
    agentsRef: undefined,
  })
}
