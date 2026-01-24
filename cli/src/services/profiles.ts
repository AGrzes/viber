import { readGlobalConfig, writeGlobalConfig } from "../lib/config/store.js";
import { type ImageProfile } from "../lib/config/schema.js";
import { CliError } from "../lib/utils/errors.js";

export async function listProfiles(): Promise<ImageProfile[]> {
  const global = await readGlobalConfig();
  return global?.imageProfiles ?? [];
}

export async function getProfileOrThrow(name: string): Promise<ImageProfile> {
  const profiles = await listProfiles();
  const profile = profiles.find((p) => p.name === name);
  if (!profile) throw new CliError(`Image profile not found: ${name}`);
  return profile;
}

export async function upsertProfile(profile: ImageProfile): Promise<void> {
  const global = (await readGlobalConfig()) ?? { imageProfiles: [] };
  const existing = global.imageProfiles ?? [];
  const next = existing.filter((p) => p.name !== profile.name);
  next.push(profile);
  await writeGlobalConfig({ ...global, imageProfiles: next });
}

export async function deleteProfile(name: string): Promise<void> {
  const global = await readGlobalConfig();
  if (!global?.imageProfiles) throw new CliError(`Image profile not found: ${name}`);
  const next = global.imageProfiles.filter((p) => p.name !== name);
  if (next.length === global.imageProfiles.length) {
    throw new CliError(`Image profile not found: ${name}`);
  }
  await writeGlobalConfig({ ...global, imageProfiles: next });
}
