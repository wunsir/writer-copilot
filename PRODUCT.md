# Writer Copilot Product Context

## Register

Product UI.

## Product Purpose

Writer Copilot is an AI Adaptation Studio for turning 3+ chapters of novel text into source-grounded, editable, schema-validated screenplay YAML.

It productizes the creative adaptation process instead of acting as a one-shot novel-to-YAML converter.

## Primary Users

- Novel authors who want to adapt their own work.
- Screenwriting students or creators exploring adaptation directions.
- Competition/demo users evaluating whether the AI workflow feels like a real product.

## Core Promise

The user can see and control how the adaptation happens:

- What source evidence supports the output.
- Which adaptation direction is being used.
- What the Adaptation Brief says.
- How Scene Blueprints transform prose into scenes.
- Whether the screenplay YAML is structurally valid.
- What changed after a scene revision.
- Which harness steps ran and why.

## Product Settings

Settings should support the adaptation workflow, not superficial theme tweaking.

Product settings should cover:

- Workspace language and default output language.
- Model provider status and safe API-key configuration guidance.
- Default target medium, pacing, fidelity, and tone.
- Knowledge pack preferences.
- YAML schema version and export options.
- Autosave, local project storage, reset, and export project JSON.
- Privacy notes for source text and model calls.
- Interface density and preview font size when useful for reading long text.

Avoid making color and font customization a primary user-facing feature. Visual styling should come from the product design system. If typography or density controls are added, they should improve reading and editing comfort across the Studio, not only affect the settings panel itself.

## Product Anti-References

Avoid:

- Single prompt-to-YAML forms.
- Chatbot wrappers with a file upload.
- Generic SaaS dashboards.
- Static sidebars full of flat settings.
- Settings panels that only adjust their own appearance.
- Marketing landing pages as the primary experience.
- Decorative AI visuals that do not explain source, decisions, validation, or revisions.

