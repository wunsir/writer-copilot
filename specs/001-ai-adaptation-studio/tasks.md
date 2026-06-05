# Tasks: AI Adaptation Studio

## Current State

The repository currently has planning documents only. Do not assume an app scaffold, package manager, test runner, or framework exists until Phase 0 is completed.

## Task 0.1: Confirm Scaffold Choices

Scope:

- Inspect current repository files.
- Confirm or choose web stack.
- Confirm package manager.
- Confirm test runner.
- Identify initial dependencies that require approval.

Do not:

- Add dependencies.
- Create app code.
- Modify `.env` files.

Success criteria:

- A short scaffold proposal exists in the working notes or docs.
- Dependency additions are explicitly listed before install.

## Task 0.2: Scaffold Application

Scope:

- Create the approved web application scaffold.
- Add TypeScript.
- Add lint, typecheck, test, and build commands where practical.
- Update README with setup commands.

Do not:

- Build product features.
- Add AI calls.
- Add database, auth, billing, or deployment configuration.

Success criteria:

- Install succeeds.
- Typecheck passes.
- Lint passes.
- Build passes.
- README has accurate local commands.

## Task 1.1: Add Domain Schemas

Scope:

- Add domain types and schemas for:
  - Source chapters and chunks.
  - Story diagnosis.
  - Adaptation directions.
  - Adaptation Brief.
  - Scene Blueprint.
  - Screenplay JSON.
  - Validation report.
  - Harness trace.
  - Project version.
  - Scene revision.

Do not:

- Add UI.
- Add AI calls.
- Add persistence.

Success criteria:

- Schemas compile.
- Sample valid data passes schema parsing.
- Invalid required fields fail schema parsing.

## Task 1.2: Add Validation Utilities

Scope:

- Validate unique scene IDs.
- Validate character references.
- Validate location references.
- Validate source references.
- Validate adaptation decisions have type and reason.
- Return structured validation report.

Do not:

- Hide validation failures behind a generic "failed" string.
- Treat validation as UI-only.

Success criteria:

- Valid sample passes.
- Duplicate scene ID fails.
- Missing character ID fails.
- Missing location ID fails.
- Missing source ref fails.
- Missing adaptation decision reason fails.

## Task 1.3: Add YAML Export Utility

Scope:

- Convert validated screenplay JSON to YAML.
- Parse exported YAML in tests or verification.
- Preserve stable field ordering where practical.

Do not:

- Ask AI to generate YAML directly.

Success criteria:

- Sample JSON exports to YAML.
- Exported YAML parses.
- YAML contains source references and validation report.

## Task 1.4: Add Sample Data

Scope:

- Add sample novel text.
- Add sample project JSON.
- Add sample output YAML.

Success criteria:

- Sample project passes validation.
- Sample output YAML matches the documented schema.

## Task 2.1: Build Three-Panel Studio Shell

Scope:

- Create Creation Panel.
- Create Adaptation Canvas.
- Create AI Director / Inspector.
- Use sample project data.

Do not:

- Add live AI.
- Add auth or database.

Success criteria:

- App renders the three-panel layout.
- Desktop layout is usable.
- Mobile layout does not overlap.

## Task 2.2: Render Mock Workflow States

Scope:

- Render Chapter Map.
- Render Story Diagnosis.
- Render Direction Explorer.
- Render Adaptation Brief.
- Render Scene Blueprint.
- Render Screenplay Draft.

Success criteria:

- User can navigate or progress through visible workflow states.
- Direction cards include source references.
- Scene cards include adaptation decisions.

## Task 2.3: Render Inspector Tabs

Scope:

- YAML Preview.
- Validation Panel.
- Timeline.
- Harness Trace.
- Source Evidence.
- Settings placeholder only if needed.

Success criteria:

- YAML preview uses actual YAML utility.
- Validation panel uses actual validation utility.
- Timeline and trace render from sample data.

## Task 3.1: Implement Text And TXT Import

Scope:

- Paste text.
- Upload `.txt`.
- Store imported source in app state.

Success criteria:

- User can import a sample novel.
- Imported text appears in source workflow.

## Task 3.2: Implement Chapter Parser

Scope:

- Detect headings such as Chinese numbered chapters and English `Chapter 1`.
- Split into chapters.
- Report too-few-chapter state.

Success criteria:

- 3+ chapter sample parses correctly.
- Too few chapters shows actionable feedback.

## Task 3.3: Implement Source Chunks And Search

Scope:

- Split chapters into paragraph chunks.
- Assign stable chunk IDs.
- Extract simple keywords, names, and event terms.
- Add lightweight search.

Success criteria:

- Source chunks are generated.
- Search returns relevant chunks.
- Source evidence panel resolves chunk IDs.

## Task 4.1: Add Knowledge Packs

Scope:

- Add initial knowledge pack markdown files.
- Add pack metadata.
- Add pack loader.

Success criteria:

- Packs can be listed and loaded.
- Active packs are visible in the UI.

## Task 4.2: Add Direction Engine

Scope:

- Generate or assemble dynamic direction candidates from source intelligence, user controls, and knowledge packs.
- Attach reasons, risks, preserve/transform lists, and source references.

Success criteria:

- Direction output changes when preferences change.
- Direction cards resolve source refs.
- 3-5 directions are produced when enough source exists.

## Task 5.1: Add Model Provider Boundary

Scope:

- Add OpenAI-compatible provider abstraction.
- Keep API key handling outside committed source.
- Document required environment variables.

Do not:

- Commit secrets.
- Modify `.env` unless explicitly asked.

Success criteria:

- Provider can be configured by environment variables.
- Missing key produces clear error.

## Task 5.2: Add Harness Step Runner And Trace

Scope:

- Add harness step definitions.
- Add trace records.
- Add status and error handling.

Success criteria:

- Steps record started, succeeded, failed states.
- Trace is visible in UI.

## Task 5.3: Add Structured AI Steps

Scope:

- `analyze_story`.
- `generate_directions`.
- `build_adaptation_brief`.
- `generate_screenplay`.
- JSON parsing.
- Schema validation.
- Repair attempt.

Success criteria:

- AI outputs are JSON-first.
- Invalid JSON is rejected or repaired.
- Valid outputs update project state.

## Task 6.1: Add Scene Revision UI

Scope:

- Select one scene.
- Enter revision instruction.
- Show revision status.

Success criteria:

- User can target one scene for revision.

## Task 6.2: Add Revise Scene Harness Step

Scope:

- Send selected scene and relevant source context.
- Receive updated scene JSON.
- Validate updated scene.
- Replace selected scene only.

Success criteria:

- Only selected scene changes.
- Validation and YAML rerun.
- Scene revision record is created.

## Task 7.1: Add Checkpoint Timeline

Scope:

- Create checkpoint records after key actions.
- Persist checkpoints locally.
- Render timeline.

Success criteria:

- Timeline shows import, direction, generation, revision, and manual checkpoint actions.
- Refresh preserves local timeline.

## Task 7.2: Add Compare And Restore Lite

Scope:

- Compare current and previous snapshot.
- Show scene-level and adaptation-decision changes.
- Restore selected checkpoint.

Success criteria:

- Compare identifies added, removed, and modified scenes.
- Restore updates app state.

## Task 8.1: Add Product And Schema Docs

Scope:

- Add `docs/product-brief.md`.
- Add `docs/yaml-schema.md`.
- Keep docs aligned with implementation.

Success criteria:

- Docs describe actual fields and demo flow.
- Schema docs match validation rules.

## Task 8.2: Final Demo Verification

Scope:

- Run fresh typecheck, lint, tests, and build.
- Run browser check for the main flow.
- Verify sample novel to YAML flow.

Success criteria:

- All relevant commands pass or failures are documented with cause.
- Demo flow is reproducible from README.

