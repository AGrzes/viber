import { resolveConfig } from "../lib/config/resolver.js";
import { validateMappings } from "../lib/config/validation.js";
import { runPodman } from "../lib/podman/runner.js";
import { CliError } from "../lib/utils/errors.js";
import { log } from "../lib/utils/log.js";
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

  if (!resolved.imageSource) {
    throw new CliError("No image selected. Set imageProfile, imageReference, or a global default.");
  }

  if (resolved.imageSourceType === "reference") {
    return resolved.imageSource;
  }

  const profile = await getProfileOrThrow(resolved.imageSource);
  return profile.baseImageRef;
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

  return runPodman({
    imageRef,
    interactive: options.mode === "interactive",
    mappings: resolved.effectiveMappings,
    command: options.command,
  });
}
