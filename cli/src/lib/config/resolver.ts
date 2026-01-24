import path from "node:path";
import { findProjectConfig } from "./discovery.js";
import {
  DEFAULT_PROFILE_NAME,
  FolderMappingSchema,
  ResolvedConfigSchema,
  type FolderMapping,
  type ResolvedConfig,
} from "./schema.js";
import { readGlobalConfig, readProjectConfig, getGlobalConfigPath } from "./store.js";
import { WORKDIR } from "../utils/paths.js";

function implicitMapping(cwd: string): FolderMapping {
  return FolderMappingSchema.parse({
    sourcePath: cwd,
    targetPath: WORKDIR,
    mode: "rw",
  });
}

export async function resolveConfig(cwd: string): Promise<ResolvedConfig> {
  const absoluteCwd = path.resolve(cwd);
  const projectConfigPath = findProjectConfig(absoluteCwd);
  const project = projectConfigPath
    ? await readProjectConfig(projectConfigPath)
    : undefined;
  const global = await readGlobalConfig();
  const globalConfigPath = getGlobalConfigPath();

  const effectiveMappings =
    project?.mappings && project.mappings.length > 0
      ? project.mappings
      : global?.defaultMappings && global.defaultMappings.length > 0
        ? global.defaultMappings
        : [implicitMapping(absoluteCwd)];

  const defaultProfileName = global?.defaultImageProfile ?? DEFAULT_PROFILE_NAME;
  let imageProfile: string | undefined = project?.imageProfile;
  let imageReference: string | undefined = project?.imageReference;

  if (!imageProfile && !imageReference) {
    imageProfile = defaultProfileName;
  }

  return ResolvedConfigSchema.parse({
    project,
    global,
    projectConfigPath: projectConfigPath ?? undefined,
    globalConfigPath,
    effectiveMappings,
    imageProfile,
    imageReference,
    defaultProfileName,
  });
}
