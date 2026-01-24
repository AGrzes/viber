import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { resolveConfig } from "../../src/lib/config/resolver.js";
import { runSession } from "../../src/services/session.js";

vi.mock("../../src/lib/podman/runner.js", () => ({
  runPodman: vi.fn().mockResolvedValue(0),
}));

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "viber-image-"));
}

describe("image resolution", () => {
  it("uses default profile when none specified", async () => {
    const tempDir = makeTempDir();
    const resolved = await resolveConfig(tempDir);
    expect(resolved.imageProfile).toBe("default");
  });

  it("rejects imageProfile + imageReference override", async () => {
    await expect(
      runSession({
        cwd: process.cwd(),
        mode: "one-off",
        imageProfile: "default",
        imageReference: "example:latest",
      })
    ).rejects.toThrow(/image profile.*image reference/i);
  });
});
