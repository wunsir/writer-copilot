import { describe, expect, it } from "vitest";
import { parseNovelSource } from "@/lib/source/chapter-parser";

const threeChapterNovel = `第一章 雨夜归站

林澈回到旧城北站，铁链从门内绕出。

电子屏闪出哥哥的警告：别跟着灯走。

第二章 地下灯路

地下站台积着雨水，信号灯一盏接一盏亮起。

封站通知上签着周询的名字，时间却早于事故。

Chapter 3 Hidden Room

林澈按下红色开关，线路图多出一间维护室。

墙后传来哥哥的声音：事故只是排练。`;

describe("parseNovelSource", () => {
  it("detects chapters and creates stable paragraph chunks", () => {
    const result = parseNovelSource(threeChapterNovel);

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("expected parse success");
    }

    expect(result.source.chapters).toHaveLength(3);
    expect(result.source.chapters[0]).toMatchObject({
      id: "chapter_1",
      title: "第一章 雨夜归站"
    });
    expect(result.source.chapters[2]).toMatchObject({
      id: "chapter_3",
      title: "Chapter 3 Hidden Room"
    });
    expect(result.source.chapters[0].chunks.map((chunk) => chunk.id)).toEqual([
      "chapter_1:p_001",
      "chapter_1:p_002"
    ]);
    expect(result.source.chapters[0].chunks[0]).toMatchObject({
      chapter_id: "chapter_1",
      summary: "林澈回到旧城北站，铁链从门内绕出。",
      detected_names: ["林澈"]
    });
  });

  it("accepts markdown chapter headings", () => {
    const result = parseNovelSource(`### 第一章 开门

林澈看见门锁在里面。

### 第二章 入站

周询留下签名。

### 第三章 回声

哥哥说事故只是排练。`);

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("expected parse success");
    }
    expect(result.source.chapters.map((chapter) => chapter.title)).toEqual([
      "第一章 开门",
      "第二章 入站",
      "第三章 回声"
    ]);
  });

  it("returns an actionable error when fewer than three chapters are detected", () => {
    const result = parseNovelSource(`第一章 开门

只有一章内容。`);

    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error("expected parse failure");
    }
    expect(result.error.code).toBe("too_few_chapters");
    expect(result.error.message).toContain("至少 3 章");
  });
});

