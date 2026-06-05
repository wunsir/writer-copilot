# Plan: AI Adaptation Studio

## Planning Principle

Implement the full AI Adaptation Studio vision in staged slices. Do not remove core product concepts to make a tiny converter. Instead, build the real architecture early and replace mock behavior with real behavior layer by layer.

## Phase 0: Repository Foundation

Goal: Create a working application scaffold and baseline tooling after explicit approval to add dependencies.

Scope:

- Choose and scaffold the web stack.
- Add TypeScript.
- Add lint, build, and test commands.
- Add minimal app shell entry point.
- Keep dependency choices small and justified.

Verification:

- Package install succeeds.
- Typecheck command exists and passes.
- Lint command exists and passes.
- Build command exists and passes.
- README includes current local dev commands.

## Phase 1: Domain Core

Goal: Define the product data model before AI and UI logic spread.

Scope:

- Define domain types and schemas for:
  - Source project.
  - Source chapters.
  - Source chunks.
  - Story diagnosis.
  - Adaptation directions.
  - Adaptation Brief.
  - Scene Blueprint.
  - Screenplay JSON.
  - Validation report.
  - Harness run.
  - Project version.
  - Scene revision.
- Implement validation utilities.
- Implement JSON to YAML export.
- Add sample project data and sample YAML.

Verification:

- Valid sample passes validation.
- Duplicate scene ID fails validation.
- Missing character reference fails validation.
- Missing location reference fails validation.
- Missing source reference fails validation.
- Exported YAML parses successfully.
- Relevant tests pass.

## Phase 2: Mock Studio Full Shell

Goal: Build the real product shape using sample data before connecting live AI.

Scope:

- Three-panel Studio UI:
  - Creation Panel.
  - Adaptation Canvas.
  - AI Director / Inspector.
- Show sample data for:
  - Chapter Map.
  - Story Diagnosis.
  - Direction Explorer.
  - Adaptation Brief.
  - Scene Blueprint.
  - Screenplay Draft.
  - YAML Preview.
  - Validation Panel.
  - Version Timeline.
  - Harness Trace.
  - Compare Lite.
- Add export/copy/download for YAML if practical.

Verification:

- App renders without runtime errors.
- Sample workflow is visible from import to YAML.
- Validation panel reflects real validation result from sample data.
- YAML preview matches generated YAML from domain utilities.
- Browser check confirms desktop layout and mobile fallback do not overlap.

## Phase 3: Source Import And Lightweight RAG

Goal: Replace sample source with real imported source handling.

Scope:

- Paste text import.
- `.txt` upload.
- `.docx` upload if dependency approval and implementation risk are acceptable.
- Chapter parser for Chinese and English chapter headings.
- Paragraph source chunks with stable IDs.
- Basic keyword, name, and event extraction.
- Lightweight searchable source index.
- Source evidence panel.

Verification:

- A sample 3+ chapter novel is parsed into chapters.
- Chunks have stable IDs.
- Search retrieves relevant chunks.
- UI displays chapter stats and source evidence.
- Invalid input with too few chapters shows a useful state.

## Phase 4: Knowledge Packs And Direction Engine

Goal: Make adaptation recommendations dynamic and grounded.

Scope:

- Add internal knowledge pack files.
- Add knowledge pack loader.
- Select packs from target medium, strategy, and user preference.
- Generate or assemble 3-5 dynamic direction options.
- Show active packs in UI.
- Attach source references to directions.

Verification:

- Direction cards are not hardcoded only.
- Different user preferences influence direction output.
- Active knowledge packs are visible.
- Direction source references resolve to imported chunks.

## Phase 5: Adaptation Harness

Goal: Centralize model execution, structured output, validation, repair, and trace.

Scope:

- Add model provider abstraction for OpenAI-compatible API.
- Add harness step runner.
- Add prompt modules.
- Enforce JSON-first outputs.
- Add schema validation per AI step.
- Add repair attempt for malformed JSON or invalid structure.
- Record Harness Trace.
- Generate screenplay JSON from Adaptation Brief and source context.
- Generate YAML from validated screenplay JSON.

Verification:

- Harness can run from source chunks to story diagnosis.
- Harness can generate directions.
- Harness can build an Adaptation Brief from selected direction and user preferences.
- Harness can generate screenplay JSON.
- Invalid AI output is rejected or repaired.
- Trace shows steps, source chunks, knowledge packs, status, and errors.
- Final YAML validates.

## Phase 6: Scene Revision

Goal: Support local creative iteration on one selected scene.

Scope:

- Scene selection in UI.
- Revision input box.
- `revise_scene` harness step.
- Validate returned updated scene.
- Replace only the selected scene.
- Regenerate validation report and YAML.
- Record Scene Revision.
- Create checkpoint.

Verification:

- Revising one scene changes only that scene unless references require validation updates.
- Validation reruns after revision.
- YAML updates after revision.
- Scene revision history shows before, after, instruction, and summary.

## Phase 7: Creative Versioning And Compare

Goal: Add product-level revision confidence without full Git complexity.

Scope:

- Project checkpoints.
- Timeline tab.
- Checkpoint metadata by action.
- Compare current vs previous snapshot.
- Scene-level before/after compare.
- Restore previous snapshot.
- Direction branch support when direction workflows require it.

Verification:

- Key actions create checkpoints.
- Timeline is ordered and readable.
- Compare shows scene, character, and adaptation decision changes.
- Restore returns project state to selected checkpoint.
- Local persistence survives refresh.

## Phase 8: Docs, Demo, And Polish

Goal: Make the product understandable and demo-ready.

Scope:

- `docs/product-brief.md`.
- `docs/yaml-schema.md`.
- Sample novel.
- Sample project JSON.
- Sample output YAML.
- README setup and demo flow.
- Empty, loading, error, and validation states.
- UI polish pass.

Verification:

- A new user can follow README to run the app.
- Sample novel produces valid screenplay YAML.
- YAML schema docs match implementation.
- Browser check confirms core demo path.
- Typecheck, lint, tests, and build pass.

