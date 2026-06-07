import { describe, expect, it } from "vitest";
import { getKnowledgePack, listKnowledgePacks, selectKnowledgePacks } from "@/lib/knowledge/knowledge-packs";

describe("knowledge packs", () => {
  it("lists initial adaptation craft packs with content", () => {
    const packs = listKnowledgePacks();

    expect(packs.map((pack) => pack.id)).toEqual([
      "adaptation-principles",
      "web-drama-hooks",
      "film-opening",
      "prose-to-action",
      "dialogue-compression",
      "scene-beats",
      "screenplay-yaml-rules"
    ]);
    expect(packs.every((pack) => pack.title.length > 0)).toBe(true);
    expect(packs.every((pack) => pack.content.length > 40)).toBe(true);
  });

  it("selects short-drama packs from target medium and strategies", () => {
    const selection = selectKnowledgePacks({
      targetMedium: "短剧",
      strategies: ["钩子前置", "内心外化"],
      tone: "悬疑"
    });

    expect(selection.map((item) => item.pack.id)).toEqual([
      "adaptation-principles",
      "web-drama-hooks",
      "prose-to-action",
      "dialogue-compression",
      "scene-beats",
      "screenplay-yaml-rules"
    ]);
    expect(selection.find((item) => item.pack.id === "web-drama-hooks")?.reason).toContain("短剧");
    expect(selection.find((item) => item.pack.id === "prose-to-action")?.reason).toContain("内心外化");
  });

  it("returns a specific pack by id", () => {
    const pack = getKnowledgePack("screenplay-yaml-rules");

    expect(pack.id).toBe("screenplay-yaml-rules");
    expect(pack.content).toContain("source_refs");
  });
});

