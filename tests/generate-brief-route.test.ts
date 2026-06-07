import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/adaptation/generate-brief/route";
import { sampleProject } from "@/lib/sample/project";

describe("POST /api/adaptation/generate-brief", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.unstubAllGlobals();
  });

  it("returns a validated adaptation brief and trace from a compatible model response", async () => {
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
                  brief: {
                    target_medium: "短剧",
                    pacing: "快",
                    fidelity: "中等",
                    tone: "悬疑",
                    strategy: ["钩子前置", "视觉证据"],
                    preserve: ["哥哥警告", "旧城北站"],
                    transform: ["把调查线索压缩为第一集危机"],
                    avoid: ["第一场解释完整阴谋"],
                    source_refs: ["chapter_1:p_001", "chapter_1:p_002"]
                  }
                })
              }
            }
          ]
        }),
        text: async () => ""
      }))
    );

    const response = await POST(
      new Request("http://localhost/api/adaptation/generate-brief", {
        method: "POST",
        body: JSON.stringify({
          project: sampleProject,
          directionId: sampleProject.directions[0].id
        })
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.brief.strategy).toContain("钩子前置");
    expect(payload.run).toMatchObject({
      step: "generate_brief",
      status: "succeeded",
      model: "qwen3.6-27b"
    });
  });
});
