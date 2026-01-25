import { describe, expect, it } from "vitest";
import { resolveAgentsSelection } from "../../src/services/agents-selection.js";
import { type ResolvedConfig } from "../../src/lib/config/schema.js";

function makeResolvedConfig(overrides: Partial<ResolvedConfig>): ResolvedConfig {
  return {
    project: undefined,
    global: undefined,
    projectConfigPath: undefined,
    globalConfigPath: undefined,
    projectEnvMappings: undefined,
    globalEnvMappings: undefined,
    effectiveMappings: [],
    imageProfile: undefined,
    imageReference: undefined,
    defaultProfileName: undefined,
    ...overrides,
  };
}

describe("resolveAgentsSelection", () => {
  it("uses explicit CLI selection", () => {
    const resolved = makeResolvedConfig({
      global: { agents: { alpha: "A" } },
    });

    const result = resolveAgentsSelection(resolved, { selectedName: "alpha" });

    expect(result.globalContent).toBe("A");
    expect(result.selectedName).toBe("alpha");
  });

  it("throws on missing global name", () => {
    const resolved = makeResolvedConfig({
      global: { agents: {} },
    });

    expect(() =>
      resolveAgentsSelection(resolved, { selectedName: "missing" })
    ).toThrowError(/AGENTS content not found/);
  });

  it("uses project reference when provided", () => {
    const resolved = makeResolvedConfig({
      project: { agentsRef: "beta" },
      global: { agents: { beta: "B" } },
    });

    const result = resolveAgentsSelection(resolved, {});

    expect(result.globalContent).toBe("B");
    expect(result.selectedName).toBe("beta");
  });

  it("falls back to default when available", () => {
    const resolved = makeResolvedConfig({
      global: { agents: { default: "D" } },
    });

    const result = resolveAgentsSelection(resolved, {});

    expect(result.globalContent).toBe("D");
    expect(result.selectedName).toBe("default");
  });

  it("respects project no-global", () => {
    const resolved = makeResolvedConfig({
      project: { agents: null, agentsRef: "default" },
      global: { agents: { default: "D" } },
    });

    const result = resolveAgentsSelection(resolved, {});

    expect(result.globalContent).toBeUndefined();
  });

  it("errors on conflicting CLI flags", () => {
    const resolved = makeResolvedConfig({
      global: { agents: { default: "D" } },
    });

    expect(() =>
      resolveAgentsSelection(resolved, { selectedName: "default", noGlobal: true })
    ).toThrowError(/Cannot select a global AGENTS entry and disable global AGENTS/);
  });
});
