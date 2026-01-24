import prompts from "prompts";
import { isValidEnvKey } from "../lib/config/envMappings.js";
import { type EnvMappingEntry, type FolderMapping, type ProjectConfig } from "../lib/config/schema.js";

async function promptMappings(): Promise<FolderMapping[]> {
  const mappings: FolderMapping[] = [];

  while (true) {
    const { add } = await prompts({
      type: "confirm",
      name: "add",
      message: "Add a folder mapping?",
      initial: mappings.length === 0,
    });

    if (!add) break;

    const response = await prompts([
      {
        type: "text",
        name: "sourcePath",
        message: "Source path",
        validate: (value) => (value ? true : "sourcePath is required"),
      },
      {
        type: "text",
        name: "targetPath",
        message: "Target path (leave empty to use source)",
      },
      {
        type: "select",
        name: "mode",
        message: "Access mode",
        choices: [
          { title: "read-write", value: "rw" },
          { title: "read-only", value: "ro" },
        ],
      },
      {
        type: "text",
        name: "label",
        message: "Label (optional)",
      },
    ]);

    mappings.push({
      sourcePath: response.sourcePath,
      targetPath: response.targetPath || undefined,
      mode: response.mode,
      label: response.label || undefined,
    });
  }

  return mappings;
}

async function promptEnvMappings(): Promise<EnvMappingEntry[]> {
  const mappings: EnvMappingEntry[] = [];

  while (true) {
    const { add } = await prompts({
      type: "confirm",
      name: "add",
      message: "Add an env mapping?",
      initial: mappings.length === 0,
    });

    if (!add) break;

    const response = await prompts([
      {
        type: "text",
        name: "key",
        message: "Env key",
        validate: (value) => (isValidEnvKey(value) ? true : "Invalid env key"),
      },
      {
        type: "text",
        name: "value",
        message: "Env value (empty allowed)",
      },
    ]);

    mappings.push({
      key: response.key,
      value: response.value ?? "",
    });
  }

  return mappings;
}

export async function runConfigWizard(): Promise<ProjectConfig> {
  const { imageChoice } = await prompts({
    type: "select",
    name: "imageChoice",
    message: "Image selection",
    choices: [
      { title: "Use image profile", value: "profile" },
      { title: "Use direct image reference", value: "reference" },
      { title: "Use global defaults", value: "none" },
    ],
  });

  let imageProfile: string | undefined;
  let imageReference: string | undefined;

  if (imageChoice === "profile") {
    const { value } = await prompts({
      type: "text",
      name: "value",
      message: "Profile name",
    });
    imageProfile = value || undefined;
  }

  if (imageChoice === "reference") {
    const { value } = await prompts({
      type: "text",
      name: "value",
      message: "Image reference",
    });
    imageReference = value || undefined;
  }

  const mappings = await promptMappings();
  const envMappings = await promptEnvMappings();

  return {
    mappings: mappings.length > 0 ? mappings : undefined,
    imageProfile,
    imageReference,
    envMappings: envMappings.length > 0 ? envMappings : undefined,
  };
}
