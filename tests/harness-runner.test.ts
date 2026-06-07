import { z } from "zod";
import { describe, expect, it } from "vitest";
import { runJsonHarnessStep } from "@/lib/harness/json-runner";

const DirectionOutputSchema = z.object({
  title: z.string().min(1),
  source_refs: z.array(z.string()).min(1)
});

describe("runJsonHarnessStep", () => {
  it("records a succeeded JSON-first step with source chunks and knowledge packs", async () => {
    const result = await runJsonHarnessStep({
      id: "run_test",
      step: "generate_directions",
      model: "mock-json",
      sourceChunksUsed: ["chapter_1:p_001"],
      knowledgePacksUsed: ["web-drama-hooks"],
      schema: DirectionOutputSchema,
      execute: async () => JSON.stringify({ title: "短剧强钩子版", source_refs: ["chapter_1:p_001"] }),
      now: () => "2026-06-07T00:00:00.000Z"
    });

    expect(result.output).toEqual({ title: "短剧强钩子版", source_refs: ["chapter_1:p_001"] });
    expect(result.run).toMatchObject({
      id: "run_test",
      step: "generate_directions",
      status: "succeeded",
      started_at: "2026-06-07T00:00:00.000Z",
      ended_at: "2026-06-07T00:00:00.000Z",
      model: "mock-json",
      source_chunks_used: ["chapter_1:p_001"],
      knowledge_packs_used: ["web-drama-hooks"],
      repair_attempts: 0
    });
  });

  it("repairs malformed JSON once before validating output", async () => {
    const result = await runJsonHarnessStep({
      id: "run_repair",
      step: "generate_directions",
      schema: DirectionOutputSchema,
      execute: async () => "{title:",
      repair: async () => ({ title: "修复后的方向", source_refs: ["chapter_2:p_001"] }),
      now: () => "2026-06-07T00:00:00.000Z"
    });

    expect(result.output).toEqual({ title: "修复后的方向", source_refs: ["chapter_2:p_001"] });
    expect(result.run.status).toBe("succeeded");
    expect(result.run.repair_attempts).toBe(1);
  });

  it("records a failed step when output cannot be parsed or repaired", async () => {
    const result = await runJsonHarnessStep({
      id: "run_failed",
      step: "generate_screenplay",
      schema: DirectionOutputSchema,
      execute: async () => "{broken:",
      now: () => "2026-06-07T00:00:00.000Z"
    });

    expect(result.output).toBeUndefined();
    expect(result.run.status).toBe("failed");
    expect(result.run.error).toContain("Invalid JSON");
  });
});

