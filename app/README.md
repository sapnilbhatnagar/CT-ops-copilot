# Connecting Traveller — Ops Console

Internal lead and re-engagement console. UI-first build per `../Build Plan.md`.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind v4 with design tokens in `src/app/globals.css`
- shadcn/ui-compatible setup (Radix primitives + `cn` utility, components added on demand)
- Vitest + React Testing Library for behavior tests (TDD)
- Inter (UI) + Fraunces (display) via `next/font/google`

## Run locally

```bash
npm install   # only on first checkout
npm run dev   # localhost:3000
```

## Test

```bash
npm test           # run once
npm run test:watch # watch mode
```

## Build

```bash
npm run build
```

## Folder map

```
src/
  app/
    layout.tsx                 root layout: fonts + body
    globals.css                design tokens + Tailwind theme
    (console)/                 route group: shares the sidebar shell
      layout.tsx               renders <Sidebar /> + <main>
      page.tsx                 redirects to /intake
      intake/                  Phase 1a target
      leads/                   Phase 2a target
      trips/                   Phase 3a target
      community/               Phase 4a target
      settings/                Phase 5 target
  components/
    console-shell/
      sidebar.tsx              left nav (operational modules)
      sidebar.test.tsx         smoke test
      topbar.tsx               crumb + workspace pill
      section-opener.tsx       Fraunces title + narrative subhead
  lib/
    utils.ts                   cn() helper
```

## Design tokens

All color and typography choices live as CSS custom properties in `src/app/globals.css` and are exposed to Tailwind via `@theme inline`. Adjusting one token cascades through every component — never hard-code a color.

| Token | Role |
|---|---|
| `--ink` | Headlines, sidebar bg |
| `--paper` | Canvas |
| `--mute` | Secondary text |
| `--rule` | Dividers, borders |
| `--accent` | Terracotta — HOT classification, primary CTAs, focus rings |
| `--warm` / `--cool` / `--ok` | Classification + success states |

## TDD loop

Every component or hook ships with a behavior test written **before** the implementation. Red → green → refactor.

```bash
npm run test:watch   # leave running while you build
```

## What's done (Phase 0)

- Scaffold, Tailwind v4, design tokens
- App shell with operational sidebar (Intake · Leads · Trips · Community · Settings)
- Five empty module pages with section-opener narrative copy
- Vitest + RTL set up; 3 green tests for the sidebar
- Production build verified

## What's next (Phase 1a)

Lead Intake module: conversation viewer + live AI extraction + classification badge, all driven by mock data behind `useLeads` / `useConversation` hooks. See `../Build Plan.md` Phase 1a.
