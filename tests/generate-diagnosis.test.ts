import { describe, expect, it, vi } from "vitest";
import { sampleProject } from "@/lib/sample/project";
import { generateDiagnosisWithHarness } from "@/lib/harness/generate-diagnosis";

describe("generateDiagnosisWithHarness", () => {
  it("builds a compact source-grounded diagnosis prompt and records trace metadata", async () => {
    const provider = {
      generateJson: vi.fn(async ({ user, maxTokens }: { system: string; user: string; maxTokens?: number }) => {
        expect(user).toContain("chapter_1:p_001");
        expect(user).toContain("chapter_2:p_001");
        expect(user).toContain("adaptation-principles");
        expect(user).toContain("Return JSON only");
        expect(maxTokens).toBe(700);

        return {
          diagnosis: {
            core_conflict: "林澈寻找哥哥，却发现旧城北站的事故记录像被提前排演。",
            protagonist_goal: "找到哥哥，并确认周询与封站时间矛盾的关系。",
            opening_hook: "车站从内部反锁，哥哥的警告在无人大厅重新出现。",
            adaptation_risks: ["信息密度高，若靠解释会削弱开场速度。"],
            visual_potential: ["铁链、电子屏、信号灯和线路图能连续外化悬疑。"]
          }
        };
      })
    };

    const result = await generateDiagnosisWithHarness({
      project: sampleProject,
      provider,
      model: "qwen3.6-27b",
      now: () => "2026-06-07T00:00:00.000Z"
    });

    expect(result.diagnosis?.opening_hook).toContain("车站");
    expect(result.run).toMatchObject({
      step: "generate_diagnosis",
      status: "succeeded",
      model: "qwen3.6-27b",
      source_chunks_used: ["chapter_1:p_001", "chapter_2:p_001", "chapter_3:p_001", "chapter_1:p_002"],
      knowledge_packs_used: ["adaptation-principles", "prose-to-action"]
    });
  });

  it("returns a failed trace when provider output does not match diagnosis schema", async () => {
    const provider = {
      generateJson: vi.fn(async () => ({
        diagnosis: {
          core_conflict: ""
        }
      }))
    };

    const result = await generateDiagnosisWithHarness({
      project: sampleProject,
      provider,
      model: "qwen3.6-27b",
      now: () => "2026-06-07T00:00:00.000Z"
    });

    expect(result.diagnosis).toBeUndefined();
    expect(result.run.status).toBe("failed");
    expect(result.run.error).toContain("Invalid structured output");
  });
});
