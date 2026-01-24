import os from "node:os";
import path from "node:path";
import { z } from "zod";

export const PROJECT_CONFIG_NAME = ".viber.json";
export const GLOBAL_CONFIG_PATH = path.join(os.homedir(), ".viber", "config.json");
export const DEFAULT_PROFILE_NAME = "default";
export const ENV_KEY_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

export const FolderMappingSchema = z.object({
  sourcePath: z.string().min(1),
  targetPath: z.string().optional(),
  mode: z.enum(["rw", "ro"]),
  label: z.string().optional(),
});

export const ImageProfileSchema = z.object({
  name: z.string().min(1),
  baseImageRef: z.string().min(1),
  notes: z.string().optional(),
  buildSteps: z.array(z.string()).optional(),
});

export const SkillsPaletteSchema = z.object({
  name: z.string().min(1),
  entries: z.array(z.string()).default([]),
});

export const EnvMappingEntrySchema = z.object({
  key: z.string().regex(ENV_KEY_PATTERN),
  value: z.string(),
});

export const ProjectConfigSchema = z
  .object({
    envMappings: z.array(EnvMappingEntrySchema).optional(),
    mappings: z.array(FolderMappingSchema).optional(),
    imageProfile: z.string().optional(),
    imageReference: z.string().optional(),
    skillsPalette: z.string().optional(),
    networkPolicy: z.string().optional(),
  })
  .refine(
    (value) => !(value.imageProfile && value.imageReference),
    "imageProfile and imageReference are mutually exclusive"
  );

export const GlobalConfigSchema = z.object({
  envMappings: z.array(EnvMappingEntrySchema).optional(),
  defaultImageProfile: z.string().optional(),
  defaultMappings: z.array(FolderMappingSchema).optional(),
  imageProfiles: z.array(ImageProfileSchema).optional(),
  skillsPalettes: z.array(SkillsPaletteSchema).optional(),
});

export const ResolvedConfigSchema = z.object({
  project: ProjectConfigSchema.optional(),
  global: GlobalConfigSchema.optional(),
  projectConfigPath: z.string().optional(),
  globalConfigPath: z.string().optional(),
  projectEnvMappings: z.array(EnvMappingEntrySchema).optional(),
  globalEnvMappings: z.array(EnvMappingEntrySchema).optional(),
  effectiveMappings: z.array(FolderMappingSchema),
  imageProfile: z.string().optional(),
  imageReference: z.string().optional(),
  defaultProfileName: z.string().optional(),
});

export type FolderMapping = z.infer<typeof FolderMappingSchema>;
export type EnvMappingEntry = z.infer<typeof EnvMappingEntrySchema>;
export type ImageProfile = z.infer<typeof ImageProfileSchema>;
export type SkillsPalette = z.infer<typeof SkillsPaletteSchema>;
export type ProjectConfig = z.infer<typeof ProjectConfigSchema>;
export type GlobalConfig = z.infer<typeof GlobalConfigSchema>;
export type ResolvedConfig = z.infer<typeof ResolvedConfigSchema>;
