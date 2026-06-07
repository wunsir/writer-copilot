import { z } from "zod";
import {
  AdaptationBriefSchema,
  type HarnessRun,
  type ScreenplayProject
} from "@/lib/domain/schemas";
import { runJsonHarnessStep } from "@/lib/harness/json-runner";
import { selectKnowledgePacks } from "@/lib/knowledge/knowledge-packs";

type BriefProvider = {
  generateJson(input: { system: string; user: string; temperature?: number; maxTokens?: number }): Promise<unknown>;
};

type GenerateBriefOptions = {
  project: ScreenplayProject;
  selectedDirection: ScreenplayProject["directions"][number];
  provider: BriefProvider;
  model?: string;
  now?: () => string;
};

export type GenerateBriefResult = {
  brief?: ScreenplayProject["adaptation_brief"];
  run: HarnessRun;
};

const BriefSchema = z.preprocess((value) => {
  if (isRecord(value) && isRecord(value.brief)) {
    return value.brief;
  }

  return value;
}, AdaptationBriefSchema);

export async function generateBriefWithHarness(options: GenerateBriefOptions): Promise<GenerateBriefResult> {
  const selectedPacks = selectKnowledgePacks({
    targetMedium: options.selectedDirection.target_medium,
    strategies: [...options.project.adaptation_brief.strategy, ...options.selectedDirection.transform],
    tone: options.project.adaptation_brief.tone
  });
  const sourceChunks = selectBriefSourceChunks(options.project, options.selectedDirection.source_refs);
  const sourceRefs = sourceChunks.map((chunk) => chunk.id);

  const result = await runJsonHarnessStep({
    id: `run_generate_brief_${Date.now()}`,
    step: "generate_brief",
    model: options.model,
    sourceChunksUsed: sourceRefs,
    knowledgePacksUsed: selectedPacks.map((item) => item.pack.id),
    schema: BriefSchema,
    execute: () =>
      options.provider.generateJson({
        system: buildBriefSystemPrompt(),
        user: buildBriefUserPrompt(options.project, options.selectedDirection, sourceChunks, selectedPacks),
        temperature: 0.25,
        maxTokens: 850
      }),
    now: options.now
  });

  return {
    brief: result.output,
    run: result.run
  };
}

function buildBriefSystemPrompt(): string {
  return [
    "You are Writer Copilot's adaptation brief engine.",
    "Turn source diagnosis and a selected direction into a controllable adaptation brief.",
    "Return compact, valid JSON only as a top-level object. Do not return Markdown or YAML."
  ].join("\n");
}

function buildBriefUserPrompt(
  project: ScreenplayProject,
  direction: ScreenplayProject["directions"][number],
  sourceChunks: Array<ScreenplayProject["source"]["chapters"][number]["chunks"][number]>,
  selectedPacks: ReturnType<typeof selectKnowledgePacks>
): string {
  const sourceBlock = sourceChunks
    .map((chunk) => {
      const signals = [...chunk.keywords, ...chunk.detected_names].slice(0, 5).join(", ");

      return [
        `- ${chunk.id}: ${chunk.summary ?? truncateText(chunk.text, 80)}`,
        `  excerpt: ${truncateText(chunk.text, 90)}`,
        signals ? `  signals: ${signals}` : ""
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");
  const packBlock = selectedPacks
    .map((item) => `- ${item.pack.id}: ${truncateText(item.pack.content, 90)}`)
    .join("\n");

  return [
    "Return JSON only in this top-level shape:",
    "{ brief: { target_medium, pacing, fidelity, tone, strategy, preserve, transform, avoid, source_refs } }",
    "strategy, preserve, transform, and avoid must each contain 2 to 4 concise strings.",
    "source_refs must use only the provided source chunk ids.",
    "",
    `Project title: ${project.project.title}`,
    "",
    "Story diagnosis:",
    `core_conflict: ${project.story_diagnosis.core_conflict}`,
    `protagonist_goal: ${project.story_diagnosis.protagonist_goal}`,
    `opening_hook: ${project.story_diagnosis.opening_hook}`,
    `risks: ${project.story_diagnosis.adaptation_risks.join(" / ")}`,
    "",
    "Selected direction:",
    `title: ${direction.title}`,
    `target_medium: ${direction.target_medium}`,
    `logline: ${direction.logline}`,
    `reason: ${direction.recommendation_reason}`,
    `preserve: ${direction.preserve.join(" / ")}`,
    `transform: ${direction.transform.join(" / ")}`,
    `risks: ${direction.risks.join(" / ")}`,
    "",
    "Current brief preferences:",
    `pacing: ${project.adaptation_brief.pacing}`,
    `fidelity: ${project.adaptation_brief.fidelity}`,
    `tone: ${project.adaptation_brief.tone}`,
    `strategy: ${project.adaptation_brief.strategy.join(" / ")}`,
    "",
    "Source chunks:",
    sourceBlock,
    "",
    "Active knowledge packs:",
    packBlock
  ].join("\n");
}

function selectBriefSourceChunks(
  project: ScreenplayProject,
  directionRefs: string[]
): Array<ScreenplayProject["source"]["chapters"][number]["chunks"][number]> {
  const allChunks = project.source.chapters.flatMap((chapter) => chapter.chunks);
  const selected = new Map<string, ScreenplayProject["source"]["chapters"][number]["chunks"][number]>();
  const addById = (ref: string) => {
    const chunk = allChunks.find((item) => item.id === ref);

    if (chunk && selected.size < 4) {
      selected.set(chunk.id, chunk);
    }
  };

  for (const ref of directionRefs) {
    addById(ref);
  }

  for (const ref of project.adaptation_brief.source_refs) {
    addById(ref);
  }

  for (const chunk of allChunks) {
    if (selected.size < 4) {
      selected.set(chunk.id, chunk);
    }
  }

  return Array.from(selected.values());
}

function truncateText(value: string, maxLength: number): string {
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
