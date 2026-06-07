# Writer Copilot

Writer Copilot is planned as an AI Adaptation Studio for turning 3+ chapters of novel text into source-grounded, editable, schema-validated screenplay YAML.

It is not intended to be a simple "novel in, YAML out" form tool. The product should expose the adaptation process: source import, story diagnosis, evidence retrieval, dynamic direction exploration, Adaptation Brief creation, Scene Blueprint generation, YAML validation, local scene revision, creative versioning, and harness trace.

## Current Repository Status

This repository now has an initial Next.js Studio scaffold with sample data, domain validation, YAML export, a mock adaptation flow, real text/`.txt` source import with lightweight source retrieval, knowledge pack selection, a local JSON-first harness preview, and a DashScope/OpenAI-compatible provider boundary for direction generation.

Start with:

- `PRODUCT.md` for product context.
- `AGENTS.md` for repository working rules.
- `DESIGN.md` for Studio UI and interaction direction.
- `specs/001-ai-adaptation-studio/spec.md` for product scope and boundaries.
- `specs/001-ai-adaptation-studio/plan.md` for staged delivery.
- `specs/001-ai-adaptation-studio/tasks.md` for executable task slices.

## Current Stack

The current scaffold uses:

- Next.js
- React
- TypeScript
- Tailwind CSS
- Zod
- YAML generation/parsing utility
- Vitest
- ESLint

Not yet connected:

- `.docx` import.
- Local persistence.
- API-backed screenplay generation.

Do not add production dependencies without approval.

## Model Configuration

Copy `.env.example` to `.env.local` and set `DASHSCOPE_API_KEY` locally. `.env.local` is git-ignored.

The default compatible endpoint and model are:

```text
DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
DASHSCOPE_MODEL=qwen3.6-27b
```

Do not commit real API keys.

## Local Development

Install dependencies:

```bash
npm install
```

Run the app:

```bash
npm run dev
```

Verify:

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

## Execution Direction

Development should move in compact product slices:

1. Scaffold and Studio shell.
2. Domain core, sample data, and mock full-flow Studio.
3. Real source import, chapter parsing, source chunks, and lightweight retrieval. Completed for pasted text and `.txt`; `.docx` remains future work.
4. Knowledge packs, local JSON-first harness preview, and API-backed direction generation route. Completed; live calls require local env configuration.
5. Scene revision, creative versioning, compare, persistence, docs, and demo polish.

The first usable screen should be the Studio itself, not a marketing landing page.

## Current Handoff Notes

The accepted UI baseline is the current Studio shell plus Stage 2 interaction pass and Microcopy + Action Semantics pass. Do not continue structural UI refactors, color tuning, font tuning, or shadow tuning unless explicitly requested.

Available UI/mock actions include stage switching, pasted-text import, `.txt` import, source search, selecting source chunks, selecting directions, API-backed direction generation when local env is configured, selecting scenes, viewing active knowledge packs, running local JSON harness preview, Inspector tab switching, opening settings, and exporting YAML.

Pending disabled actions are `生成剧本（待接入）` and `保存设置（待接入）`.

Recommended next slice: API-backed story diagnosis, Adaptation Brief, Scene Blueprint, and screenplay JSON generation, all through the JSON-first harness.
