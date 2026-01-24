import { spawn } from "node:child_process";
import { type FolderMapping } from "../config/schema.js";

export type PodmanRunOptions = {
  imageRef: string;
  interactive: boolean;
  mappings: FolderMapping[];
  command?: string[];
};

export function buildPodmanArgs(options: PodmanRunOptions): string[] {
  const args: string[] = ["run", "--rm"];

  if (options.interactive) {
    args.push("-it");
  }

  for (const mapping of options.mappings) {
    const target = mapping.targetPath ?? mapping.sourcePath;
    const mode = mapping.mode;
    args.push("-v", `${mapping.sourcePath}:${target}:${mode}`);
  }

  args.push(options.imageRef);

  if (options.command && options.command.length > 0) {
    args.push(...options.command);
  }

  return args;
}

export function runPodman(options: PodmanRunOptions): Promise<number> {
  const args = buildPodmanArgs(options);

  return new Promise((resolve, reject) => {
    const child = spawn("podman", args, { stdio: "inherit" });

    child.on("error", (err) => reject(err));
    child.on("exit", (code) => resolve(code ?? 1));
  });
}
