import { describe, expect, it } from "vitest";
import { buildSourceIndex, searchSourceChunks } from "@/lib/source/source-index";
import type { SourceChunk } from "@/lib/domain/schemas";

const chunks: SourceChunk[] = [
  {
    id: "chapter_1:p_001",
    chapter_id: "chapter_1",
    text: "林澈站在旧城北站门口，铁链从门内绕出。",
    summary: "车站从内部被封住。",
    keywords: ["旧城北站", "铁链"],
    detected_names: ["林澈"]
  },
  {
    id: "chapter_2:p_001",
    chapter_id: "chapter_2",
    text: "封站通知上签着周询的名字，时间早于事故。",
    summary: "周询的签字暴露时间矛盾。",
    keywords: ["周询", "封站通知", "事故"],
    detected_names: ["周询"]
  },
  {
    id: "chapter_3:p_001",
    chapter_id: "chapter_3",
    text: "墙后传来哥哥的声音：那场事故只是排练。",
    summary: "哥哥揭示事故背后还有更大计划。",
    keywords: ["哥哥", "事故", "排练"],
    detected_names: []
  }
];

describe("source index", () => {
  it("returns source chunks ranked by query relevance", () => {
    const index = buildSourceIndex(chunks);

    const results = searchSourceChunks(index, "周询 事故");

    expect(results.map((result) => result.chunk.id)).toEqual([
      "chapter_2:p_001",
      "chapter_3:p_001"
    ]);
    expect(results[0].score).toBeGreaterThan(results[1].score);
    expect(results[0].matched_terms).toEqual(["周询", "事故"]);
  });

  it("falls back to keywords and detected names", () => {
    const index = buildSourceIndex(chunks);

    const results = searchSourceChunks(index, "铁链 林澈");

    expect(results[0].chunk.id).toBe("chapter_1:p_001");
    expect(results[0].matched_terms).toEqual(["铁链", "林澈"]);
  });

  it("returns an empty list for blank queries", () => {
    const index = buildSourceIndex(chunks);

    expect(searchSourceChunks(index, "   ")).toEqual([]);
  });
});

