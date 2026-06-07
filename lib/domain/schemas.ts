import { z } from "zod";

export const SourceChunkSchema = z.object({
  id: z.string().min(1),
  chapter_id: z.string().min(1),
  text: z.string().min(1),
  summary: z.string().optional(),
  keywords: z.array(z.string()).default([]),
  detected_names: z.array(z.string()).default([])
});

export const SourceChapterSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  chunks: z.array(SourceChunkSchema).min(1)
});

export const StoryDiagnosisSchema = z.object({
  core_conflict: z.string().min(1),
  protagonist_goal: z.string().min(1),
  opening_hook: z.string().min(1),
  adaptation_risks: z.array(z.string()).min(1),
  visual_potential: z.array(z.string()).min(1)
});

export const AdaptationDirectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  target_medium: z.string().min(1),
  logline: z.string().min(1),
  recommendation_reason: z.string().min(1),
  preserve: z.array(z.string()).min(1),
  transform: z.array(z.string()).min(1),
  risks: z.array(z.string()).min(1),
  audience: z.string().min(1),
  source_refs: z.array(z.string()).min(1)
});

export const AdaptationBriefSchema = z.object({
  target_medium: z.string().min(1),
  pacing: z.string().min(1),
  fidelity: z.string().min(1),
  tone: z.string().min(1),
  strategy: z.array(z.string()).min(1),
  preserve: z.array(z.string()).min(1),
  transform: z.array(z.string()).min(1),
  avoid: z.array(z.string()).min(1),
  source_refs: z.array(z.string()).default([])
});

export const AdaptationDecisionSchema = z.object({
  type: z.enum(["preserve", "compress", "merge", "reorder", "invent", "externalize"]),
  reason: z.string().min(1)
});

export const SceneBlueprintSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  source_chapters: z.array(z.string()).min(1),
  source_refs: z.array(z.string()).min(1),
  story_beats: z.array(z.string()).min(1),
  adaptation_decision: AdaptationDecisionSchema,
  estimated_duration: z.string().min(1),
  action_preview: z.array(z.string()).min(1),
  dialogue_preview: z.array(z.string()).min(1)
});

export const CharacterSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  function_in_adaptation: z.string().min(1)
});

export const LocationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1)
});

export const ScreenplaySceneSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  source_chapters: z.array(z.string()).min(1),
  source_refs: z.array(z.string()).min(1),
  adaptation_decision: AdaptationDecisionSchema,
  location_id: z.string().min(1),
  time: z.string().min(1),
  characters: z.array(z.string()).min(1),
  action: z.array(z.string()).min(1),
  dialogue: z.array(
    z.object({
      character_id: z.string().min(1),
      line: z.string().min(1),
      emotion: z.string().optional()
    })
  )
});

export const ValidationIssueSchema = z.object({
  path: z.string(),
  message: z.string(),
  severity: z.enum(["error", "warning"])
});

export const ValidationReportSchema = z.object({
  status: z.enum(["passed", "failed"]),
  issues: z.array(ValidationIssueSchema),
  checks: z.array(
    z.object({
      name: z.string(),
      status: z.enum(["passed", "failed"])
    })
  )
});

export const HarnessRunSchema = z.object({
  id: z.string().min(1),
  step: z.string().min(1),
  status: z.enum(["running", "succeeded", "failed"]),
  started_at: z.string().min(1),
  ended_at: z.string().optional(),
  model: z.string().optional(),
  source_chunks_used: z.array(z.string()).default([]),
  knowledge_packs_used: z.array(z.string()).default([]),
  repair_attempts: z.number().int().min(0).default(0),
  error: z.string().optional()
});

export const ProjectVersionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  action: z.string().min(1),
  summary: z.string().min(1),
  created_at: z.string().min(1)
});

export const SceneRevisionSchema = z.object({
  id: z.string().min(1),
  scene_id: z.string().min(1),
  instruction: z.string().min(1),
  before_summary: z.string().min(1),
  after_summary: z.string().min(1),
  created_at: z.string().min(1)
});

export const ScreenplayProjectSchema = z.object({
  schema_version: z.string().min(1),
  project: z.object({
    title: z.string().min(1),
    source_type: z.literal("novel"),
    language: z.string().min(1)
  }),
  source: z.object({
    chapters: z.array(SourceChapterSchema).min(1)
  }),
  story_diagnosis: StoryDiagnosisSchema,
  directions: z.array(AdaptationDirectionSchema).min(1),
  adaptation_brief: AdaptationBriefSchema,
  scene_blueprint: z.array(SceneBlueprintSchema).min(1),
  characters: z.array(CharacterSchema).min(1),
  locations: z.array(LocationSchema).min(1),
  scenes: z.array(ScreenplaySceneSchema).min(1),
  harness_trace: z.array(HarnessRunSchema).default([]),
  versions: z.array(ProjectVersionSchema).default([]),
  scene_revisions: z.array(SceneRevisionSchema).default([])
});

export type SourceChunk = z.infer<typeof SourceChunkSchema>;
export type ScreenplayProject = z.infer<typeof ScreenplayProjectSchema>;
export type ValidationReport = z.infer<typeof ValidationReportSchema>;
export type ValidationIssue = z.infer<typeof ValidationIssueSchema>;

