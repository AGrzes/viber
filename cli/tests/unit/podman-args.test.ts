import { describe, expect, it } from "vitest";
import { buildPodmanArgs } from "../../src/lib/podman/runner.js";
import { WORKDIR, CODEX_DIR, CODEX_AUTH_TARGET } from "../../src/lib/utils/paths.js";
import { ENV_CODEX_HOME, ENV_PROJECT_CONFIG, ENV_GLOBAL_CONFIG } from "../../src/lib/utils/env.js";

const baseMapping = {
  sourcePath: "/host/project",
  targetPath: WORKDIR,
  mode: "rw",
};

const authMapping = {
  sourcePath: "/home/user/.codex/auth.json",
  targetPath: CODEX_AUTH_TARGET,
  mode: "ro",
};

describe("buildPodmanArgs", () => {
  it("includes userns keep-id and explicit UID:GID", () => {
    const args = buildPodmanArgs({
      imageRef: "example:latest",
      interactive: false,
      mappings: [baseMapping],
      usernsMode: "keep-id",
      uid: 1000,
      gid: 1001,
    });

    expect(args).toContain("--userns=keep-id");
    expect(args).toContain("--user");
    expect(args).toContain("1000:1001");
  });

  it("includes workdir and CODEX_HOME when auth mount is present", () => {
    const args = buildPodmanArgs({
      imageRef: "example:latest",
      interactive: true,
      mappings: [baseMapping],
      extraMounts: [authMapping],
      workdir: WORKDIR,
      env: {
        [ENV_CODEX_HOME]: CODEX_DIR,
      },
    });

    expect(args).toContain("-w");
    expect(args).toContain(WORKDIR);
    expect(args).toContain("-e");
    expect(args).toContain(`${ENV_CODEX_HOME}=${CODEX_DIR}`);
    expect(args).toContain(`-v`);
    expect(args).toContain(`${authMapping.sourcePath}:${authMapping.targetPath}:${authMapping.mode}`);
  });

  it("includes project and global config env vars", () => {
    const args = buildPodmanArgs({
      imageRef: "example:latest",
      interactive: false,
      mappings: [baseMapping],
      env: {
        [ENV_PROJECT_CONFIG]: "/path/project/.viber.json",
        [ENV_GLOBAL_CONFIG]: "/home/user/.viber/config.json",
      },
    });

    expect(args).toContain(`${ENV_PROJECT_CONFIG}=/path/project/.viber.json`);
    expect(args).toContain(`${ENV_GLOBAL_CONFIG}=/home/user/.viber/config.json`);
  });
});
