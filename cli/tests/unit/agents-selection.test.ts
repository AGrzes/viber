import { describe, expect, it } from "vitest";
import { resolveAgentSelection } from "../../src/services/agents-selection.js";
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

describe("resolveAgentSelection", () => {
  it("uses explicit CLI selection", () => {
    const resolved = makeResolvedConfig({
      global: { agents: { alpha: "A" } },
    });

    const result = resolveAgentSelection(resolved, { selectedName: "alpha" });

    expect(result.globalContent).toBe("A");
    expect(result.selectedName).toBe("alpha");
  });

  it("throws on missing global name", () => {
    const resolved = makeResolvedConfig({
      global: { agents: {} },
    });

    expect(() =>
      resolveAgentSelection(resolved, { selectedName: "missing" })
    ).toThrowError(/Agent content not found/);
  });

  it("uses project reference when provided", () => {
    const resolved = makeResolvedConfig({
      project: { agentsRef: "beta" },
      global: { agents: { beta: "B" } },
    });

    const result = resolveAgentSelection(resolved, {});

    expect(result.globalContent).toBe("B");
    expect(result.selectedName).toBe("beta");
  });

  it("falls back to default when available", () => {
    const resolved = makeResolvedConfig({
      global: { agents: { default: "D" } },
    });

    const result = resolveAgentSelection(resolved, {});

    expect(result.globalContent).toBe("D");
    expect(result.selectedName).toBe("default");
  });

  it("respects project no-global", () => {
    const resolved = makeResolvedConfig({
      project: { agents: null, agentsRef: "default" },
      global: { agents: { default: "D" } },
    });

    const result = resolveAgentSelection(resolved, {});

    expect(result.globalContent).toBeUndefined();
  });

  it("errors on conflicting CLI flags", () => {
    const resolved = makeResolvedConfig({
      global: { agents: { default: "D" } },
    });

    expect(() =>
      resolveAgentSelection(resolved, { selectedName: "default", noGlobal: true })
    ).toThrowError(/Cannot select/);
  });
});
