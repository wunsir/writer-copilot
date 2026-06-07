import { describe, expect, it } from "vitest";
import { sampleProject } from "@/lib/sample/project";
import { parseNovelSource } from "@/lib/source/chapter-parser";
import { createProjectFromImportedSource } from "@/lib/source/imported-project";
import { validateScreenplayProject } from "@/lib/domain/validators";

describe("createProjectFromImportedSource", () => {
  it("replaces sample source while keeping mock downstream refs valid", () => {
    const parsed = parseNovelSource(`第一章 开门

林澈看见铁链从车站里面绕出。

电子屏写着别跟着灯走。

第二章 签字

周询签过的封站通知早于事故。

信号灯在地下站台依次亮起。

第三章 回声

哥哥说事故只是排练。

线路图多出一间维护室。`);

    if (!parsed.ok) {
      throw new Error(parsed.error.message);
    }

    const project = createProjectFromImportedSource(sampleProject, parsed.source);
    const report = validateScreenplayProject(project);

    expect(project.source.chapters[0].title).toBe("第一章 开门");
    expect(project.source.chapters[0].chunks[0].id).toBe("chapter_1:p_001");
    expect(project.directions[0].source_refs.every((ref) => ref.startsWith("chapter_"))).toBe(true);
    expect(project.scenes[0].source_refs).toEqual(["chapter_1:p_001", "chapter_1:p_002"]);
    expect(report.status).toBe("passed");
  });
});

