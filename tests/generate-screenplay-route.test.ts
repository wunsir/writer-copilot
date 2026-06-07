import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/adaptation/generate-screenplay/route";
import { sampleProject } from "@/lib/sample/project";

describe("POST /api/adaptation/generate-screenplay", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.unstubAllGlobals();
  });

  it("returns validated screenplay scenes and trace from a compatible model response", async () => {
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
                  scenes: [
                    {
                      id: "scene_001",
                      title: "门从里面锁上",
                      source_chapters: ["chapter_1"],
                      source_refs: ["chapter_1:p_001", "chapter_1:p_002"],
                      adaptation_decision: {
                        type: "externalize",
                        reason: "把原文疑惧写成门锁和电子屏的可拍动作。"
                      },
                      location_id: "loc_station",
                      time: "夜",
                      characters: ["char_mara", "char_brother"],
                      action: ["林澈剪断铁链，锁舌朝内部落下。"],
                      dialogue: [
                        {
                          character_id: "char_mara",
                          line: "你是故意让我看到的。"
                        }
                      ]
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
      new Request("http://localhost/api/adaptation/generate-screenplay", {
        method: "POST",
        body: JSON.stringify({
          project: sampleProject,
          directionId: sampleProject.directions[0].id
        })
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.scenes[0].id).toBe("scene_001");
    expect(payload.run).toMatchObject({
      step: "generate_screenplay",
      status: "succeeded",
      model: "qwen3.6-27b"
    });
  });
});
