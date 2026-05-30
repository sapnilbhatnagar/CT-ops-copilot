# Contributing

How we ship changes on this repo. Read this once before your first change.

## The core rule

**Every feature becomes a pull request. `main` stays deployable at all times. Nobody pushes directly to `main`.**

One feature, one branch, one PR. If a change is big enough to describe in a sentence with an "and" in it, it is probably two PRs.

## The loop

```bash
# 1. Start from an up-to-date main
git switch main
git pull

# 2. Branch, one feature per branch
git switch -c feat/leads-dashboard-table

# 3. Build it test-first (TDD: write the failing test, make it pass, refactor)
#    Work inside app/. Leave `npm run test:watch` running.

# 4. Verify before you push, both must be green
cd app && npm test && npm run build

# 5. Push and open the PR
git push -u origin feat/leads-dashboard-table
gh pr create --fill
```

A human reviews and merges. After merge, delete the branch and start the next one from a fresh `main`.

## Branch naming

`<type>/<short-kebab-description>`, where type is one of:

| Prefix | Use for |
|---|---|
| `feat/` | A new feature or module |
| `fix/` | A bug fix |
| `chore/` | Tooling, deps, config, no user-facing change |
| `docs/` | Docs only |
| `refactor/` | Internal change, no behavior change |

Examples: `feat/intake-extraction-panel`, `fix/pagination-off-by-one`, `docs/setup-airtable-schema`.

## What a PR must clear before merge

- [ ] `npm test` passes (from `app/`).
- [ ] `npm run build` passes (from `app/`).
- [ ] New behavior has a test written before the implementation (TDD).
- [ ] No secrets, no `.env.local`, no API keys in the diff.
- [ ] The diff only touches what the feature needs. No drive-by refactors.
- [ ] PR description says what changed and how it was verified.

## Commit messages

Present tense, what and why, not how. One logical change per commit where practical.

```
Add classification override to lead detail header

Lets an admin correct the model's hot/warm/cold call. Source flips
to "user" so we can measure model accuracy later.
```

## How we build (the bigger picture)

This is a **UI-first** build. Every module ships its visual layer on mock data first, gets signed off by Sapnil, then gets its backend. The UI defines the data contract the backend satisfies, never the reverse. The phase order and current status live in `README.md` §6 and the full specs in `Build Plan.md`.

When you scaffold a screen: define the hook contract first (`app/src/lib/hooks/`), build the component against the hook returning mock data, write the behavior tests, and only later swap the hook body from mock to `fetch`. Components never import mock data directly.

## Secrets

Never commit real credentials. `.env*` is gitignored. Use `app/env.example` as the template and keep real values in `app/.env.local` (untracked). See `SETUP.md` for what each value is and where to get it.
