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

Use a three-panel Studio as the default state, not as a permanent cage. Current user-facing labels are Chinese:

- Left: `作品目录`.
- Center: stage-specific adaptation work surface.
- Right: `依据与检查` / `选择详情`.

The three panels should not be visually equal. The center canvas is primary. The left panel guides entry and can expand into focused project work. The right inspector explains, verifies, and traces only the current object.

## Current Accepted Baseline

The Stage 1 and Stage 2 UI baseline is accepted for now. Do not continue structural UI refactors, color tuning, font tuning, or shadow tuning unless the user explicitly asks.

Keep future work focused on product capability and interaction semantics:

- Preserve the current modern minimal shell.
- Preserve the stage-specific center canvas modes.
- Preserve the right Inspector behavior that follows the selected source chunk, direction, scene, version, YAML, or validation issue.
- Preserve the natural Chinese workbench vocabulary from the Microcopy + Action Semantics pass.
- Pasted-text and `.txt` source import are now real. Knowledge pack display, local JSON harness preview, and API-backed direction generation entry are now real. Leave API-backed screenplay generation, `.docx` import, and settings save visibly marked as `待接入` until the functionality exists.

## Left Creation Panel

The left panel is not a static settings sidebar. It is the `作品目录` and can expand into a focused panel.

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

## Microcopy And Action Semantics

Use natural Chinese language for a novelist or adaptation creator. Avoid engineering labels and translation-heavy copy.

Current copy conventions:

- `Project Binder` / `Binder` -> `作品目录`.
- `Object Inspector` -> `依据与检查` or `选择详情`.
- `Selected` -> `当前选择`.
- `Adaptation direction` -> `改编路线`.
- `Next action` -> `下一步`.
- `Source refs` -> `原文依据`.
- `Scene Blueprint` -> `场景蓝图`.
- `Screenplay Draft` -> `剧本草稿`.

Primary workflow buttons should communicate whether the action is real:

- `采用此路线` is an available mock selection action.
- `导出 YAML` is available because YAML export exists in the current mock project.
- `导入原文` is available for pasted text and `.txt` files.
- `AI 生成方向` is available when local model env is configured; missing-key failures should appear in Trace without exposing secrets.
- `本地 JSON 预演` is available in the Trace tab because it runs only local structured-output validation and trace recording.
- `生成剧本（待接入）` and `保存设置（待接入）` remain disabled until real functionality exists.

Avoid copy such as `prompt 模板`, `蓝图约束`, `Object`, `Selected`, `Next action`, or other implementation terms in user-facing UI.

## Stage 2 Interaction Rules

The Studio shell should keep one navigation model, but each stage must feel like a different working mode:

- Source uses a reader plus chunk map. Selecting a chunk changes the Inspector evidence object.
- Diagnosis uses a report layout with risk and visual-signal boards, not generic cards.
- Direction Explorer uses comparison lanes. Selecting a direction changes the Inspector recommendation context.
- Adaptation Brief uses an editable document surface. It should feel like a contract the user can revise before generation.
- Scene Blueprint uses a scene board. Selecting a scene updates the Inspector and source refs.
- Screenplay uses a scene index plus draft preview. YAML and validation are adjacent inspector modes, not the main canvas by default.
- Compare uses a version rail plus before/after change panel.

Avoid passive disabled buttons in the primary workflow. If a real capability is not connected yet, show the next action, the current status, or what the action will do once connected.

On mobile, the main canvas takes priority after the stage controls. The Inspector should behave like a secondary review surface rather than a third equal column.

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

Primary visual system:

- Product shell: modern minimal, close to Linear / Vercel / Open Design style. Use system sans typography, near-white surfaces, hairline borders, restrained selected states, and one accent only for active stage, primary action, or operational status.
- Inspector, YAML, validation, timeline, and trace: tech-utility. Favor dense object details, compact tabs, tabular code/data surfaces, and clear semantic status.
- Creative assets such as source text, Adaptation Brief, Scene Blueprint, and screenplay pages may use restrained editorial treatment. This treatment belongs inside the asset surface only, not the global shell.

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

