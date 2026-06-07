import { describe, expect, it, vi } from "vitest";
import { sampleProject } from "@/lib/sample/project";
import { generateScreenplayWithHarness } from "@/lib/harness/generate-screenplay";

describe("generateScreenplayWithHarness", () => {
  it("uses the brief, scene blueprints, cast, and source refs to build validated screenplay scenes", async () => {
    const provider = {
      generateJson: vi.fn(async ({ user, maxTokens }: { system: string; user: string; maxTokens?: number }) => {
        expect(user).toContain("门从里面锁上");
        expect(user).toContain("早到一小时的签字");
        expect(user).toContain("char_mara");
        expect(user).toContain("loc_station");
        expect(user).toContain("chapter_1:p_001");
        expect(user).toContain("Return JSON only");
        expect(maxTokens).toBe(1800);

        return {
          scenes: [
            {
              id: "scene_001",
              title: "门从里面锁上",
              source_chapters: ["chapter_1"],
              source_refs: ["chapter_1:p_001", "chapter_1:p_002"],
              adaptation_decision: {
                type: "externalize",
                reason: "把门锁异常和电子屏警告写成可拍动作。"
              },
              location_id: "loc_station",
              time: "夜",
              characters: ["char_mara", "char_brother"],
              action: ["林澈剪断铁链，锁舌却从候车厅内部落下。"],
              dialogue: [
                {
                  character_id: "char_mara",
                  line: "你是故意让我看到的。",
                  emotion: "压住恐惧"
                }
              ]
            },
            {
              id: "scene_002",
              title: "早到一小时的签字",
              source_chapters: ["chapter_2"],
              source_refs: ["chapter_2:p_001", "chapter_2:p_002"],
              adaptation_decision: {
                type: "compress",
                reason: "把信号灯和封站通知压缩成连续调查动作。"
              },
              location_id: "loc_platform",
              time: "稍后",
              characters: ["char_mara", "char_vale"],
              action: ["红色信号灯在积水里一盏盏亮起。"],
              dialogue: [
                {
                  character_id: "char_mara",
                  line: "事故还没发生，他就已经封站了。"
                }
              ]
            }
          ]
        };
      })
    };

    const result = await generateScreenplayWithHarness({
      project: sampleProject,
      selectedDirection: sampleProject.directions[0],
      provider,
      model: "qwen3.6-27b",
      now: () => "2026-06-07T00:00:00.000Z"
    });

    expect(result.scenes).toHaveLength(2);
    expect(result.run).toMatchObject({
      step: "generate_screenplay",
      status: "succeeded",
      model: "qwen3.6-27b",
      source_chunks_used: ["chapter_1:p_001", "chapter_1:p_002", "chapter_2:p_001", "chapter_2:p_002"],
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

  it("returns a failed trace when generated scenes do not validate against project references", async () => {
    const provider = {
      generateJson: vi.fn(async () => ({
        scenes: [
          {
            id: "scene_001",
            title: "无效依据",
            source_chapters: ["chapter_1"],
            source_refs: ["chapter_9:p_999"],
            adaptation_decision: {
              type: "externalize",
              reason: "测试无效引用。"
            },
            location_id: "loc_station",
            time: "夜",
            characters: ["char_mara"],
            action: ["林澈进入车站。"],
            dialogue: []
          }
        ]
      }))
    };

    const result = await generateScreenplayWithHarness({
      project: sampleProject,
      selectedDirection: sampleProject.directions[0],
      provider,
      model: "qwen3.6-27b",
      now: () => "2026-06-07T00:00:00.000Z"
    });

    expect(result.scenes).toBeUndefined();
    expect(result.run.status).toBe("failed");
    expect(result.run.error).toContain("Unknown source ref");
  });

  it("normalizes compact model scene strings before project validation", async () => {
    const provider = {
      generateJson: vi.fn(async () => ({
        scenes: [
          {
            id: "scene_001",
            title: "门从里面锁上",
            source_chapters: "chapter_1",
            source_refs: "chapter_1:p_001, chapter_1:p_002",
            adaptation_decision: "把门锁异常外化成可拍动作。",
            location_id: "旧城北站",
            time: "夜",
            characters: "林澈, 林澈的哥哥",
            action: "林澈剪断铁链，锁舌朝内部落下。",
            dialogue: "林澈：你是故意让我看到的。"
          }
        ]
      }))
    };

    const result = await generateScreenplayWithHarness({
      project: sampleProject,
      selectedDirection: sampleProject.directions[0],
      provider,
      model: "qwen3.6-27b",
      now: () => "2026-06-07T00:00:00.000Z"
    });

    expect(result.scenes?.[0]).toMatchObject({
      source_chapters: ["chapter_1"],
      source_refs: ["chapter_1:p_001", "chapter_1:p_002"],
      adaptation_decision: {
        type: "externalize",
        reason: "把门锁异常外化成可拍动作。"
      },
      location_id: "loc_station",
      characters: ["char_mara", "char_brother"],
      action: ["林澈剪断铁链，锁舌朝内部落下。"]
    });
    expect(result.scenes?.[0].dialogue[0]).toMatchObject({
      character_id: "char_mara",
      line: "你是故意让我看到的。"
    });
    expect(result.run.status).toBe("succeeded");
  });
});
