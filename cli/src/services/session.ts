import { resolveConfig } from "../lib/config/resolver.js";
import { validateMappings } from "../lib/config/validation.js";
import { runPodman } from "../lib/podman/runner.js";
import { CliError } from "../lib/utils/errors.js";
import { log } from "../lib/utils/log.js";
import { getHostIdentity } from "../lib/utils/identity.js";
import {
  CODEX_AUTH_TARGET,
  CODEX_DIR,
  WORKDIR,
  getCodexAuthSource,
  hasCodexAuth,
} from "../lib/utils/paths.js";
import {
  ENV_CODEX_HOME,
  ENV_GLOBAL_CONFIG,
  ENV_PROJECT_CONFIG,
} from "../lib/utils/env.js";
import { type FolderMapping } from "../lib/config/schema.js";
import { getProfileOrThrow } from "./profiles.js";

export type SessionMode = "interactive" | "one-off";

export type SessionOptions = {
  cwd: string;
  mode: SessionMode;
  command?: string[];
  imageProfile?: string;
  imageReference?: string;
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
  const resolved = await resolveConfig(options.cwd);
  log.config("resolved config", resolved);

  const issues = validateMappings(resolved.effectiveMappings);
  if (issues.length > 0) {
    const details = issues.map((issue) => `${issue.field}: ${issue.message}`).join("; ");
    throw new CliError(`Invalid mappings: ${details}`);
  }

  const imageRef = await resolveImageRef(resolved, {
    imageProfile: options.imageProfile,
    imageReference: options.imageReference,
  });
  log.podman("using image", imageRef);

  const identity = getHostIdentity();
  if (!identity) {
    throw new CliError("Host identity is unavailable; cannot determine UID/GID.");
  }

  const extraMounts: FolderMapping[] = [];
  const env: Record<string, string> = {};

  if (hasCodexAuth()) {
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
  if (resolved.globalConfigPath) {
    env[ENV_GLOBAL_CONFIG] = resolved.globalConfigPath;
  }

  const mappings =
    resolved.effectiveMappings.length > 0
      ? resolved.effectiveMappings
      : [{ sourcePath: options.cwd, targetPath: WORKDIR, mode: "rw" }];

  return runPodman({
    imageRef,
    interactive: options.mode === "interactive",
    mappings,
    extraMounts,
    workdir: WORKDIR,
    env,
    uid: identity.uid,
    gid: identity.gid,
    usernsMode: "keep-id",
    command: options.command,
  });
}
