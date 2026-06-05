import {
  ScreenplayProjectSchema,
  type ScreenplayProject,
  type ValidationIssue,
  type ValidationReport
} from "@/lib/domain/schemas";

type CheckName =
  | "schema_shape"
  | "unique_scene_ids"
  | "character_references"
  | "location_references"
  | "source_references"
  | "adaptation_decisions";

function issue(path: string, message: string): ValidationIssue {
  return { path, message, severity: "error" };
}

export function validateScreenplayProject(project: unknown): ValidationReport {
  const issues: ValidationIssue[] = [];
  const checkState = new Map<CheckName, "passed" | "failed">([
    ["schema_shape", "passed"],
    ["unique_scene_ids", "passed"],
    ["character_references", "passed"],
    ["location_references", "passed"],
    ["source_references", "passed"],
    ["adaptation_decisions", "passed"]
  ]);

  const parsed = ScreenplayProjectSchema.safeParse(project);

  if (!parsed.success) {
    checkState.set("schema_shape", "failed");
    for (const problem of parsed.error.issues) {
      issues.push(issue(problem.path.join("."), problem.message));
    }
    return reportFrom(issues, checkState);
  }

  const screenplay = parsed.data;
  const characterIds = new Set(screenplay.characters.map((character) => character.id));
  const locationIds = new Set(screenplay.locations.map((location) => location.id));
  const sourceRefIds = new Set(
    screenplay.source.chapters.flatMap((chapter) => chapter.chunks.map((chunk) => chunk.id))
  );
  const sceneIds = new Set<string>();

  screenplay.scenes.forEach((scene, sceneIndex) => {
    if (sceneIds.has(scene.id)) {
      checkState.set("unique_scene_ids", "failed");
      issues.push(issue(`scenes.${sceneIndex}.id`, `Duplicate scene id "${scene.id}".`));
    }
    sceneIds.add(scene.id);

    if (!locationIds.has(scene.location_id)) {
      checkState.set("location_references", "failed");
      issues.push(
        issue(`scenes.${sceneIndex}.location_id`, `Unknown location id "${scene.location_id}".`)
      );
    }

    scene.characters.forEach((characterId, characterIndex) => {
      if (!characterIds.has(characterId)) {
        checkState.set("character_references", "failed");
        issues.push(
          issue(
            `scenes.${sceneIndex}.characters.${characterIndex}`,
            `Unknown character id "${characterId}".`
          )
        );
      }
    });

    scene.dialogue.forEach((line, lineIndex) => {
      if (!characterIds.has(line.character_id)) {
        checkState.set("character_references", "failed");
        issues.push(
          issue(
            `scenes.${sceneIndex}.dialogue.${lineIndex}.character_id`,
            `Unknown character id "${line.character_id}".`
          )
        );
      }
    });

    scene.source_refs.forEach((sourceRef, refIndex) => {
      if (!sourceRefIds.has(sourceRef)) {
        checkState.set("source_references", "failed");
        issues.push(
          issue(`scenes.${sceneIndex}.source_refs.${refIndex}`, `Unknown source ref "${sourceRef}".`)
        );
      }
    });

    if (!scene.adaptation_decision.reason.trim()) {
      checkState.set("adaptation_decisions", "failed");
      issues.push(
        issue(`scenes.${sceneIndex}.adaptation_decision.reason`, "Decision reason is required.")
      );
    }
  });

  screenplay.directions.forEach((direction, directionIndex) => {
    direction.source_refs.forEach((sourceRef, refIndex) => {
      if (!sourceRefIds.has(sourceRef)) {
        checkState.set("source_references", "failed");
        issues.push(
          issue(
            `directions.${directionIndex}.source_refs.${refIndex}`,
            `Unknown source ref "${sourceRef}".`
          )
        );
      }
    });
  });

  screenplay.scene_blueprint.forEach((blueprint, blueprintIndex) => {
    blueprint.source_refs.forEach((sourceRef, refIndex) => {
      if (!sourceRefIds.has(sourceRef)) {
        checkState.set("source_references", "failed");
        issues.push(
          issue(
            `scene_blueprint.${blueprintIndex}.source_refs.${refIndex}`,
            `Unknown source ref "${sourceRef}".`
          )
        );
      }
    });
  });

  return reportFrom(issues, checkState);
}

function reportFrom(
  issues: ValidationIssue[],
  checkState: Map<CheckName, "passed" | "failed">
): ValidationReport {
  return {
    status: issues.some((item) => item.severity === "error") ? "failed" : "passed",
    issues,
    checks: Array.from(checkState, ([name, status]) => ({ name, status }))
  };
}

export function assertValidScreenplayProject(project: ScreenplayProject): ScreenplayProject {
  const report = validateScreenplayProject(project);

  if (report.status === "failed") {
    throw new Error(report.issues.map((item) => `${item.path}: ${item.message}`).join("\n"));
  }

  return project;
}

