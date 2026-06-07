import { stringify, parse } from "yaml";
import type { ScreenplayProject, ValidationReport } from "@/lib/domain/schemas";
import { validateScreenplayProject } from "@/lib/domain/validators";

export function screenplayToYaml(project: ScreenplayProject, report?: ValidationReport): string {
  const validationReport = report ?? validateScreenplayProject(project);
  const yamlReady = {
    schema_version: project.schema_version,
    project: project.project,
    adaptation_brief: project.adaptation_brief,
    source: {
      chapters: project.source.chapters.map((chapter) => ({
        id: chapter.id,
        title: chapter.title,
        summary: chapter.summary
      }))
    },
    source_refs: project.source.chapters.flatMap((chapter) =>
      chapter.chunks.map((chunk) => ({
        id: chunk.id,
        chapter_id: chunk.chapter_id,
        text_excerpt: chunk.text.slice(0, 180)
      }))
    ),
    characters: project.characters,
    locations: project.locations,
    scenes: project.scenes,
    validation_report: validationReport
  };

  return stringify(yamlReady, {
    lineWidth: 100,
    singleQuote: false
  });
}

export function parseScreenplayYaml(yaml: string): unknown {
  return parse(yaml);
}

