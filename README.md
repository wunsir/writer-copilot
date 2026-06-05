# Writer Copilot

Writer Copilot is planned as an AI Adaptation Studio for turning 3+ chapters of novel text into source-grounded, editable, schema-validated screenplay YAML.

It is not intended to be a simple "novel in, YAML out" form tool. The product should expose the adaptation process: source import, story diagnosis, evidence retrieval, dynamic direction exploration, Adaptation Brief creation, Scene Blueprint generation, YAML validation, local scene revision, creative versioning, and harness trace.

## Current Repository Status

This repository now has an initial Next.js Studio scaffold with sample data, domain validation, YAML export, and a mock adaptation flow.

Start with:

- `PRODUCT.md` for product context.
- `AGENTS.md` for repository working rules.
- `DESIGN.md` for Studio UI and interaction direction.
- `specs/001-ai-adaptation-studio/spec.md` for product scope and boundaries.
- `specs/001-ai-adaptation-studio/plan.md` for staged delivery.
- `specs/001-ai-adaptation-studio/tasks.md` for executable task slices.

## Planned Stack

The exact scaffold should be confirmed before dependencies are added. The current recommended direction is:

- Next.js
- TypeScript
- Tailwind CSS
- Zod
- YAML generation/parsing utility
- Lightweight client-side source search such as MiniSearch or Fuse.js
- Local persistence through localStorage or IndexedDB
- OpenAI-compatible model API behind a small adaptation harness

Do not add these dependencies until the project scaffold task is explicitly started.

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
3. Real source import, chapter parsing, source chunks, and lightweight retrieval.
4. Knowledge packs, AI harness, JSON-first generation, validation, and YAML export.
5. Scene revision, creative versioning, compare, persistence, docs, and demo polish.

The first usable screen should be the Studio itself, not a marketing landing page.
