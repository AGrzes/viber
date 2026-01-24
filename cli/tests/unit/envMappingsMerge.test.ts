import { describe, expect, it } from "vitest";
import { mergeEnvMappings } from "../../src/lib/utils/envMappings.js";

describe("mergeEnvMappings", () => {
  it("merges global and project mappings with project override", () => {
    const merged = mergeEnvMappings(
      [
        { key: "FOO", value: "one" },
        { key: "BAR", value: "two" },
      ],
      [
        { key: "BAR", value: "override" },
        { key: "BAZ", value: "three" },
      ]
    );

    expect(merged).toEqual({
      FOO: "one",
      BAR: "override",
      BAZ: "three",
    });
  });
});
