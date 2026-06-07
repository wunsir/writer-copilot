import { describe, expect, it } from "vitest";
import { sampleProject } from "@/lib/sample/project";
import { parseScreenplayYaml, screenplayToYaml } from "@/lib/domain/yaml";
import { validateScreenplayProject } from "@/lib/domain/validators";
import type { ScreenplayProject } from "@/lib/domain/schemas";

function cloneProject(): ScreenplayProject {
  return structuredClone(sampleProject);
}

describe("screenplay project validation", () => {
  it("passes the sample project", () => {
    const report = validateScreenplayProject(sampleProject);

    expect(report.status).toBe("passed");
    expect(report.issues).toEqual([]);
  });

  it("fails duplicate scene ids", () => {
    const project = cloneProject();
    project.scenes[1].id = project.scenes[0].id;

    const report = validateScreenplayProject(project);

    expect(report.status).toBe("failed");
    expect(report.issues.some((issue) => issue.path === "scenes.1.id")).toBe(true);
  });

  it("fails missing character references", () => {
    const project = cloneProject();
    project.scenes[0].characters = ["char_missing"];

    const report = validateScreenplayProject(project);

    expect(report.status).toBe("failed");
    expect(report.issues.some((issue) => issue.path === "scenes.0.characters.0")).toBe(true);
  });

  it("fails missing location references", () => {
    const project = cloneProject();
    project.scenes[0].location_id = "loc_missing";

    const report = validateScreenplayProject(project);

    expect(report.status).toBe("failed");
    expect(report.issues.some((issue) => issue.path === "scenes.0.location_id")).toBe(true);
  });

  it("fails missing source references", () => {
    const project = cloneProject();
    project.scenes[0].source_refs = ["chapter_9:p_999"];

    const report = validateScreenplayProject(project);

    expect(report.status).toBe("failed");
    expect(report.issues.some((issue) => issue.path === "scenes.0.source_refs.0")).toBe(true);
  });

  it("exports parseable YAML", () => {
    const yaml = screenplayToYaml(sampleProject);
    const parsed = parseScreenplayYaml(yaml);

    expect(parsed).toMatchObject({
      schema_version: "1.0",
      validation_report: {
        status: "passed"
      }
    });
  });
});

