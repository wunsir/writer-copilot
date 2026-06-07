import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/adaptation/generate-diagnosis/route";
import { sampleProject } from "@/lib/sample/project";

describe("POST /api/adaptation/generate-diagnosis", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.unstubAllGlobals();
  });

  it("returns a validated diagnosis and trace from a compatible model response", async () => {
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
                  diagnosis: {
                    core_conflict: "林澈寻找哥哥，却发现封站事故可能被提前安排。",
                    protagonist_goal: "找到哥哥并查清周询签字时间异常。",
                    opening_hook: "车站从内部反锁，哥哥的警告在电子屏重新出现。",
                    adaptation_risks: ["开场信息多，需要避免解释堆叠。"],
                    visual_potential: ["铁链、电子屏、信号灯和线路图能持续外化悬疑。"]
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
      new Request("http://localhost/api/adaptation/generate-diagnosis", {
        method: "POST",
        body: JSON.stringify({ project: sampleProject })
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.diagnosis.opening_hook).toContain("车站");
    expect(payload.run).toMatchObject({
      step: "generate_diagnosis",
      status: "succeeded",
      model: "qwen3.6-27b"
    });
  });
});
