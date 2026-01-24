import { buildEnvMappings } from "../lib/utils/envMappings.js";
import { type FolderMapping, type ResolvedConfig } from "../lib/config/schema.js";
import { ENV_CODEX_HOME, ENV_PROJECT_CONFIG } from "../lib/utils/env.js";
import {
  CODEX_AUTH_TARGET,
  CODEX_DIR,
  getCodexAuthSource,
  hasCodexAuth,
} from "../lib/utils/paths.js";

export type SessionEnvResult = {
  env: Record<string, string>;
  extraMounts: FolderMapping[];
};

export function buildSessionEnv(
  resolved: ResolvedConfig,
  hostEnv: NodeJS.ProcessEnv,
  codexAuthEnabled = hasCodexAuth()
): SessionEnvResult {
  const env: Record<string, string> = {};
  const extraMounts: FolderMapping[] = [];

  if (codexAuthEnabled) {
    extraMounts.push({
      sourcePath: getCodexAuthSource(),
      targetPath: CODEX_AUTH_TARGET,
      mode: "ro",
    });
    env[ENV_CODEX_HOME] = CODEX_DIR;
  }

  if (resolved.projectConfigPath) {
    env[ENV_PROJECT_CONFIG] = resolved.projectConfigPath;
  }

  const envMappings = buildEnvMappings(
    resolved.globalEnvMappings ?? resolved.global?.envMappings,
    resolved.projectEnvMappings ?? resolved.project?.envMappings,
    hostEnv
  );

  for (const [key, value] of Object.entries(envMappings)) {
    env[key] = value;
  }

  return { env, extraMounts };
}
