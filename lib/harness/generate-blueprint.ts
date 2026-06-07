import { z } from "zod";
import {
  SceneBlueprintSchema,
  type HarnessRun,
  type ScreenplayProject
} from "@/lib/domain/schemas";
import { runJsonHarnessStep } from "@/lib/harness/json-runner";
import { selectKnowledgePacks } from "@/lib/knowledge/knowledge-packs";

type BlueprintProvider = {
  generateJson(input: { system: string; user: string; temperature?: number; maxTokens?: number }): Promise<unknown>;
};

type GenerateBlueprintOptions = {
  project: ScreenplayProject;
  selectedDirection: ScreenplayProject["directions"][number];
  provider: BlueprintProvider;
  model?: string;
  now?: () => string;
};

export type GenerateBlueprintResult = {
  sceneBlueprint?: ScreenplayProject["scene_blueprint"];
  run: HarnessRun;
};

const BlueprintListSchema = z.preprocess((value) => {
  if (isRecord(value) && Array.isArray(value.scene_blueprint)) {
    return value.scene_blueprint.map(normalizeBlueprint);
  }

  if (isRecord(value) && Array.isArray(value.blueprint)) {
    return value.blueprint.map(normalizeBlueprint);
  }

  if (Array.isArray(value)) {
    return value.map(normalizeBlueprint);
  }

  return value;
}, z.array(SceneBlueprintSchema).min(1));

export async function generateBlueprintWithHarness(
  options: GenerateBlueprintOptions
): Promise<GenerateBlueprintResult> {
  const selectedPacks = selectKnowledgePacks({
    targetMedium: options.project.adaptation_brief.target_medium,
    strategies: [
      ...options.project.adaptation_brief.strategy,
      ...options.project.adaptation_brief.transform,
      ...options.selectedDirection.transform
    ],
    tone: options.project.adaptation_brief.tone
  });
  const sourceChunks = selectBlueprintSourceChunks(options.project, options.selectedDirection.source_refs);
  const sourceRefs = sourceChunks.map((chunk) => chunk.id);

  const result = await runJsonHarnessStep({
    id: `run_generate_blueprint_${Date.now()}`,
    step: "generate_blueprint",
    model: options.model,
    sourceChunksUsed: sourceRefs,
    knowledgePacksUsed: selectedPacks.map((item) => item.pack.id),
    schema: BlueprintListSchema,
    execute: () =>
      options.provider.generateJson({
        system: buildBlueprintSystemPrompt(),
        user: buildBlueprintUserPrompt(options.project, options.selectedDirection, sourceChunks, selectedPacks),
        temperature: 0.25,
        maxTokens: 1200
      }),
    now: options.now
  });

  return {
    sceneBlueprint: result.output,
    run: result.run
  };
}

function buildBlueprintSystemPrompt(): string {
  return [
    "You are Writer Copilot's scene blueprint engine.",
    "Turn an adaptation brief into source-grounded scene blueprints before screenplay drafting.",
    "Return compact, valid JSON only as a top-level object. Do not return Markdown or YAML."
  ].join("\n");
}

function buildBlueprintUserPrompt(
  project: ScreenplayProject,
  direction: ScreenplayProject["directions"][number],
  sourceChunks: Array<ScreenplayProject["source"]["chapters"][number]["chunks"][number]>,
  selectedPacks: ReturnType<typeof selectKnowledgePacks>
): string {
  const sourceBlock = sourceChunks
    .map((chunk) => {
      const signals = [...chunk.keywords, ...chunk.detected_names].slice(0, 5).join(", ");

      return [
        `- ${chunk.id} (${chunk.chapter_id}): ${chunk.summary ?? truncateText(chunk.text, 80)}`,
        `  excerpt: ${truncateText(chunk.text, 90)}`,
        signals ? `  signals: ${signals}` : ""
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");
  const packBlock = selectedPacks
    .slice(0, 5)
    .map((item) => `- ${item.pack.id}: ${truncateText(item.pack.content, 90)}`)
    .join("\n");

  return [
    "Return JSON only in this top-level shape:",
    "{ scene_blueprint: [blueprint, blueprint] }",
    "Return exactly 2 blueprint objects using ids blueprint_001 and blueprint_002.",
    "Each blueprint must match this shape:",
    "{ id, title, source_chapters, source_refs, story_beats, adaptation_decision, estimated_duration, action_preview, dialogue_preview }",
    "adaptation_decision.type must be one of preserve, compress, merge, reorder, invent, externalize.",
    "source_refs must use only the provided source chunk ids. source_chapters must use only the provided chapter ids.",
    "Keep each array concise: story_beats 3 items, action_preview 1 to 2 items, dialogue_preview 1 to 2 items.",
    "",
    `Project title: ${project.project.title}`,
    "",
    "Story diagnosis:",
    `core_conflict: ${project.story_diagnosis.core_conflict}`,
    `opening_hook: ${project.story_diagnosis.opening_hook}`,
    "",
    "Selected direction:",
    `title: ${direction.title}`,
    `logline: ${direction.logline}`,
    `preserve: ${direction.preserve.join(" / ")}`,
    `transform: ${direction.transform.join(" / ")}`,
    "",
    "Adaptation brief:",
    `target_medium: ${project.adaptation_brief.target_medium}`,
    `pacing: ${project.adaptation_brief.pacing}`,
    `tone: ${project.adaptation_brief.tone}`,
    `strategy: ${project.adaptation_brief.strategy.join(" / ")}`,
    `preserve: ${project.adaptation_brief.preserve.join(" / ")}`,
    `transform: ${project.adaptation_brief.transform.join(" / ")}`,
    `avoid: ${project.adaptation_brief.avoid.join(" / ")}`,
    "",
    "Source chunks:",
    sourceBlock,
    "",
    "Active knowledge packs:",
    packBlock
  ].join("\n");
}

function selectBlueprintSourceChunks(
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

  for (const ref of project.adaptation_brief.source_refs) {
    addById(ref);
  }

  for (const ref of directionRefs) {
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

function normalizeBlueprint(value: unknown): unknown {
  if (!isRecord(value)) {
    return value;
  }

  const decision = value.adaptation_decision;

  if (!isRecord(decision) || typeof decision.reason === "string") {
    return value;
  }

  const fallbackReason =
    pickString(decision.rationale) ??
    pickString(decision.summary) ??
    pickString(value.reason) ??
    pickString(value.title);

  return {
    ...value,
    adaptation_decision: {
      ...decision,
      reason: fallbackReason
    }
  };
}

function pickString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
