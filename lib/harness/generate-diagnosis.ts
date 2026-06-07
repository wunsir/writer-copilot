import { z } from "zod";
import {
  StoryDiagnosisSchema,
  type HarnessRun,
  type ScreenplayProject
} from "@/lib/domain/schemas";
import { runJsonHarnessStep } from "@/lib/harness/json-runner";
import { getKnowledgePack, type KnowledgePack } from "@/lib/knowledge/knowledge-packs";

type DiagnosisProvider = {
  generateJson(input: { system: string; user: string; temperature?: number; maxTokens?: number }): Promise<unknown>;
};

type GenerateDiagnosisOptions = {
  project: ScreenplayProject;
  provider: DiagnosisProvider;
  model?: string;
  now?: () => string;
};

export type GenerateDiagnosisResult = {
  diagnosis?: ScreenplayProject["story_diagnosis"];
  run: HarnessRun;
};

const DiagnosisSchema = z.preprocess((value) => {
  if (isRecord(value) && isRecord(value.diagnosis)) {
    return value.diagnosis;
  }

  return value;
}, StoryDiagnosisSchema);

export async function generateDiagnosisWithHarness(
  options: GenerateDiagnosisOptions
): Promise<GenerateDiagnosisResult> {
  const sourceChunks = selectDiagnosisSourceChunks(options.project);
  const sourceRefs = sourceChunks.map((chunk) => chunk.id);
  const knowledgePacks = [getKnowledgePack("adaptation-principles"), getKnowledgePack("prose-to-action")];

  const result = await runJsonHarnessStep({
    id: `run_generate_diagnosis_${Date.now()}`,
    step: "generate_diagnosis",
    model: options.model,
    sourceChunksUsed: sourceRefs,
    knowledgePacksUsed: knowledgePacks.map((pack) => pack.id),
    schema: DiagnosisSchema,
    execute: () =>
      options.provider.generateJson({
        system: buildDiagnosisSystemPrompt(),
        user: buildDiagnosisUserPrompt(options.project, sourceChunks, knowledgePacks),
        temperature: 0.2,
        maxTokens: 700
      }),
    now: options.now
  });

  return {
    diagnosis: result.output,
    run: result.run
  };
}

function buildDiagnosisSystemPrompt(): string {
  return [
    "You are Writer Copilot's source intelligence engine.",
    "Analyze novel source chunks for adaptation, not literary critique.",
    "Return compact, valid JSON only as a top-level object. Do not return Markdown or YAML."
  ].join("\n");
}

function buildDiagnosisUserPrompt(
  project: ScreenplayProject,
  sourceChunks: Array<ScreenplayProject["source"]["chapters"][number]["chunks"][number]>,
  knowledgePacks: KnowledgePack[]
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
  const packBlock = knowledgePacks.map((pack) => `- ${pack.id}: ${truncateText(pack.content, 100)}`).join("\n");

  return [
    "Return JSON only in this top-level shape:",
    "{ diagnosis: { core_conflict, protagonist_goal, opening_hook, adaptation_risks, visual_potential } }",
    "adaptation_risks and visual_potential must each contain 2 concise strings.",
    "Ground the diagnosis in the provided source chunks.",
    "",
    `Project title: ${project.project.title}`,
    `Language: ${project.project.language}`,
    "",
    "Source chunks:",
    sourceBlock,
    "",
    "Active knowledge packs:",
    packBlock
  ].join("\n");
}

function selectDiagnosisSourceChunks(
  project: ScreenplayProject
): Array<ScreenplayProject["source"]["chapters"][number]["chunks"][number]> {
  const selected = new Map<string, ScreenplayProject["source"]["chapters"][number]["chunks"][number]>();
  const addChunk = (chunk: ScreenplayProject["source"]["chapters"][number]["chunks"][number] | undefined) => {
    if (chunk && selected.size < 4) {
      selected.set(chunk.id, chunk);
    }
  };

  for (const chapter of project.source.chapters) {
    addChunk(chapter.chunks[0]);
  }

  for (const chunk of project.source.chapters.flatMap((chapter) => chapter.chunks)) {
    addChunk(chunk);
  }

  return Array.from(selected.values());
}

function truncateText(value: string, maxLength: number): string {
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
