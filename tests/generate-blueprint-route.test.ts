import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/adaptation/generate-blueprint/route";
import { sampleProject } from "@/lib/sample/project";

describe("POST /api/adaptation/generate-blueprint", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.unstubAllGlobals();
  });

  it("returns validated scene blueprints and trace from a compatible model response", async () => {
    process.env.DASHSCOPE_API_KEY = "test-key";
    process.env.DASHSCOPE_BASE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1";
    process.env.DASHSCOPE_MODEL = "qwen3.6-27b";
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  scene_blueprint: [
                    {
                      id: "blueprint_001",
                      title: "门从里面锁上",
                      source_chapters: ["chapter_1"],
                      source_refs: ["chapter_1:p_001", "chapter_1:p_002"],
                      story_beats: ["林澈抵达", "门锁异常", "哥哥警告"],
                      adaptation_decision: {
                        type: "externalize",
                        reason: "把原文疑惧转成门锁和电子屏的可拍动作。"
                      },
                      estimated_duration: "2 分钟",
                      action_preview: ["林澈剪断铁链，锁舌朝内部落下。"],
                      dialogue_preview: ["林澈：你是故意让我看到的。"]
                    }
                  ]
                })
              }
            }
          ]
        }),
        text: async () => ""
      }))
    );

    const response = await POST(
      new Request("http://localhost/api/adaptation/generate-blueprint", {
        method: "POST",
        body: JSON.stringify({
          project: sampleProject,
          directionId: sampleProject.directions[0].id
        })
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.scene_blueprint[0].id).toBe("blueprint_001");
    expect(payload.run).toMatchObject({
      step: "generate_blueprint",
      status: "succeeded",
      model: "qwen3.6-27b"
    });
  });
});
