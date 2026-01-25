import { describe, expect, it } from "vitest";
import { buildAgentsContent } from "../../src/services/agents-file.js";

describe("buildAgentsContent", () => {
  it("returns null when no content", () => {
    expect(buildAgentsContent(undefined, undefined)).toBeNull();
  });

  it("returns only global content", () => {
    expect(buildAgentsContent("Global", undefined)).toBe("Global");
  });

  it("returns only project content", () => {
    expect(buildAgentsContent(undefined, "Project")).toBe("Project");
  });

  it("joins global and project with a blank line", () => {
    expect(buildAgentsContent("Global", "Project")).toBe("Global\n\nProject");
  });
});
