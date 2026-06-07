import { z } from "zod";
import {
  ScreenplaySceneSchema,
  type HarnessRun,
  type ScreenplayProject
} from "@/lib/domain/schemas";
import { validateScreenplayProject } from "@/lib/domain/validators";
import { runJsonHarnessStep } from "@/lib/harness/json-runner";
import { selectKnowledgePacks } from "@/lib/knowledge/knowledge-packs";

type ScreenplayProvider = {
  generateJson(input: { system: string; user: string; temperature?: number; maxTokens?: number }): Promise<unknown>;
};

type GenerateScreenplayOptions = {
  project: ScreenplayProject;
  selectedDirection: ScreenplayProject["directions"][number];
  provider: ScreenplayProvider;
  model?: string;
  now?: () => string;
};

export type GenerateScreenplayResult = {
  scenes?: ScreenplayProject["scenes"];
  run: HarnessRun;
};

export async function generateScreenplayWithHarness(
  options: GenerateScreenplayOptions
): Promise<GenerateScreenplayResult> {
  const selectedPacks = selectKnowledgePacks({
    targetMedium: options.project.adaptation_brief.target_medium,
    strategies: [
      ...options.project.adaptation_brief.strategy,
      ...options.project.adaptation_brief.transform,
      ...options.selectedDirection.transform
    ],
    tone: options.project.adaptation_brief.tone
  });
  const sourceRefs = selectScreenplaySourceRefs(options.project);
  const schema = createScreenplaySceneListSchema(options.project);

  const result = await runJsonHarnessStep({
    id: `run_generate_screenplay_${Date.now()}`,
    step: "generate_screenplay",
    model: options.model,
    sourceChunksUsed: sourceRefs,
    knowledgePacksUsed: selectedPacks.map((item) => item.pack.id),
    schema,
    execute: () =>
      options.provider.generateJson({
        system: buildScreenplaySystemPrompt(),
        user: buildScreenplayUserPrompt(options.project, options.selectedDirection, selectedPacks),
        temperature: 0.25,
        maxTokens: 1800
      }),
    now: options.now
  });

  return {
    scenes: result.output,
    run: result.run
  };
}

function createScreenplaySceneListSchema(project: ScreenplayProject) {
  return z.preprocess((value) => {
    if (isRecord(value) && Array.isArray(value.scenes)) {
      return value.scenes.map((scene, index) => normalizeScene(scene, project, index));
    }

    if (Array.isArray(value)) {
      return value.map((scene, index) => normalizeScene(scene, project, index));
    }

    return value;
  }, z.array(ScreenplaySceneSchema).min(1).superRefine((scenes, ctx) => {
    const report = validateScreenplayProject({
      ...project,
      scenes
    });

    for (const issue of report.issues) {
      ctx.addIssue({
        code: "custom",
        message: issue.message,
        path: issue.path.split(".")
      });
    }
  }));
}

function buildScreenplaySystemPrompt(): string {
  return [
    "You are Writer Copilot's screenplay drafting engine.",
    "Draft screenplay scenes from an approved adaptation brief and scene blueprints.",
    "Return compact, valid JSON only as a top-level object. Do not return Markdown or YAML."
  ].join("\n");
}

function buildScreenplayUserPrompt(
  project: ScreenplayProject,
  direction: ScreenplayProject["directions"][number],
  selectedPacks: ReturnType<typeof selectKnowledgePacks>
): string {
  const sourceBlock = project.source.chapters
    .flatMap((chapter) => chapter.chunks)
    .filter((chunk) => selectScreenplaySourceRefs(project).includes(chunk.id))
    .map((chunk) => `- ${chunk.id} (${chunk.chapter_id}): ${chunk.summary ?? truncateText(chunk.text, 80)}`)
    .join("\n");
  const blueprintBlock = project.scene_blueprint
    .map((blueprint, index) =>
      [
        `- scene_${String(index + 1).padStart(3, "0")} from ${blueprint.id}: ${blueprint.title}`,
        `  chapters: ${blueprint.source_chapters.join(", ")}`,
        `  source_refs: ${blueprint.source_refs.join(", ")}`,
        `  beats: ${blueprint.story_beats.join(" / ")}`,
        `  decision: ${blueprint.adaptation_decision.type} - ${blueprint.adaptation_decision.reason}`,
        `  action_preview: ${blueprint.action_preview.join(" / ")}`,
        `  dialogue_preview: ${blueprint.dialogue_preview.join(" / ")}`
      ].join("\n")
    )
    .join("\n");
  const castBlock = project.characters
    .map((character) => `- ${character.id}: ${character.name} (${character.function_in_adaptation})`)
    .join("\n");
  const locationBlock = project.locations
    .map((location) => `- ${location.id}: ${location.name} - ${location.description}`)
    .join("\n");
  const packBlock = selectedPacks
    .map((item) => `- ${item.pack.id}: ${truncateText(item.pack.content, 90)}`)
    .join("\n");

  return [
    "Return JSON only in this top-level shape:",
    "{ scenes: [scene, scene] }",
    "Return one scene for each Scene Blueprint, in the same order, using ids scene_001, scene_002, etc.",
    "Each scene must match this shape:",
    "{ id, title, source_chapters, source_refs, adaptation_decision, location_id, time, characters, action, dialogue }",
    "dialogue is an array of { character_id, line, emotion? }.",
    "Use only the provided character ids, location ids, source chunk ids, and source chapter ids.",
    "Do not invent YAML. Keep action and dialogue concise but playable.",
    "",
    `Project title: ${project.project.title}`,
    "",
    "Selected direction:",
    `title: ${direction.title}`,
    `target_medium: ${direction.target_medium}`,
    `logline: ${direction.logline}`,
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
    "Scene Blueprints:",
    blueprintBlock,
    "",
    "Cast:",
    castBlock,
    "",
    "Locations:",
    locationBlock,
    "",
    "Source chunks:",
    sourceBlock,
    "",
    "Active knowledge packs:",
    packBlock
  ].join("\n");
}

function selectScreenplaySourceRefs(project: ScreenplayProject): string[] {
  const ordered = new Set<string>();

  for (const blueprint of project.scene_blueprint) {
    for (const ref of blueprint.source_refs) {
      ordered.add(ref);
    }
  }

  return Array.from(ordered);
}

function normalizeScene(value: unknown, project: ScreenplayProject, index: number): unknown {
  if (!isRecord(value)) {
    return value;
  }

  const blueprint = project.scene_blueprint[index];
  const characters = normalizeCharacterList(value.characters, project);
  const decision = normalizeDecision(value.adaptation_decision, value, blueprint);
  return {
    ...value,
    source_chapters: normalizeDelimitedStringList(value.source_chapters),
    source_refs: normalizeDelimitedStringList(value.source_refs),
    adaptation_decision: decision,
    location_id: normalizeLocationId(value.location_id, project),
    characters,
    action: normalizeStringArray(value.action),
    dialogue: normalizeDialogue(value.dialogue, characters, project)
  };
}

function normalizeDecision(
  decision: unknown,
  scene: Record<string, unknown>,
  blueprint: ScreenplayProject["scene_blueprint"][number] | undefined
): unknown {
  if (typeof decision === "string" && decision.trim()) {
    return {
      type: blueprint?.adaptation_decision.type ?? "externalize",
      reason: decision
    };
  }

  if (!isRecord(decision)) {
    return decision;
  }

  if (typeof decision.reason === "string") {
    return decision;
  }

  const fallbackReason =
    pickString(decision.rationale) ??
    pickString(decision.summary) ??
    pickString(scene.reason) ??
    pickString(scene.title);

  return {
    ...decision,
    reason: fallbackReason
  };
}

function normalizeDelimitedStringList(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return value;
  }

  return value
    .split(/[,，、/|；;]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeStringArray(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }

  return value;
}

function normalizeCharacterList(value: unknown, project: ScreenplayProject): unknown {
  const items = normalizeDelimitedStringList(value);

  if (!Array.isArray(items)) {
    return items;
  }

  return items.map((item) => mapCharacterId(String(item), project));
}

function normalizeLocationId(value: unknown, project: ScreenplayProject): unknown {
  if (typeof value !== "string") {
    return value;
  }

  const location = project.locations.find((item) => item.id === value || item.name === value);

  return location?.id ?? value;
}

function normalizeDialogue(
  value: unknown,
  characters: unknown,
  project: ScreenplayProject
): unknown {
  const fallbackCharacter =
    Array.isArray(characters) && typeof characters[0] === "string" ? characters[0] : project.characters[0]?.id;

  if (typeof value === "string") {
    const parsed = parseDialogueLine(value, project, fallbackCharacter);

    return parsed ? [parsed] : value;
  }

  if (!Array.isArray(value)) {
    return value;
  }

  return value.map((line) => {
    if (typeof line === "string") {
      return parseDialogueLine(line, project, fallbackCharacter) ?? line;
    }

    if (!isRecord(line)) {
      return line;
    }

    const characterId =
      pickString(line.character_id) ??
      pickString(line.character) ??
      pickString(line.name) ??
      fallbackCharacter;

    return {
      ...line,
      character_id: characterId ? mapCharacterId(characterId, project) : characterId
    };
  });
}

function parseDialogueLine(
  value: string,
  project: ScreenplayProject,
  fallbackCharacter: string | undefined
): { character_id: string; line: string } | undefined {
  const [speaker, ...rest] = value.split(/[：:]/);
  const line = rest.length ? rest.join(":").trim() : value.trim();

  if (!line) {
    return undefined;
  }

  return {
    character_id: mapCharacterId(rest.length ? speaker.trim() : fallbackCharacter ?? "", project),
    line
  };
}

function mapCharacterId(value: string, project: ScreenplayProject): string {
  const character = project.characters.find((item) => item.id === value || item.name === value);

  return character?.id ?? value;
}

function pickString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function truncateText(value: string, maxLength: number): string {
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
