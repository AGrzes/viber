import { CliError } from "../lib/utils/errors.js";
import { type ResolvedConfig } from "../lib/config/schema.js";
import { parseProjectAgentsValue } from "../lib/config/agents.js";

export type AgentSelectionOptions = {
  selectedName?: string;
  noGlobal?: boolean;
};

export type AgentSelectionResult = {
  globalContent?: string;
  projectContent?: string;
  selectedName?: string;
};

export function resolveAgentSelection(
  resolved: ResolvedConfig,
  options: AgentSelectionOptions
): AgentSelectionResult {
  if (options.selectedName && options.noGlobal) {
    throw new CliError("Cannot select a global agent name and disable global agents.");
  }

  const globalAgents = resolved.global?.agents ?? {};
  const projectValue = parseProjectAgentsValue(resolved.project?.agents);

  const noGlobal = Boolean(options.noGlobal) || projectValue.noGlobal;

  let selectedName: string | undefined = options.selectedName;
  if (!selectedName && !noGlobal && projectValue.referenceName) {
    selectedName = projectValue.referenceName;
  }
  if (!selectedName && !noGlobal && Object.prototype.hasOwnProperty.call(globalAgents, "default")) {
    selectedName = "default";
  }

  if (selectedName && !Object.prototype.hasOwnProperty.call(globalAgents, selectedName)) {
    throw new CliError(`Agent content not found: ${selectedName}`);
  }

  return {
    globalContent: selectedName ? globalAgents[selectedName] : undefined,
    projectContent: projectValue.projectText,
    selectedName,
  };
}
