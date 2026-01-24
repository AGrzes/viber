import { describe, expect, it } from "vitest";
import { ENV_CODEX_HOME, ENV_GLOBAL_CONFIG, ENV_PROJECT_CONFIG } from "../../src/lib/utils/env.js";

describe("env constants", () => {
  it("exports expected config env names", () => {
    expect(ENV_PROJECT_CONFIG).toBe("VIBER_PROJECT_CONFIG");
    expect(ENV_GLOBAL_CONFIG).toBe("VIBER_GLOBAL_CONFIG");
    expect(ENV_CODEX_HOME).toBe("CODEX_HOME");
  });
});
