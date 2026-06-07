import type { ParsedSource } from "@/lib/source/chapter-parser";
import type { ScreenplayProject } from "@/lib/domain/schemas";

export function createProjectFromImportedSource(
  baseProject: ScreenplayProject,
  source: ParsedSource
): ScreenplayProject {
  const chunkIds = source.chapters.flatMap((chapter) => chapter.chunks.map((chunk) => chunk.id));
  const firstChapterId = source.chapters[0]?.id ?? "chapter_1";
  const secondChapterId = source.chapters[1]?.id ?? firstChapterId;
  const firstRefs = takeRefs(chunkIds, 0, 2);
  const secondRefs = takeRefs(chunkIds, 2, 2);
  const mixedRefs = takeRefs(chunkIds, 0, 3);

  return {
    ...baseProject,
    source,
    directions: baseProject.directions.map((direction, index) => ({
      ...direction,
      source_refs: index === 0 ? mixedRefs : takeRefs(chunkIds, 2, 3)
    })),
    adaptation_brief: {
      ...baseProject.adaptation_brief,
      source_refs: mixedRefs
    },
    scene_blueprint: baseProject.scene_blueprint.map((blueprint, index) => {
      const refs = index === 0 ? firstRefs : secondRefs;

      return {
        ...blueprint,
        source_chapters: Array.from(
          new Set(refs.map((ref) => source.chapters.find((chapter) => chapter.chunks.some((chunk) => chunk.id === ref))?.id))
        ).filter(Boolean) as string[],
        source_refs: refs
      };
    }),
    scenes: baseProject.scenes.map((scene, index) => {
      const refs = index === 0 ? firstRefs : secondRefs;

      return {
        ...scene,
        source_chapters: index === 0 ? [firstChapterId] : [secondChapterId],
        source_refs: refs
      };
    }),
    harness_trace: baseProject.harness_trace.map((run) => ({
      ...run,
      source_chunks_used: run.source_chunks_used.length ? mixedRefs.slice(0, run.source_chunks_used.length) : []
    })),
    versions: [
      {
        id: "version_imported_source",
        label: "导入真实原文",
        action: "import_source",
        summary: `${source.chapters.length} 章，${chunkIds.length} 段原文依据`,
        created_at: "当前会话"
      },
      ...baseProject.versions
    ]
  };
}

function takeRefs(ids: string[], start: number, count: number): string[] {
  if (ids.length === 0) {
    return [];
  }

  const refs = ids.slice(start, start + count);

  if (refs.length > 0) {
    return refs;
  }

  return ids.slice(0, Math.min(count, ids.length));
}
