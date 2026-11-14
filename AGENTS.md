# Agent instructions

Shared instructions for every AI coding agent working in this repo
(Claude Code, Codex, OpenCode, Cline, Copilot CLI, Droid, Qwen Code, Pi, Trae, ...).

## Skills

All project skills live in one place: `.agents/skills/<name>/SKILL.md`.
Before starting a task, read the skill(s) that match it and follow them
(stack, folder structure, naming, code style, animation and design patterns).

| Skill | Use for |
| --- | --- |
| frontend | React components, Vite, Tailwind, sections, layout |
| animations | Framer Motion, scroll/hover/loading animations |
| accessibility | ARIA, keyboard nav, contrast, focus |
| performance | Load time, lazy loading, bundle splitting |
| seo | Meta tags, Open Graph, sitemap, structured data |
| backend | Express routes, middleware, CORS, env vars |
| api-design | REST endpoints, response and error formats |
| database | Prisma schema, queries, migrations |
| email | Contact form email (Nodemailer / Resend) |
| error-handling | Error boundaries, API and network errors |
| security | Env vars, validation, headers, rate limiting |
| deployment | render.yaml, build commands, Cloudflare |
| git-workflow | Branches, commits, pushing |
| run-okkar-profolio | Running, building and smoke-testing the app |
| claude | General reasoning / writing tasks |

## Layout

```
.agents/
  skills/     <- the one real copy of every skill
  commands/   <- shared slash commands / prompts
  agents/     <- shared subagent definitions
.claude/skills  -> junction to .agents/skills
.trae/skills    -> junction to .agents/skills
.trae/commands  -> junction to .agents/commands
```

Add new skills only under `.agents/skills/`; every tool sees them automatically.
