import type { SourceChunk } from "@/lib/domain/schemas";

export type SourceIndex = {
  chunks: SourceChunk[];
};

export type SourceSearchResult = {
  chunk: SourceChunk;
  score: number;
  matched_terms: string[];
};

export function buildSourceIndex(chunks: SourceChunk[]): SourceIndex {
  return {
    chunks
  };
}

export function searchSourceChunks(
  index: SourceIndex,
  query: string,
  options: { limit?: number } = {}
): SourceSearchResult[] {
  const terms = tokenizeQuery(query);

  if (terms.length === 0) {
    return [];
  }

  return index.chunks
    .map((chunk) => scoreChunk(chunk, terms))
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || a.chunk.id.localeCompare(b.chunk.id))
    .slice(0, options.limit ?? 8);
}

function scoreChunk(chunk: SourceChunk, terms: string[]): SourceSearchResult {
  let score = 0;
  const matchedTerms: string[] = [];
  const searchableText = `${chunk.summary ?? ""} ${chunk.text}`;

  for (const term of terms) {
    let termScore = 0;

    if (chunk.detected_names.includes(term)) {
      termScore += 5;
    }

    if (chunk.keywords.includes(term)) {
      termScore += 4;
    }

    if (searchableText.includes(term)) {
      termScore += 2;
    }

    if (termScore > 0) {
      score += termScore;
      matchedTerms.push(term);
    }
  }

  return {
    chunk,
    score,
    matched_terms: matchedTerms
  };
}

function tokenizeQuery(query: string): string[] {
  return Array.from(
    new Set(
      query
        .replace(/[，。！？、：；“”"'.!?;:()[\]{}]/g, " ")
        .split(/\s+/)
        .map((term) => term.trim())
        .filter(Boolean)
    )
  );
}
