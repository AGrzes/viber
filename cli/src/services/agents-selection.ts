import { CliError } from '../lib/utils/errors.js'
import { type ResolvedConfig } from '../lib/config/schema.js'
import { parseProjectAgentsValue } from '../lib/config/agents.js'

export type AgentsSelectionOptions = {
  selectedName?: string
  noGlobal?: boolean
}

export type AgentsSelectionResult = {
  globalContent?: string
  projectContent?: string
  selectedName?: string
}

export function resolveAgentsSelection(
  resolved: ResolvedConfig,
  options: AgentsSelectionOptions
): AgentsSelectionResult {
  if (options.selectedName && options.noGlobal) {
    throw new CliError('Cannot select a global AGENTS entry and disable global AGENTS.')
  }

  const globalAgents = resolved.global?.agents ?? {}
  const projectValue = parseProjectAgentsValue(resolved.project)

  const noGlobal = Boolean(options.noGlobal) || projectValue.noGlobal

  let selectedName: string | undefined = options.selectedName
  if (!selectedName && !noGlobal && projectValue.referenceName) {
    selectedName = projectValue.referenceName
  }
  if (!selectedName && !noGlobal && Object.prototype.hasOwnProperty.call(globalAgents, 'default')) {
    selectedName = 'default'
  }

  if (selectedName && !Object.prototype.hasOwnProperty.call(globalAgents, selectedName)) {
    throw new CliError(`AGENTS content not found: ${selectedName}`)
  }

  return {
    globalContent: selectedName ? globalAgents[selectedName] : undefined,
    projectContent: projectValue.projectText,
    selectedName,
  }
}
