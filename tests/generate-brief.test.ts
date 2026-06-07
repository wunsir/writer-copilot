import { describe, expect, it, vi } from "vitest";
import { sampleProject } from "@/lib/sample/project";
import { generateBriefWithHarness } from "@/lib/harness/generate-brief";

describe("generateBriefWithHarness", () => {
  it("uses diagnosis, selected direction, source refs, and knowledge packs to build a validated brief", async () => {
    const provider = {
      generateJson: vi.fn(async ({ user, maxTokens }: { system: string; user: string; maxTokens?: number }) => {
        expect(user).toContain("短剧强钩子版");
        expect(user).toContain("林澈追查哥哥失踪真相");
        expect(user).toContain("chapter_1:p_001");
        expect(user).toContain("adaptation-principles");
        expect(user).toContain("Return JSON only");
        expect(maxTokens).toBe(850);

        return {
          brief: {
            target_medium: "短剧",
            pacing: "快",
            fidelity: "中等",
            tone: "悬疑",
            strategy: ["钩子前置", "视觉证据", "危险前置"],
            preserve: ["哥哥警告", "旧城北站封锁", "周询时间矛盾"],
            transform: ["把隐藏维护室提前为第一集结尾反转"],
            avoid: ["第一场解释完整阴谋", "用旁白替代可拍证据"],
            source_refs: ["chapter_1:p_001", "chapter_1:p_002", "chapter_2:p_002"]
          }
        };
      })
    };

    const result = await generateBriefWithHarness({
      project: sampleProject,
      selectedDirection: sampleProject.directions[0],
      provider,
      model: "qwen3.6-27b",
      now: () => "2026-06-07T00:00:00.000Z"
    });

    expect(result.brief?.strategy).toContain("钩子前置");
    expect(result.run).toMatchObject({
      step: "generate_brief",
      status: "succeeded",
      model: "qwen3.6-27b",
      source_chunks_used: ["chapter_1:p_001", "chapter_1:p_002", "chapter_3:p_001", "chapter_2:p_002"],
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

  it("returns a failed trace when provider output does not match brief schema", async () => {
    const provider = {
      generateJson: vi.fn(async () => ({
        brief: {
          target_medium: ""
        }
      }))
    };

    const result = await generateBriefWithHarness({
      project: sampleProject,
      selectedDirection: sampleProject.directions[0],
      provider,
      model: "qwen3.6-27b",
      now: () => "2026-06-07T00:00:00.000Z"
    });

    expect(result.brief).toBeUndefined();
    expect(result.run.status).toBe("failed");
    expect(result.run.error).toContain("Invalid structured output");
  });
});
