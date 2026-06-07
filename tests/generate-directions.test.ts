import { describe, expect, it, vi } from "vitest";
import { sampleProject } from "@/lib/sample/project";
import { generateDirectionsWithHarness } from "@/lib/harness/generate-directions";

describe("generateDirectionsWithHarness", () => {
  it("builds a source-grounded prompt and records a succeeded trace", async () => {
    const provider = {
      generateJson: vi.fn(async ({ user, maxTokens }: { system: string; user: string; maxTokens?: number }) => {
        expect(user).toContain("chapter_1:p_001");
        expect(user).toContain("web-drama-hooks");
        expect(user).toContain("Return JSON only");
        expect(user).toContain("Return exactly 2 direction objects");
        expect(maxTokens).toBe(900);

        return [
          {
            id: "direction_ai_web",
            title: "AI 生成短剧方向",
            target_medium: "短剧",
            logline: "林澈进入旧城北站，发现哥哥的警告指向更大的事故预演。",
            recommendation_reason: "原文有封闭空间、警告和时间矛盾，适合短剧强钩子。",
            preserve: ["旧城北站", "哥哥警告"],
            transform: ["把调查线索前置为危机"],
            risks: ["过快揭示会削弱悬疑"],
            audience: "短剧悬疑观众",
            source_refs: ["chapter_1:p_001", "chapter_1:p_002"]
          }
        ];
      })
    };

    const result = await generateDirectionsWithHarness({
      project: sampleProject,
      provider,
      model: "qwen3.6-27b",
      now: () => "2026-06-07T00:00:00.000Z"
    });

    expect(result.directions).toHaveLength(1);
    expect(result.run).toMatchObject({
      step: "generate_directions",
      status: "succeeded",
      model: "qwen3.6-27b",
      source_chunks_used: [
        "chapter_1:p_001",
        "chapter_2:p_001",
        "chapter_3:p_001",
        "chapter_1:p_002"
      ],
      knowledge_packs_used: [
        "adaptation-principles",
        "web-drama-hooks",
        "prose-to-action",
        "dialogue-compression",
        "scene-beats",
        "screenplay-yaml-rules"
      ]
    });
  });

  it("returns a failed trace when provider output does not match direction schema", async () => {
    const provider = {
      generateJson: vi.fn(async () => [{ title: "" }])
    };

    const result = await generateDirectionsWithHarness({
      project: sampleProject,
      provider,
      model: "qwen3.6-27b",
      now: () => "2026-06-07T00:00:00.000Z"
    });

    expect(result.directions).toBeUndefined();
    expect(result.run.status).toBe("failed");
    expect(result.run.error).toContain("Invalid structured output");
  });

  it("accepts a JSON object wrapper from compatible JSON mode providers", async () => {
    const provider = {
      generateJson: vi.fn(async () => ({
        directions: [
          {
            id: "direction_wrapped",
            title: "对象包装方向",
            target_medium: "短剧",
            logline: "林澈在旧车站追查事故记录，发现警告来自未来。",
            recommendation_reason: "JSON mode often requires a top-level object while the app still needs a direction list.",
            preserve: ["旧车站", "事故记录"],
            transform: ["把线索集中到第一集"],
            risks: ["悬疑解释过早"],
            audience: "悬疑短剧观众",
            source_refs: ["chapter_1:p_001"]
          }
        ]
      }))
    };

    const result = await generateDirectionsWithHarness({
      project: sampleProject,
      provider,
      model: "qwen3.6-27b",
      now: () => "2026-06-07T00:00:00.000Z"
    });

    expect(result.directions).toHaveLength(1);
    expect(result.directions?.[0].id).toBe("direction_wrapped");
    expect(result.run.status).toBe("succeeded");
  });
});
