# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

**MindSpend** — a gamified, emotion-aware expense tracker (Next.js 16 App Router, Turbopack). All data is client-side; there is no backend. The product thesis: connecting each purchase to an emotion + intent + regret reflection, then using gamification (XP, levels, badges, streaks, daily quests) and a rules-based "AI Coach" to nudge users toward better spending.

## Commands

```bash
npm run dev      # dev server (Turbopack) on :3000
npm run build    # production build (also runs full TS check)
npm run lint     # eslint
npx tsc --noEmit # type-check only
```

There is no test suite. Verify changes via `npm run build` (it type-checks all routes) and the running dev server. A preview launch config lives in the **parent** dir at `../.claude/launch.json` (runs `npm run dev --prefix expense-tracker`).

## Architecture

The data flow is: **IndexedDB ⇄ Zustand store ⇄ pure lib functions ⇄ React components**.

- **`src/hooks/useExpenseStore.ts`** is the single source of truth. It holds `expenses`, `goals`, and `profile` in memory, hydrated from IndexedDB on mount via `HydrateStore`. `addExpense` is the central mutation — it computes XP, updates the streak, persists to idb, re-evaluates badges, and detects level-ups, all in one action. Two persistence layers coexist by design: **`profile` (incl. XP, badges, custom categories, currency) is persisted to localStorage** via zustand `persist`/`partialize`; **expenses + goals live in IndexedDB** (too large for localStorage) via `src/lib/db/`.

- **`src/lib/` is where all logic lives — keep it pure and UI-free.** Components should call these and render; do not put scoring/aggregation logic in components.
  - `gamification/` — `xp.ts` (award rules), `levels.ts` (`100·(n-1)^1.6` curve), `badges.ts` (each badge is a pure `(expenses, profile) => boolean` evaluator; `evaluateBadges` runs after every add), `quests.ts` (daily quest derivation).
  - `insights/` — `patterns.ts` (nudge detection), `summaries.ts` (daily/weekly/monthly aggregators), `coach.ts` (the "AI Coach": correlates emotion/intent/regret into quantified recommendations — **rules-based, not an LLM call**), `savings.ts`, `education.ts` (tip library).
  - `money.ts` — all currency formatting. **Never hardcode `$` or `.toFixed(2)`** — use `formatMoney(cents, currency)` / `currencySymbol(currency)`. Amounts are stored as **integer cents**. Currency auto-detects from timezone/locale on first hydrate unless `profile.currencyLocked`.
  - `categories.ts` — built-in categories use Tailwind classes (`bgClass`/`textClass`); custom categories use inline `color` styles. Always resolve a category id through **`resolveCategory(id, profile.customCategories)`** rather than indexing `CATEGORIES` directly, since `Category` is `BuiltInCategory | string`.

- **Add-expense flow is a two-page wizard** bridged by `store.draftExpense`: `/add` collects amount/description/category and sets the draft, then `/add/checkin` runs the 3-step emotional check-in (intent → emotion → regret) and calls `addExpense`. Navigating to `/add/checkin` without a draft redirects back.

- **Celebration events** are surfaced via transient store fields consumed by global overlays mounted in `layout.tsx`: `newBadges` → `AchievementToast`, `leveledUpTo` → `LevelUpModal` (both fire canvas-confetti). After consuming, components call `clearNewBadges` / `clearLevelUp`.

## Conventions

- Dark glassmorphism theme. Use the `.glass`, `.gradient-text`, `.glow-*` utility classes and CSS custom properties (`--accent-*`) defined in `globals.css` rather than ad-hoc colors. The theme is forced dark; shadcn's light/`.dark` variables were overwritten.
- Components that read store state must be `'use client'`.
- Per `AGENTS.md`: this is Next.js 16 with breaking changes from older versions — consult `node_modules/next/dist/docs/` before relying on remembered Next.js APIs.
