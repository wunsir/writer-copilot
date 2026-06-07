import { describe, expect, it, vi } from "vitest";
import { sampleProject } from "@/lib/sample/project";
import { generateBlueprintWithHarness } from "@/lib/harness/generate-blueprint";

describe("generateBlueprintWithHarness", () => {
  it("uses the selected direction, brief, and source refs to build validated scene blueprints", async () => {
    const provider = {
      generateJson: vi.fn(async ({ user, maxTokens }: { system: string; user: string; maxTokens?: number }) => {
        expect(user).toContain("短剧强钩子版");
        expect(user).toContain("钩子前置");
        expect(user).toContain("chapter_1:p_001");
        expect(user).toContain("scene-beats");
        expect(user).toContain("Return JSON only");
        expect(maxTokens).toBe(1200);

        return {
          scene_blueprint: [
            {
              id: "blueprint_001",
              title: "门从里面锁上",
              source_chapters: ["chapter_1"],
              source_refs: ["chapter_1:p_001", "chapter_1:p_002"],
              story_beats: ["林澈抵达旧站", "门锁方向暴露异常", "哥哥警告出现"],
              adaptation_decision: {
                type: "externalize",
                reason: "用门锁和电子屏把原文疑惧转成可拍动作。"
              },
              estimated_duration: "2 分钟",
              action_preview: ["林澈剪断铁链，锁舌却朝候车厅内部落下。"],
              dialogue_preview: ["林澈：你是故意让我看到的。"]
            },
            {
              id: "blueprint_002",
              title: "早到一小时的签字",
              source_chapters: ["chapter_2"],
              source_refs: ["chapter_2:p_002", "chapter_3:p_001"],
              story_beats: ["信号灯引路", "封站通知出现", "隐藏空间抛出反转"],
              adaptation_decision: {
                type: "compress",
                reason: "把调查线和空间反转压缩成连续危机。"
              },
              estimated_duration: "3 分钟",
              action_preview: ["林澈拍下封站通知，线路图突然显出维护室。"],
              dialogue_preview: ["林澈：事故还没发生，他就已经封站了。"]
            }
          ]
        };
      })
    };

    const result = await generateBlueprintWithHarness({
      project: sampleProject,
      selectedDirection: sampleProject.directions[0],
      provider,
      model: "qwen3.6-27b",
      now: () => "2026-06-07T00:00:00.000Z"
    });

    expect(result.sceneBlueprint).toHaveLength(2);
    expect(result.run).toMatchObject({
      step: "generate_blueprint",
      status: "succeeded",
      model: "qwen3.6-27b",
      source_chunks_used: ["chapter_1:p_001", "chapter_1:p_002", "chapter_2:p_002", "chapter_3:p_001"],
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

  it("returns a failed trace when provider output does not match blueprint schema", async () => {
    const provider = {
      generateJson: vi.fn(async () => ({
        scene_blueprint: [{ title: "" }]
      }))
    };

    const result = await generateBlueprintWithHarness({
      project: sampleProject,
      selectedDirection: sampleProject.directions[0],
      provider,
      model: "qwen3.6-27b",
      now: () => "2026-06-07T00:00:00.000Z"
    });

    expect(result.sceneBlueprint).toBeUndefined();
    expect(result.run.status).toBe("failed");
    expect(result.run.error).toContain("Invalid structured output");
  });

  it("normalizes model decision rationale before validating the blueprint schema", async () => {
    const provider = {
      generateJson: vi.fn(async () => ({
        scene_blueprint: [
          {
            id: "blueprint_001",
            title: "门从里面锁上",
            source_chapters: ["chapter_1"],
            source_refs: ["chapter_1:p_001"],
            story_beats: ["林澈抵达旧站"],
            adaptation_decision: {
              type: "externalize",
              rationale: "把心理疑惧外化成门锁异常。"
            },
            estimated_duration: "2 分钟",
            action_preview: ["锁舌从候车厅内部落下。"],
            dialogue_preview: ["林澈：门是从里面锁的。"]
          }
        ]
      }))
    };

    const result = await generateBlueprintWithHarness({
      project: sampleProject,
      selectedDirection: sampleProject.directions[0],
      provider,
      model: "qwen3.6-27b",
      now: () => "2026-06-07T00:00:00.000Z"
    });

    expect(result.sceneBlueprint?.[0].adaptation_decision.reason).toBe("把心理疑惧外化成门锁异常。");
    expect(result.run.status).toBe("succeeded");
  });
});
