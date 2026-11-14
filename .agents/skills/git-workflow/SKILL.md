---
name: git-workflow
description: "Use this skill when working with Git and GitHub version control for the portfolio project. Triggers include: committing changes, pushing to GitHub, creating branches, merging, pulling latest changes, or following commit message conventions."
---

# git-workflow

## Repository
- Remote: https://github.com/Okkar06/okkar_profolio.git
- Main branch: main

## Daily Workflow
# Check changed files
git status

# Stage changes
git add .                        # all changes
git add src/components/          # specific folder
git add src/App.jsx              # specific file

# Commit
git commit -m "type: short description"

# Push
git push origin main

## Commit Message Convention
Use the format: type: short description

Types:
- feat: new feature or section (e.g. feat: add Hero section)
- fix: bug fix (e.g. fix: fix mobile navbar)
- style: styling changes (e.g. style: update accent colors)
- refactor: code restructure (e.g. refactor: split App into sections)
- chore: config or setup (e.g. chore: update tailwind config)
- deploy: deployment changes (e.g. deploy: update render.yaml)

## Branch Workflow
# Create a new branch for a feature
git checkout -b feat/section-name

# Merge back to main
git checkout main
git merge feat/section-name

## Useful Commands
git log --oneline           # view commit history
git pull origin main        # pull latest from GitHub
git reset --soft HEAD~1     # undo last commit (keep changes)
git stash                   # temporarily save uncommitted changes
git stash pop               # restore stashed changes

## Commit Frequency Rules
- After completing each section (Hero, Projects, Skills, Contact)
- After every bug fix
- At the end of every work session
- Always commit before trying risky changes

## Examples
- "Finished Hero section" → git add . && git commit -m "feat: add Hero section with Tailwind styling"
- "Fixed mobile layout" → git commit -m "fix: fix responsive layout on mobile"
- "Updated render.yaml" → git commit -m "deploy: update render.yaml build config"