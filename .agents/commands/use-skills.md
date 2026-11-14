---
name: use skills
description: Forces the AI to read and follow all project skill files before generating any code
---
Before writing any code or generating any file for this project, always read and strictly follow the skills defined in this project. The skills are located in the .agents/ folder (.agents/skills, .agents/commands) or any SKILL.md files present in the workspace.

Specifically:
- Read the relevant skill file(s) before starting any task
- Follow the technology choices, folder structure, naming conventions, and code style defined in the skill
- If a skill defines a stack (e.g. HTML + Tailwind, React, Astro), use only that stack unless explicitly told otherwise
- Apply animation, layout, and design patterns from the skill exactly as described
- Do not introduce libraries, frameworks, or patterns not mentioned in the skill unless the user asks

Always check skills before generating: components, pages, styles, configs, or any project file.
