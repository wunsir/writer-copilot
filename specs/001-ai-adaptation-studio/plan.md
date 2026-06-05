# Plan: AI Adaptation Studio

## Planning Principle

Build the full AI Adaptation Studio vision through compact product slices. Do not shrink the product into a tiny converter, but also do not turn development into a long chain of tiny process tasks.

Each slice should deliver a visible product step and a small set of verification checks. Detailed tasks are checklists inside a slice, not separate process ceremonies.

## Slice 1: Scaffold And Studio Shell

Goal: Start the app and immediately establish the real Studio shape.

Scope:

- Confirm stack and package manager before adding dependencies.
- Scaffold the app.
- Add baseline TypeScript, lint, test, and build commands where practical.
- Build the first Studio screen, not a landing page.
- Establish the three-panel layout:
  - Left Creation Panel.
  - Center Adaptation Canvas.
  - Right AI Director / Inspector.
- Encode the interaction model from `DESIGN.md`.

Verification:

- Install succeeds.
- Typecheck, lint, and build commands exist and pass.
- App opens locally.
- The first screen is the Studio.
- Desktop and mobile layouts do not overlap.

## Slice 2: Domain Core And Mock Full Flow

Goal: Make the complete product flow visible with sample data before connecting real import or AI.

Scope:

- Define domain schemas for source, diagnosis, directions, brief, blueprint, screenplay, validation, trace, versions, and scene revisions.
- Add sample novel, sample project JSON, sample trace, sample timeline, and sample YAML.
- Implement real validation utilities.
- Implement JSON to YAML export.
- Render the full mock Studio flow:
  - Chapter Map.
  - Story Diagnosis.
  - Direction Explorer.
  - Adaptation Brief.
  - Scene Blueprint.
  - Screenplay Draft.
  - YAML Preview.
  - Validation Panel.
  - Timeline.
  - Harness Trace.
  - Compare Lite.
- Make left-panel clicks expand or focus meaningful creation states.
- Make center canvas stage changes feel like entering a creative workspace, not switching static cards.

Verification:

- Valid sample passes validation.
- Broken sample cases fail for duplicate scene IDs, missing character refs, missing location refs, missing source refs, and missing adaptation decision reasons.
- Exported YAML parses successfully.
- UI shows the whole adaptation flow from source to YAML.
- Inspector updates for selected direction, scene, source ref, version, or validation issue.

## Slice 3: Real Source Import And Lightweight Retrieval

Goal: Replace static source data with real imported source handling and source-grounded evidence.

Scope:

- Paste text import.
- `.txt` upload.
- `.docx` upload if dependency approval and risk are acceptable.
- Chapter parser for Chinese and English headings.
- Source chunks with stable IDs.
- Basic name, location, event, and keyword extraction.
- Lightweight search using a small client-side search library or simple fallback.
- Source evidence panel and clickable source refs.

Verification:

- A 3+ chapter sample novel parses into chapters and chunks.
- Too-few-chapter input shows useful feedback.
- Search retrieves relevant chunks.
- Direction, blueprint, screenplay, and inspector views can resolve source refs.
- Imported source can replace sample source in the Studio flow.

## Slice 4: Knowledge Packs And AI Harness

Goal: Replace mock generation with a real JSON-first adaptation runtime.

Scope:

- Add internal knowledge packs.
- Add knowledge pack selection and display.
- Add OpenAI-compatible model provider boundary.
- Add adaptation harness step runner.
- Add prompts for:
  - Story diagnosis.
  - Direction generation.
  - Adaptation Brief creation.
  - Scene Blueprint and screenplay generation.
  - Scene revision.
- Enforce structured JSON output.
- Validate each AI output with schemas.
- Add repair attempts for invalid JSON or invalid structure.
- Record Harness Trace.
- Generate YAML only from validated JSON.

Verification:

- Harness can run from imported source to diagnosis.
- Harness can generate dynamic directions using source refs and knowledge packs.
- User can choose or adjust a direction and build an Adaptation Brief.
- Harness can generate Scene Blueprint and screenplay JSON.
- Invalid AI output is rejected or repaired.
- Final YAML validates.
- Trace shows step status, model, source chunks, knowledge packs, validation, repairs, and errors.

## Slice 5: Scene Revision, Versioning, Compare, And Demo Polish

Goal: Make the Studio feel like an iterative creative product.

Scope:

- Select one scene and revise it with natural language.
- Replace only the selected scene after validation.
- Regenerate validation and YAML after revision.
- Record Scene Revision before/after.
- Create project checkpoints after key actions.
- Persist locally.
- Add timeline, compare, and restore.
- Add direction branch support when direction workflows need it.
- Add product brief, YAML schema docs, README demo flow, sample inputs, sample outputs.
- Polish empty, loading, error, validation, revision, compare, and trace states.

Verification:

- Scene revision changes only the selected scene unless validation requires related updates.
- Timeline records import, direction, generation, revision, compare, restore, and manual checkpoints.
- Compare shows added, removed, and modified scenes plus adaptation decision changes.
- Restore returns project state to a prior checkpoint.
- Local persistence survives refresh.
- README demo flow is reproducible.
- Typecheck, lint, tests, build, and browser checks pass or documented failures have clear causes.

