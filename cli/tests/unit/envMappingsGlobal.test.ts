import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";

async function loadStore(tempHome: string) {
  process.env.HOME = tempHome;
  process.env.USERPROFILE = tempHome;
  vi.resetModules();
  return await import("../../src/lib/config/envMappingsStore.js");
}

describe("env mapping global CRUD", () => {
  it("sets, gets, lists, and deletes global mappings", async () => {
    const tempHome = fs.mkdtempSync(path.join(os.tmpdir(), "viber-home-"));
    const store = await loadStore(tempHome);

    await store.setEnvMapping("global", "API_URL", "https://example");

    const fetched = await store.getEnvMapping("global", "API_URL");
    expect(fetched).toEqual({ key: "API_URL", value: "https://example" });

    const list = await store.listEnvMappings("global");
    expect(list).toEqual([{ key: "API_URL", value: "https://example" }]);

    await store.deleteEnvMapping("global", "API_URL");

    const missing = await store.getEnvMapping("global", "API_URL");
    expect(missing).toBeNull();
  });
});
