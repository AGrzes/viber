import { spawn } from "node:child_process";
import { type FolderMapping } from "../config/schema.js";

export type PodmanRunOptions = {
  imageRef: string;
  interactive: boolean;
  mappings: FolderMapping[];
  extraMounts?: FolderMapping[];
  workdir?: string;
  env?: Record<string, string>;
  uid?: number;
  gid?: number;
  usernsMode?: string;
  dryRun?: boolean;
  command?: string[];
};

export function formatPodmanCommand(args: string[]): string {
  return ["podman", ...args].join(" ");
}

export function buildPodmanArgs(options: PodmanRunOptions): string[] {
  const args: string[] = ["run", "--rm"];

  if (options.interactive) {
    args.push("-it");
  }

  if (options.usernsMode) {
    args.push(`--userns=${options.usernsMode}`);
  }

  if (typeof options.uid === "number" && typeof options.gid === "number") {
    args.push("--user", `${options.uid}:${options.gid}`);
  }

  if (options.workdir) {
    args.push("-w", options.workdir);
  }

  if (options.env) {
    for (const [key, value] of Object.entries(options.env)) {
      args.push("-e", `${key}=${value}`);
    }
  }

  const mounts = [...options.mappings, ...(options.extraMounts ?? [])];
  for (const mapping of mounts) {
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
  if (options.dryRun) {
    console.log(formatPodmanCommand(args));
    return Promise.resolve(0);
  }

  return new Promise((resolve, reject) => {
    const child = spawn("podman", args, { stdio: "inherit" });

    child.on("error", (err) => reject(err));
    child.on("exit", (code) => resolve(code ?? 1));
  });
}
