import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export function buildAgentsContent(
  globalContent?: string,
  projectContent?: string
): string | null {
  const hasGlobal = typeof globalContent === "string" && globalContent.length > 0;
  const hasProject = typeof projectContent === "string" && projectContent.length > 0;

  if (!hasGlobal && !hasProject) {
    return null;
  }

  if (hasGlobal && hasProject) {
    return `${globalContent}\n\n${projectContent}`;
  }

  return hasGlobal ? globalContent : projectContent ?? null;
}

export async function writeAgentsFile(content: string): Promise<string> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "viber-agents-"));
  const filePath = path.join(dir, "AGENTS.md");
  await fs.writeFile(filePath, content, "utf-8");
  return filePath;
}
