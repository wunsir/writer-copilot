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

Use a three-panel Studio as the default state, not as a permanent cage:

- Left: Project Binder.
- Center: Adaptation Canvas.
- Right: Object Inspector.

The three panels should not be visually equal. The center canvas is primary. The left panel guides entry and can expand into focused project work. The right inspector explains, verifies, and traces only the current object.

## Left Creation Panel

The left panel is not a static settings sidebar. It is a project Binder that can expand into a focused panel.

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

The center canvas should change by project stage and make one creative asset primary at a time. Different stages should feel like different work modes, not the same card list with a different title.

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

- 助理.
- 依据.
- YAML.
- 校验.
- 时间线.
- 运行.
- 设置.

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

## Settings Experience

Settings belong inside the Studio as a dedicated modal or slide-over. They should not reuse the right Inspector, because settings are global workspace configuration rather than properties of the currently selected creative object.

Settings should be grouped by user intent:

- 创作偏好: target medium, pacing, fidelity, tone, default knowledge packs.
- 输出: YAML schema version, export format, include source excerpts, include validation report.
- 模型: provider status, model name, API key guidance without exposing secrets.
- 工作区: autosave, local storage, export project JSON, clear local data.
- 阅读: interface density and preview font size if needed.

Do not expose raw color and font knobs as the main settings experience. The product should have a coherent visual system by default. If a setting affects presentation, it must affect the relevant Studio surface globally and predictably.

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

