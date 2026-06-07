import type { SourceChapter } from "@/lib/domain/schemas";

export type ParsedSource = {
  chapters: SourceChapter[];
};

export type SourceParseErrorCode = "empty_source" | "too_few_chapters" | "empty_chapter";

export type SourceParseResult =
  | {
      ok: true;
      source: ParsedSource;
    }
  | {
      ok: false;
      error: {
        code: SourceParseErrorCode;
        message: string;
      };
    };

type ChapterDraft = {
  title: string;
  paragraphs: string[];
};

const chapterHeadingPattern =
  /^(?:#{1,6}\s*)?(?:(第[\d零一二两三四五六七八九十百千万]+章(?:[\s：:、.-].*)?)|(Chapter\s+\d+(?:[\s:：.-].*)?))$/i;

const knownNamePattern = /林澈|周询|林修|哥哥/g;

export function parseNovelSource(rawText: string): SourceParseResult {
  const normalized = rawText.replace(/\r\n?/g, "\n").trim();

  if (!normalized) {
    return {
      ok: false,
      error: {
        code: "empty_source",
        message: "请先导入至少 3 章小说原文。"
      }
    };
  }

  const drafts = splitIntoChapterDrafts(normalized);

  if (drafts.length < 3) {
    return {
      ok: false,
      error: {
        code: "too_few_chapters",
        message: `当前只识别到 ${drafts.length} 章，请导入至少 3 章小说原文。`
      }
    };
  }

  const chapters: SourceChapter[] = [];

  for (const [chapterIndex, draft] of drafts.entries()) {
    const id = `chapter_${chapterIndex + 1}`;
    const paragraphs = draft.paragraphs.filter((paragraph) => paragraph.trim().length > 0);

    if (paragraphs.length === 0) {
      return {
        ok: false,
        error: {
          code: "empty_chapter",
          message: `${draft.title} 没有可切分的正文段落。`
        }
      };
    }

    chapters.push({
      id,
      title: cleanHeading(draft.title),
      summary: summarizeText(paragraphs.join(" ")),
      chunks: paragraphs.map((paragraph, paragraphIndex) => ({
        id: `${id}:p_${String(paragraphIndex + 1).padStart(3, "0")}`,
        chapter_id: id,
        text: paragraph,
        summary: summarizeText(paragraph),
        keywords: extractKeywords(paragraph),
        detected_names: extractNames(paragraph)
      }))
    });
  }

  return {
    ok: true,
    source: {
      chapters
    }
  };
}

function splitIntoChapterDrafts(text: string): ChapterDraft[] {
  const drafts: ChapterDraft[] = [];
  let current: ChapterDraft | null = null;
  const pendingBeforeFirstHeading: string[] = [];

  for (const block of splitBlocks(text)) {
    if (chapterHeadingPattern.test(block)) {
      if (current) {
        drafts.push(current);
      }

      current = {
        title: block,
        paragraphs: []
      };
      continue;
    }

    if (current) {
      current.paragraphs.push(block);
    } else {
      pendingBeforeFirstHeading.push(block);
    }
  }

  if (current) {
    drafts.push(current);
  }

  if (drafts.length === 0 && pendingBeforeFirstHeading.length > 0) {
    return [
      {
        title: "未识别章节",
        paragraphs: pendingBeforeFirstHeading
      }
    ];
  }

  return drafts;
}

function splitBlocks(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((block) => block.replace(/\n+/g, " ").trim())
    .filter(Boolean);
}

function cleanHeading(heading: string): string {
  return heading.replace(/^#{1,6}\s*/, "").trim();
}

function summarizeText(text: string): string {
  const normalized = text.replace(/\s+/g, " ").trim();

  if (normalized.length <= 42) {
    return normalized;
  }

  return `${normalized.slice(0, 42)}...`;
}

function extractKeywords(text: string): string[] {
  const terms = new Set<string>();
  const normalized = text.replace(/[，。！？、：；“”"'.!?;:()[\]{}]/g, " ");

  for (const token of normalized.split(/\s+/)) {
    if (/^[\da-zA-Z_-]{2,}$/.test(token)) {
      terms.add(token);
    }
  }

  for (const match of text.matchAll(/[\u4e00-\u9fff]{2,6}/g)) {
    const value = match[0];
    if (value.length >= 2 && value.length <= 6) {
      terms.add(value);
    }
  }

  return Array.from(terms).slice(0, 10);
}

function extractNames(text: string): string[] {
  return Array.from(new Set(Array.from(text.matchAll(knownNamePattern), (match) => match[0])));
}
