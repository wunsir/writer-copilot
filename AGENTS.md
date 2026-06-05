# Writer Copilot Agent Guide

## Project Status

This repository is currently the starting point for Writer Copilot. Treat repo files as the source of truth. If project docs, tests, lint, CI, or directory-level `AGENTS.md` files are added later and conflict with this file, follow the more specific checked-in rule.

## Product Direction

Writer Copilot is an AI Adaptation Studio, not a simple novel-to-YAML converter.

The intended product helps users import 3+ chapters of novel text, understand the source, retrieve source evidence, explore adaptation directions, build an Adaptation Brief, generate Scene Blueprints, export schema-validated screenplay YAML, revise individual scenes, and compare creative versions.

Core product capabilities:

- Source Import for pasted text, `.txt`, and eventually `.docx`.
- Source Intelligence for story diagnosis, characters, locations, events, hooks, and adaptation risks.
- Lightweight Source RAG using source chunks and retrievable source references.
- Knowledge Packs for adaptation principles and screenplay craft guidance.
- Direction Explorer with dynamic, source-grounded adaptation options.
- Adaptation Brief as the controllable intermediate asset.
- Scene Blueprint before final screenplay output.
- Structured screenplay JSON as the canonical generated data.
- Real YAML generation from validated JSON.
- Schema Validation that checks actual references and structure.
- Scene Revision for local natural-language edits to one selected scene.
- Creative Versioning with checkpoints, timeline, compare, and restore.
- Adaptation Harness with step orchestration, JSON validation, repair, and trace.
- Three-panel Studio UI: Creation Panel, Adaptation Canvas, AI Director / Inspector.

## Studio Interaction Direction

The UI should feel like a real creative studio, not a static form page.

- The left Creation Panel is an entry and control surface. Its items should be able to expand, focus, or enter a deeper creation mode instead of only toggling flat settings.
- The center Adaptation Canvas is the main working surface. It changes by stage and should make the current creative asset feel primary: source map, diagnosis, direction exploration, brief, blueprint, screenplay, compare.
- The right AI Director / Inspector provides context, evidence, YAML, validation, timeline, trace, and selected-item details without stealing the main workflow.
- Direction Explorer, Adaptation Brief, and Scene Blueprint must appear early in the product shell, even before real AI is connected.
- Prefer progressive disclosure, focused editing states, and stage transitions over dense all-at-once panels.
- Do not make a landing page as the first screen. The first screen should be the usable Studio.

## Hard Rules

- Do not reduce the product to one prompt that directly converts a novel into YAML.
- AI output must be structured JSON first. The app generates YAML from validated JSON.
- YAML validation must be real, not a decorative "passed" label.
- Scene outputs should preserve `source_refs` whenever the scene is grounded in imported text.
- Keep source-grounding visible in the UI and data model.
- Keep Adaptation Brief and Scene Blueprint as first-class assets.
- Keep Harness Trace visible enough for demo and debugging.
- Prefer a complete vertical product architecture implemented in staged slices over a tiny MVP that omits core product concepts.

## Non-Goals Unless Explicitly Requested

- Production login or account system.
- Payment or billing.
- Multi-user collaboration.
- Cloud database as a default requirement.
- Heavy vector database.
- Complex external agent framework.
- Full rich-text screenplay editor.
- Direct AI-generated YAML as the main pipeline.

## Planning And Execution

Use a lightweight, risk-based workflow:

- For planning work, update `specs/001-ai-adaptation-studio/` first.
- For implementation work, keep diffs small and reviewable.
- Prefer compact product vertical slices that can be verified end to end.
- Treat detailed task lists as checklists inside slices, not as a reason to stretch development into excessive process.
- Do not add production dependencies without approval.
- Do not modify `.env` files unless explicitly asked.
- Do not commit secrets.
- Ask before destructive actions, public API changes, database schema changes, auth, billing, deployment, CI, or broad architecture changes.

## Verification Expectations

Before claiming implementation work is complete, run fresh relevant checks and report the exact commands and results.

Expected checks will depend on the stack once scaffolded. Until then, documentation-only changes should be verified by reading the created files and checking git status.

Future implementation should include checks for:

- TypeScript typecheck.
- Lint.
- Tests for domain validation and source parsing.
- Build.
- Browser verification for UI flows.
- Sample novel to valid screenplay YAML flow.
