# Writer Copilot Design Direction

## Register

Product UI. Design serves a creative workbench for writers and adaptation creators.

## Product Feel

Writer Copilot should feel like an editorial adaptation room: structured, focused, and alive with creative evidence. It should not feel like a generic SaaS dashboard, a chatbot wrapper, or a long settings form.

The interface should make users feel that they are moving through a real adaptation process:

```text
source material -> interpretation -> direction -> brief -> blueprint -> screenplay -> revision -> version history
```

## Layout Model

Use a three-panel Studio:

- Left: Creation Panel.
- Center: Adaptation Canvas.
- Right: AI Director / Inspector.

The three panels should not be visually equal. The center canvas is primary. The left panel guides entry and controls. The right inspector explains, verifies, and traces.

## Left Creation Panel

The left panel is not a static settings sidebar.

It should support progressive depth:

- Compact list of creation steps.
- Expandable active step.
- Focused "enter creation" mode for import, goal shaping, knowledge pack selection, and output controls.
- Clear stage status for pending, active, generated, revised, and validated states.

Good left-panel behavior:

- Clicking Source opens a larger import workspace or focused import drawer.
- Clicking Adaptation Goal expands medium, pacing, fidelity, tone, and preference controls.
- Clicking Knowledge Packs reveals active packs and why they are selected.
- Clicking Output focuses export format, schema, and validation state.

Avoid:

- A flat list of text fields.
- Repeating the same card pattern for every step.
- Treating all controls as equally important.

## Adaptation Canvas

The center canvas should change by project stage and make one creative asset primary at a time.

Canvas states:

- Empty/import-ready state.
- Chapter Map.
- Story Diagnosis.
- Direction Explorer.
- Adaptation Brief.
- Scene Blueprint.
- Screenplay Draft.
- Version Compare.

Direction Explorer, Adaptation Brief, and Scene Blueprint must be present early in the mock product shell. They are core differentiators, not later polish.

## AI Director / Inspector

The right panel is context-aware. It should show details for the selected asset or current stage.

Inspector tabs:

- Director.
- Evidence.
- YAML.
- Validation.
- Timeline.
- Trace.

The Inspector should answer:

- Why is the system recommending this?
- Which source chunks support it?
- Is the screenplay valid?
- What changed?
- Which harness steps ran?

## Interaction Principles

- Use focused stage transitions instead of showing every feature at once.
- Let users select a direction, scene, source chunk, version, or validation issue and see the Inspector update.
- Make source references visible and clickable where practical.
- Make validation feel operational: issues should point to fields, scenes, characters, locations, or source refs.
- Make revisions local and confident: selected scene, instruction, before/after, validation rerun.
- Use timeline and trace as product confidence, not debug clutter.

## Visual Tone

The product should feel refined and serious enough for creative professionals, but not cold.

Use:

- Clear information hierarchy.
- Dense but breathable work surfaces.
- Subtle stage motion.
- Focus states that make the active creative asset feel important.
- Controlled color roles for source, direction, validation, revision, and trace.

Avoid:

- Generic purple-blue AI gradients.
- Marketing hero layouts.
- Nested card stacks.
- Flat form builders.
- Decorative UI that does not support the adaptation workflow.

