# Spec: AI Adaptation Studio

## Status

Active baseline spec.

The repository now has an initial Next.js Studio scaffold, package configuration, baseline verification commands, domain validation utilities, YAML export, sample project data, and a mock full-flow Studio UI.

Current UI baseline:

- Stage 1 visual shell is complete enough for acceptance: modern minimal product shell, narrower `作品目录`, primary center canvas, and right `依据与检查` panel.
- Stage 2 interaction pass is complete enough for acceptance: the center canvas changes by stage and the Inspector follows selected source chunks, directions, scenes, and versions.
- Microcopy + Action Semantics pass is complete enough for acceptance: visible UI copy uses natural Chinese adaptation-workbench language, and unavailable actions are marked `待接入`.
- Pasted-text and `.txt` source import are connected.
- Chapter parsing, stable source chunks, lightweight search, and imported-source evidence display are connected.
- Knowledge pack files, metadata, selection reasons, Inspector display, local JSON-first harness preview, and trace recording are connected.
- DashScope/OpenAI-compatible provider config, direction generation route, and UI entry are connected.

Do not restart broad UI structure, color, font, or shadow work unless the user explicitly asks. The next product slice should continue API-backed JSON generation beyond directions.

## Goal

Build Writer Copilot as an AI Adaptation Studio that helps users convert 3+ chapters of novel text into a source-grounded, editable, schema-validated screenplay YAML project.

The product must present the adaptation process as a real creative workflow, not as a single text conversion form.

## Product Positioning

Writer Copilot helps novel authors and adaptation creators:

1. Import novel source material.
2. Understand the story and adaptation risks.
3. Retrieve evidence from source chunks.
4. Explore dynamic adaptation directions.
5. Build a controllable Adaptation Brief.
6. Generate Scene Blueprints.
7. Produce structured screenplay JSON.
8. Validate and export screenplay YAML.
9. Revise individual scenes without regenerating everything.
10. Track checkpoints, revisions, comparisons, and harness traces.

## Core User Flow

The full target flow is:

```text
Import novel
-> parse chapters
-> build source chunks
-> build lightweight source index
-> analyze story
-> recommend adaptation directions
-> user selects, blends, or adjusts direction
-> build Adaptation Brief
-> generate Scene Blueprint
-> generate screenplay JSON
-> validate screenplay structure and references
-> generate YAML
-> revise one selected scene
-> create version checkpoints
-> compare, restore, and export
```

## Core Features

### Source Import

Support these import paths:

- Paste text.
- Upload `.txt`.
- Upload `.docx` when the stack supports it.

The import layer should:

- Detect chapters.
- Require or strongly guide toward 3+ chapters for the main flow.
- Split chapters into paragraph-level source chunks.
- Track word or character counts.
- Extract basic names, locations, event keywords, and chunk IDs.

### Source Intelligence

Analyze the novel before screenplay generation.

Diagnosis should cover:

- Core conflict.
- Protagonist goal and motivation.
- Main characters.
- Major locations.
- Key events.
- Opening hook strength.
- Internal monologue ratio.
- Action, dialogue, and exposition balance.
- Adaptation risks.
- Visual adaptation potential.

### Lightweight Source RAG

Use source chunks and lightweight search instead of a heavy vector database by default.

Each source chunk should have a stable ID such as `chapter_1:p_004`.

Generated adaptation assets should include source references where applicable:

- Adaptation directions.
- Adaptation Brief support.
- Scene Blueprints.
- Screenplay scenes.
- Revision explanations.

### Knowledge Packs

Include internal knowledge packs as reusable text assets. Initial packs may include:

- Adaptation principles.
- Web drama hooks.
- Film opening.
- Prose to action.
- Dialogue compression.
- Scene beats.
- Screenplay YAML rules.

The app should show active knowledge packs when they influence generation.

### Direction Explorer

Generate dynamic adaptation directions from source material and user preferences.

Directions should not be a hardcoded fixed set. Each direction should include:

- Title.
- Target medium.
- Logline.
- Recommendation reason.
- Source strengths used.
- What to preserve.
- What to transform.
- Risks.
- Suitable audience or style.
- `source_refs`.

Users should be able to choose a direction, blend directions, adjust controls, or add natural-language preferences.

### Adaptation Brief

The Adaptation Brief is the central intermediate asset. It should represent user-approved creative intent and drive later generation.

The brief should include:

- Target medium.
- Pacing.
- Fidelity.
- Tone.
- Adaptation strategies.
- Preserve list.
- Transform list.
- Avoid list.
- User preference notes.
- Source references where useful.

### Scene Blueprint

Generate Scene Blueprints before final screenplay output.

Each scene blueprint should include:

- Scene title.
- Source chapters.
- `source_refs`.
- Story beats.
- Adaptation decision.
- Adaptation reason.
- Estimated duration.
- Action preview.
- Dialogue preview.

Adaptation decision types should include:

- `preserve`
- `compress`
- `merge`
- `reorder`
- `invent`
- `externalize`

### Screenplay JSON And YAML Export

The canonical generated screenplay data is structured JSON.

YAML is generated by the application from validated JSON.

The screenplay structure should include:

- `schema_version`
- `project`
- `adaptation_brief`
- `source`
- `source_refs`
- `characters`
- `locations`
- `scenes`
- `validation_report`

### Schema Validation

Validation must perform real checks, including:

- YAML can be parsed after export.
- Scene IDs are unique.
- Character references point to existing characters.
- Location references point to existing locations.
- Source references point to existing source chunks.
- Adaptation decisions include a type and reason.
- Required screenplay fields exist.

### Scene Revision

Users can select one scene and request a natural-language revision.

The system should:

- Send only relevant project context and selected scene context.
- Return an updated scene JSON object.
- Validate the updated scene.
- Replace only that scene.
- Regenerate YAML and validation report.
- Record a Scene Revision and checkpoint.

### Creative Versioning

Support creative checkpoints without implementing full Git.

Versioning should include:

- Project-level snapshots.
- Timeline.
- Checkpoint labels.
- Scene revision history.
- Compare current and previous versions.
- Restore prior snapshot.
- Direction branches when direction-based workflows are implemented.

### Adaptation Harness

Model calls should be managed by a small domain harness, not scattered prompts.

The harness should own:

- Step orchestration.
- Context selection.
- Source retrieval.
- Knowledge pack selection.
- Prompt construction.
- Structured JSON output parsing.
- Zod validation.
- Repair attempts.
- YAML generation.
- Trace recording.
- Version checkpoint creation.

Harness steps should include:

- `parse_source`
- `build_source_index`
- `analyze_story`
- `generate_directions`
- `build_adaptation_brief`
- `generate_screenplay`
- `validate_screenplay`
- `revise_scene`
- `create_version_checkpoint`

### Studio UI

Use a three-panel product studio layout:

- Left: `作品目录`.
- Center: Adaptation Canvas.
- Right: `依据与检查` / `选择详情`.

The UI should support these center states:

- Empty/import state.
- Chapter Map.
- Story Diagnosis.
- Direction Explorer.
- Adaptation Brief.
- Scene Blueprint.
- Screenplay Draft.
- Version Compare.

The right inspector should support:

- Current recommendations.
- Source evidence.
- YAML Preview.
- Schema Validation.
- Revision History.
- Version Timeline.
- Harness Trace.
- Settings.

Current UI supports the main flow, stage-specific surfaces, pasted-text and `.txt` import, chapter parsing, source chunks, lightweight search, imported-source evidence display, active knowledge packs, local JSON harness preview, trace recording, and API-backed story diagnosis, direction generation, brief generation, blueprint generation, and screenplay JSON generation when local env is configured. `.docx` import, settings persistence, source-ref jumping, scene revision, and durable versioning remain future implementation work.

### Product Settings

Settings are part of the Studio workflow, not a decorative theme panel.

Settings should include:

- Workspace and output language.
- Default adaptation goal controls.
- Knowledge pack preferences.
- YAML schema and export options.
- Model provider status and safe API-key guidance.
- Autosave and local storage controls.
- Export project JSON and clear local workspace data.
- Reading density or preview font-size controls if useful.

Settings must not be limited to changing the settings panel itself. Avoid making arbitrary color and font customization a central product feature.

## Non-Goals

Unless explicitly requested, do not implement:

- Production authentication.
- Payment or billing.
- Multi-user collaboration.
- Production cloud database.
- Heavy vector database.
- Complex external agent framework.
- Full rich-text screenplay editor.
- Direct AI-to-YAML as the main generation path.

## Success Criteria

The full target product is successful when:

- A user can import or paste a 3+ chapter novel sample.
- The app detects chapters and source chunks.
- The app produces story diagnosis cards.
- The app recommends dynamic, source-grounded adaptation directions.
- The user can build or adjust an Adaptation Brief.
- The app generates Scene Blueprints.
- The app generates structured screenplay JSON.
- The app validates references and required structure.
- The app exports valid screenplay YAML.
- The user can revise one selected scene without regenerating all scenes.
- The app records version checkpoints and scene revisions.
- The user can compare and restore versions.
- The app displays Harness Trace for important generation steps.
- Settings support real workflow configuration without breaking the product visual system.
- Repo docs explain the schema and demo flow.
