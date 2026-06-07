import { z } from "zod";
import {
  AdaptationDirectionSchema,
  type HarnessRun,
  type ScreenplayProject
} from "@/lib/domain/schemas";
import { runJsonHarnessStep } from "@/lib/harness/json-runner";
import { selectKnowledgePacks } from "@/lib/knowledge/knowledge-packs";

type DirectionProvider = {
  generateJson(input: { system: string; user: string; temperature?: number; maxTokens?: number }): Promise<unknown>;
};

type GenerateDirectionsOptions = {
  project: ScreenplayProject;
  provider: DirectionProvider;
  model?: string;
  now?: () => string;
};

export type GenerateDirectionsResult = {
  directions?: ScreenplayProject["directions"];
  run: HarnessRun;
};

const DirectionListSchema = z.preprocess((value) => {
  if (isRecord(value) && Array.isArray(value.directions)) {
    return value.directions;
  }

  return value;
}, z.array(AdaptationDirectionSchema).min(1));

export async function generateDirectionsWithHarness(
  options: GenerateDirectionsOptions
): Promise<GenerateDirectionsResult> {
  const selectedPacks = selectKnowledgePacks({
    targetMedium: options.project.adaptation_brief.target_medium,
    strategies: options.project.adaptation_brief.strategy,
    tone: options.project.adaptation_brief.tone
  });
  const sourceChunks = selectPromptSourceChunks(options.project);
  const sourceRefs = sourceChunks.map((chunk) => chunk.id);

  const result = await runJsonHarnessStep({
    id: `run_generate_directions_${Date.now()}`,
    step: "generate_directions",
    model: options.model,
    sourceChunksUsed: sourceRefs,
    knowledgePacksUsed: selectedPacks.map((item) => item.pack.id),
    schema: DirectionListSchema,
    execute: () =>
      options.provider.generateJson({
        system: buildDirectionsSystemPrompt(),
        user: buildDirectionsUserPrompt(options.project, sourceChunks, selectedPacks),
        temperature: 0.3,
        maxTokens: 900
      }),
    now: options.now
  });

  return {
    directions: result.output,
    run: result.run
  };
}

function buildDirectionsSystemPrompt(): string {
  return [
    "You are Writer Copilot's adaptation direction engine.",
    "Generate source-grounded adaptation direction candidates for a novel adaptation studio.",
    "Return compact, valid JSON only as a top-level object. Do not return Markdown or YAML."
  ].join("\n");
}

function buildDirectionsUserPrompt(
  project: ScreenplayProject,
  sourceChunks: Array<ScreenplayProject["source"]["chapters"][number]["chunks"][number]>,
  selectedPacks: ReturnType<typeof selectKnowledgePacks>
): string {
  const sourceBlock = sourceChunks
    .map((chunk) => {
      const signals = [...chunk.keywords, ...chunk.detected_names].slice(0, 5).join(", ");

      return [
        `- ${chunk.id}: ${chunk.summary ?? truncateText(chunk.text, 80)}`,
        `  excerpt: ${truncateText(chunk.text, 80)}`,
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
    "{ directions: [direction, direction] }",
    "Return exactly 2 direction objects.",
    "Each direction object must match this shape:",
    "{ id, title, target_medium, logline, recommendation_reason, preserve, transform, risks, audience, source_refs }",
    "Keep every field concise. preserve, transform, risks can each contain 1 to 2 strings.",
    "source_refs must use only the provided source chunk ids.",
    "",
    `Project title: ${project.project.title}`,
    `Target medium: ${project.adaptation_brief.target_medium}`,
    `Pacing: ${project.adaptation_brief.pacing}`,
    `Tone: ${project.adaptation_brief.tone}`,
    `Strategies: ${project.adaptation_brief.strategy.join(", ")}`,
    "",
    "Source chunks:",
    sourceBlock,
    "",
    "Active knowledge packs:",
    packBlock
  ].join("\n");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function selectPromptSourceChunks(project: ScreenplayProject): Array<ScreenplayProject["source"]["chapters"][number]["chunks"][number]> {
  const selected = new Map<string, ScreenplayProject["source"]["chapters"][number]["chunks"][number]>();
  const addChunk = (chunk: ScreenplayProject["source"]["chapters"][number]["chunks"][number] | undefined) => {
    if (chunk && selected.size < 4) {
      selected.set(chunk.id, chunk);
    }
  };

  for (const chapter of project.source.chapters) {
    addChunk(chapter.chunks[0]);
  }

  const allChunks = project.source.chapters.flatMap((chapter) => chapter.chunks);
  const briefRefChunks = project.adaptation_brief.source_refs
    .map((ref) => allChunks.find((chunk) => chunk.id === ref));

  for (const chunk of briefRefChunks) {
    addChunk(chunk);
  }

  for (const chunk of allChunks) {
    addChunk(chunk);
  }

  return Array.from(selected.values());
}

function truncateText(value: string, maxLength: number): string {
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}
