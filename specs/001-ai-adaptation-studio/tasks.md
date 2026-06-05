# Tasks: AI Adaptation Studio

## Current State

The repository currently has planning documents only. Do not assume an app scaffold, package manager, test runner, or framework exists until Slice 1 is completed.

These tasks are execution checklists inside compact slices. They are not meant to force one tiny task per development round.

## Slice 1 Checklist: Scaffold And Studio Shell

### 1.1 Confirm Scaffold Choices

- Inspect current repository files.
- Confirm web stack and package manager.
- Confirm test runner.
- List dependencies before installing them.

Do not add dependencies until approved.

Acceptance:

- Scaffold proposal is explicit.
- Dependency additions are listed.

### 1.2 Scaffold The App

- Create the approved app scaffold.
- Add TypeScript.
- Add lint, typecheck, test, and build commands where practical.
- Update README with accurate local commands.

Do not add AI calls, auth, database, billing, or deployment configuration.

Acceptance:

- Install succeeds.
- Typecheck passes.
- Lint passes.
- Build passes.

### 1.3 Build First Studio Shell

- First screen is the Studio, not a landing page.
- Add three-panel layout:
  - Creation Panel.
  - Adaptation Canvas.
  - AI Director / Inspector.
- Add responsive behavior.
- Add basic stage navigation.

Acceptance:

- App opens locally.
- Desktop layout is usable.
- Mobile layout does not overlap.
- Left panel can enter or expand at least one focused creation state.

## Slice 2 Checklist: Domain Core And Mock Full Flow

### 2.1 Domain Core

- Add schemas and types for source, diagnosis, direction, brief, blueprint, screenplay, validation, trace, version, and scene revision.
- Add sample project data.
- Add sample novel and sample YAML.

Acceptance:

- Sample data parses through schemas.
- Invalid required fields fail.

### 2.2 Validation And YAML

- Validate unique scene IDs.
- Validate character references.
- Validate location references.
- Validate source references.
- Validate adaptation decision type and reason.
- Export validated JSON to YAML.
- Parse exported YAML.

Acceptance:

- Valid sample passes.
- Broken samples fail with specific issue records.
- YAML contains source refs and validation report.

### 2.3 Mock Studio Flow

- Render Chapter Map.
- Render Story Diagnosis.
- Render Direction Explorer.
- Render Adaptation Brief.
- Render Scene Blueprint.
- Render Screenplay Draft.
- Render YAML Preview.
- Render Validation Panel.
- Render Timeline.
- Render Harness Trace.
- Render Compare Lite.

Acceptance:

- User can move through the full adaptation flow.
- Direction cards include source refs.
- Scene cards include adaptation decisions.
- Inspector changes when selecting direction, scene, source ref, version, or validation issue.

## Slice 3 Checklist: Real Source Import And Lightweight Retrieval

### 3.1 Import And Parse

- Add paste import.
- Add `.txt` upload.
- Add `.docx` upload only after dependency approval.
- Detect Chinese and English chapter headings.
- Require or guide toward 3+ chapters.

Acceptance:

- 3+ chapter sample parses.
- Too-few-chapter input shows actionable feedback.

### 3.2 Source Chunks And Search

- Split chapters into paragraph chunks.
- Assign stable chunk IDs.
- Extract simple keywords, names, locations, and event terms.
- Add lightweight search.

Acceptance:

- Chunks are generated.
- Search retrieves relevant chunks.
- Source refs resolve in the inspector.

### 3.3 Replace Sample Source

- Let imported source feed the existing Studio flow.
- Keep mock downstream generation available until AI harness is connected.

Acceptance:

- Imported source updates Chapter Map and Evidence views.
- Mock directions and scenes can reference imported chunk IDs.

## Slice 4 Checklist: Knowledge Packs And AI Harness

### 4.1 Knowledge Packs

- Add initial knowledge pack markdown files.
- Add pack metadata.
- Add pack loader.
- Show active packs and reasons.

Acceptance:

- Packs can be listed and loaded.
- Active packs are visible in the Inspector.

### 4.2 Harness Runtime

- Add model provider boundary.
- Add harness step runner.
- Add trace records.
- Add JSON parsing.
- Add schema validation.
- Add repair attempts.

Acceptance:

- Step trace records started, succeeded, failed, validation, repair, and error states.
- Missing API key produces clear error without leaking secrets.

### 4.3 AI Generation Steps

- Analyze story.
- Generate directions.
- Build Adaptation Brief.
- Generate Scene Blueprint.
- Generate screenplay JSON.
- Generate YAML only from validated JSON.

Acceptance:

- Outputs are JSON-first.
- Invalid output is rejected or repaired.
- Final screenplay validates.
- YAML export succeeds.

## Slice 5 Checklist: Scene Revision, Versioning, Compare, And Demo Polish

### 5.1 Scene Revision

- Select one scene.
- Enter revision instruction.
- Run revise scene step.
- Validate updated scene.
- Replace selected scene only.
- Regenerate validation and YAML.

Acceptance:

- Only selected scene changes unless related validation updates are required.
- Scene revision record stores instruction, before, after, and summary.

### 5.2 Versioning And Compare

- Add project checkpoints.
- Persist snapshots locally.
- Render timeline.
- Compare current and previous snapshot.
- Restore selected checkpoint.
- Add direction branch support when needed.

Acceptance:

- Timeline records key actions.
- Compare identifies added, removed, and modified scenes.
- Restore updates project state.
- Refresh preserves local state.

### 5.3 Demo Polish And Docs

- Add `docs/product-brief.md`.
- Add `docs/yaml-schema.md`.
- Update README demo flow.
- Add sample input and output files.
- Polish empty, loading, error, validation, revision, compare, and trace states.

Acceptance:

- README demo flow is reproducible.
- Schema docs match implementation.
- Typecheck, lint, tests, build, and browser checks pass or failures are documented.

