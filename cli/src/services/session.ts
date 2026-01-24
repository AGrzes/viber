import { resolveConfig } from "../lib/config/resolver.js";
import { validateMappings } from "../lib/config/validation.js";
import { runPodman } from "../lib/podman/runner.js";
import { CliError } from "../lib/utils/errors.js";
import { log } from "../lib/utils/log.js";

export type SessionMode = "interactive" | "one-off";

export type SessionOptions = {
  cwd: string;
  mode: SessionMode;
  command?: string[];
};

function resolveImageRef(resolved: Awaited<ReturnType<typeof resolveConfig>>): string {
  if (!resolved.imageSource) {
    throw new CliError("No image selected. Set imageProfile, imageReference, or a global default.");
  }

  if (resolved.imageSourceType === "reference") {
    return resolved.imageSource;
  }

  const profiles = resolved.global?.imageProfiles ?? [];
  const profile = profiles.find((p) => p.name === resolved.imageSource);
  if (!profile) {
    throw new CliError(`Image profile not found: ${resolved.imageSource}`);
  }

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

  const imageRef = resolveImageRef(resolved);
  log.podman("using image", imageRef);

  return runPodman({
    imageRef,
    interactive: options.mode === "interactive",
    mappings: resolved.effectiveMappings,
    command: options.command,
  });
}
