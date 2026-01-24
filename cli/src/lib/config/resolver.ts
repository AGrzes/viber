import path from "node:path";
import { findProjectConfig } from "./discovery.js";
import {
  FolderMappingSchema,
  ResolvedConfigSchema,
  type FolderMapping,
  type ResolvedConfig,
} from "./schema.js";
import { readGlobalConfig, readProjectConfig } from "./store.js";

function implicitMapping(cwd: string): FolderMapping {
  return FolderMappingSchema.parse({
    sourcePath: cwd,
    targetPath: cwd,
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

  const effectiveMappings =
    project?.mappings && project.mappings.length > 0
      ? project.mappings
      : global?.defaultMappings && global.defaultMappings.length > 0
        ? global.defaultMappings
        : [implicitMapping(absoluteCwd)];

  let imageSource: string | undefined;
  let imageSourceType: "profile" | "reference" | undefined;

  if (project?.imageReference) {
    imageSource = project.imageReference;
    imageSourceType = "reference";
  } else if (project?.imageProfile) {
    imageSource = project.imageProfile;
    imageSourceType = "profile";
  } else if (global?.defaultImageProfile) {
    imageSource = global.defaultImageProfile;
    imageSourceType = "profile";
  }

  return ResolvedConfigSchema.parse({
    project,
    global,
    effectiveMappings,
    imageSource,
    imageSourceType,
  });
}
