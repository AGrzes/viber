import { resolveConfig } from "../lib/config/resolver.js";
import { validateMappings } from "../lib/config/validation.js";
import { runPodman } from "../lib/podman/runner.js";
import { CliError } from "../lib/utils/errors.js";
import { log } from "../lib/utils/log.js";
import { getHostIdentity } from "../lib/utils/identity.js";
import { WORKDIR, CODEX_AGENTS_TARGET, CODEX_DIR } from "../lib/utils/paths.js";
import { ENV_CODEX_HOME } from "../lib/utils/env.js";
import { buildSessionEnv } from "./sessionEnv.js";
import { type FolderMapping } from "../lib/config/schema.js";
import { getProfileOrThrow } from "./profiles.js";
import { resolveAgentSelection } from "./agents-selection.js";
import { buildAgentsContent, writeAgentsFile } from "./agents-file.js";

export type SessionOptions = {
  cwd: string;
  command?: string[];
  imageProfile?: string;
  imageReference?: string;
  dryRun?: boolean;
  agents?: string;
  agentsNoGlobal?: boolean;
};

async function resolveImageRef(
  resolved: Awaited<ReturnType<typeof resolveConfig>>,
  overrides: Pick<SessionOptions, "imageProfile" | "imageReference">
): Promise<string> {
  if (overrides.imageReference) {
    return overrides.imageReference;
  }

  if (overrides.imageProfile) {
    const profile = await getProfileOrThrow(overrides.imageProfile);
    return profile.baseImageRef;
  }

  if (resolved.imageReference) {
    return resolved.imageReference;
  }

  if (resolved.imageProfile) {
    const profile = await getProfileOrThrow(resolved.imageProfile);
    return profile.baseImageRef;
  }

  throw new CliError("No image selected. Set imageProfile, imageReference, or a default profile.");
}

export async function runSession(options: SessionOptions): Promise<number> {
  if (options.imageProfile && options.imageReference) {
    throw new CliError("image profile and image reference cannot both be set.");
  }

  const resolved = await resolveConfig(options.cwd);
  log.config("resolved config", resolved);

  const issues = validateMappings(resolved.effectiveMappings);
  if (issues.length > 0) {
    const details = issues.map((issue) => `${issue.field}: ${issue.message}`).join("; ");
    throw new CliError(`Invalid mappings: ${details}`);
  }

  const selection = resolveAgentSelection(resolved, {
    selectedName: options.agents,
    noGlobal: options.agentsNoGlobal,
  });
  const agentsContent = buildAgentsContent(selection.globalContent, selection.projectContent);
  const agentsFilePath = agentsContent ? await writeAgentsFile(agentsContent) : null;

  const imageRef = await resolveImageRef(resolved, {
    imageProfile: options.imageProfile,
    imageReference: options.imageReference,
  });
  log.podman("using image", imageRef);

  const identity = getHostIdentity();
  if (!identity) {
    throw new CliError("Host identity is unavailable; cannot determine UID/GID.");
  }

  const { env, extraMounts } = buildSessionEnv(resolved, process.env);

  if (agentsFilePath) {
    extraMounts.push({
      sourcePath: agentsFilePath,
      targetPath: CODEX_AGENTS_TARGET,
      mode: "ro",
    });
    env[ENV_CODEX_HOME] = CODEX_DIR;
  }

  const fallbackMapping: FolderMapping = {
    sourcePath: options.cwd,
    targetPath: WORKDIR,
    mode: "rw",
  };
  const mappings =
    resolved.effectiveMappings.length > 0
      ? resolved.effectiveMappings
      : [fallbackMapping];

  log.session("workdir", WORKDIR);
  log.env("env", env);

  return runPodman({
    imageRef,
    interactive: true,
    mappings,
    extraMounts,
    workdir: WORKDIR,
    env,
    uid: identity.uid,
    gid: identity.gid,
    usernsMode: "keep-id",
    dryRun: options.dryRun,
    command: options.command,
  });
}
