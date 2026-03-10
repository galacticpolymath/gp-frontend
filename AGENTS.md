# AGENTS.md

This file defines default operating rules for coding agents in this repository.

## Source Of Truth

- Follow [`docs/aesthetic-guidelines.md`](docs/aesthetic-guidelines.md) for UI/visual direction.
- If this file and the aesthetic guide conflict, prefer the aesthetic guide for visuals and this file for engineering process.

## Core Standards

- Keep code modular and easy to navigate by feature.
- Avoid one-off implementations when a shared utility/component already exists.
- Optimize for maintainability first, then visual polish.
- Preserve existing product behavior unless a change is explicitly requested.
- **Scope lock is mandatory**:
  - If the request is visual/CSS-only, do not edit routing, middleware/proxy, auth/session, data loading, or URL state logic.
  - Do not touch `pages/api/**`, `proxy.js`, `next.config.js`, or route parsing in page components unless the user explicitly asks for that area.
  - If a potential fix requires crossing scope boundaries, stop and confirm before editing.

## Repeated Issues To Prevent

- **Hover style regressions**:
  - Blue text hover and underline hover effects on text cards/buttons must be overridable with `.textyCardHover`.
  - If link-like styles leak into card/button CTAs, apply/extend `.textyCardHover` rather than patching ad hoc selectors.
- **Hook import misses after refactors**:
  - When moving hook logic (`useMemo`, `useCallback`, etc.), verify imports in touched files before finishing.
- **State extraction regressions**:
  - If state is moved into hooks, export close/toggle handlers with the state to avoid orphaned setters in page components.
- **Teaching Materials preview pane regressions**:
  - In Unit teaching materials, the preview pane must use smooth native sticky behavior on desktop (no scroll-driven JS top-updates).
  - Required behavior:
    1. Preview pane fills available viewport space under sticky header (`viewport height - sticky header offset`, clamped to resources-card height).
    2. Preview pane remains pinned directly below `.unitStickyInner` while scrolling.
    3. Preview pane unpins only when its bottom reaches the bottom of `.lessonResourcesCard`.
    4. Long preview content (procedure/background/going-further) must scroll inside the preview pane, not the full page.
    5. Featured Media should fit the preview pane without introducing an extra inner scroll container.
  - Do not implement scroll-position polling or scroll listeners that update preview `top` on each frame; this introduces jitter.
  - Any observers/listeners used for sizing must be scoped to materials tab only and fully cleaned up on tab/page changes.
  - Sticky precondition: no ancestor of `.lessonPreviewsCard` may have non-visible overflow (`overflow: hidden/auto/scroll`) on desktop. Check the full shell chain, not just local wrappers:
    `html`
    `body`
    `#__next`
    layout wrappers around the page body
    materials grid ancestors
  - If app-shell overflow must be overridden for sticky to work, scope that override to the materials tab only and restore all prior inline styles on cleanup.
  - Treat sticky as a behavior problem, not a declaration problem. `position: sticky` plus `top` in CSS is not proof.
  - Never claim the preview pane is fixed until a real unit URL has been verified by actual scrolling and the pane visibly stays pinned under the sticky header until the bottom of `.lessonResourcesCard`.
- **Standalone preview route regressions**:
  - Full-page preview routes (`?sp=pro` / `?sp=bg`) are not the bounded materials preview pane.
  - Do not reuse preview-pane height/overflow constraints for standalone panels. Standalone content must size naturally with the page and print cleanly.
  - When editing standalone preview styles or data wiring, verify the route directly with a real lesson URL and confirm the body content remains visible after hydration, not just on first paint.
  - Treat standalone preview data resolution separately from grade-band/localStorage restoration. The requested lesson preview must not disappear because another classroom resource becomes selected after mount.

## File Size And Organization Rules

- Maximum target for authored code/style files: **800 lines**.
- If a file approaches ~700 lines and still grows, split by intuitive feature boundaries.
- Prefer structure by functional UI area, for example:
  - `modals`
  - `filter styling` (or other UI styling)
  - `dock`
  - `search/grid`
  - `hero/layout`
  - `shared utilities`
- Data-heavy mapping files are allowed to exceed 800 lines when a split would reduce clarity; document that choice in PR/change notes.

## CSS/SCSS Rules

- Use feature partials for large style systems; keep index files as import surfaces.
- Never split styles into arbitrary sequential chunks (for example, `foo-1.css`, `foo-2.css`, `foo-3.css`).
- Name split style files by functional responsibility (for example, `hero-layout`, `filters-panel`, `results-grid`, `modals`).
- Avoid CSS Modules-only syntax (`:global(...)`, `:local(...)`) in imported non-module partials (`*.css`/`*.scss`) because Turbopack can parse those as plain CSS and fail builds.
- For CSS Modules, split using SCSS partial modules (`_feature.scss`) and aggregate through a single `*.module.scss` file (module import surface). Avoid plain CSS import chains for module-scoped pages.
- If global third-party selectors are needed, either:
  - keep the rule in the root `*.module.css` file using module-safe syntax, or
  - use scoped descendant selectors from a local wrapper class (for example, `.mapFrame .svgMap-map-wrapper`) in SCSS module partials.
- Keep utility classes explicit and reusable; avoid repeating identical declarations across modules.
- Standardize breakpoints and reuse existing breakpoint patterns before adding new ones.
- Prefer token/variable-driven styling over hardcoded values when reused.

## Component And Utility Reuse

- If logic or styles are used 2+ times, extract into shared utility/component/module.
- Do not duplicate button variants, hover behavior, or animation patterns; centralize them.
- Before adding a new helper, search for existing equivalents with `rg`.

## Refactor Safety Checklist (Required)

For non-trivial edits:

1. Verify changed files compile/lint locally.
2. Run targeted tests for touched areas (or nearest existing test coverage).
3. Confirm no missing imports or orphaned references.
4. Confirm no stale naming from deprecated prototypes (for example, old `Burst` naming in JobViz paths).
5. Validate responsive behavior at existing project breakpoints.
6. **Confirm diff scope matches request scope** (for CSS tasks: styles/components only; no routing/auth/data files).
7. **Smoke-check essential routes when touching shared UI/layout files**:
   - `/`
   - one `/units/[loc]/[id]` page
   - `/api/auth/session`
8. If unrelated critical functionality regresses, rollback the unrelated edits immediately before continuing.

## JobViz-Specific Guardrails

- Keep JobViz modules split by UI domain and interaction flow.
- Preserve sidebar/dock clarity and spacing when editing assignment preview UI.
- Keep student preview/edit-mode synchronization intact when refactoring tour/editor state.
- Preserve/expand lazy-loading patterns for heavy UI and modal payloads.

## Navigation Behavior Guidelines

- Preserve user context across navigation:
  - Keep relevant query params (`tourId`, `edit`, `sort`, preview flags, filters) when moving between related views.
  - Do not drop active state silently during route updates.
- Prefer shallow routing for UI-state transitions that do not require full data reload.
- Maintain expected browser behavior:
  - Back/forward should restore prior UI state.
  - Avoid replacing history entries unless intentionally preventing stack noise.
- Scroll and focus behavior must be intentional:
  - For in-page navigation, scroll to stable anchors with a consistent offset.
  - Do not trigger unexpected scroll-to-top on state-only route changes.
  - Keep keyboard focus visible and logical after nav/toggle actions.
- Responsive nav parity:
  - Desktop and mobile nav flows should represent the same destination/state model.
  - Collapsed/expanded nav controls must not obscure labels or primary actions.
- Accessibility and semantics:
  - Use links for navigation and buttons for in-place state changes.
  - Ensure `aria-label`/accessible names are present on icon-only nav controls.

## Preferred Workflow

- Explore first with `rg`, then edit.
- Use small, reviewable commits/patches grouped by feature area.
- Avoid broad visual rewrites unless requested.
- When uncertain, choose the simplest architecture that avoids duplicate logic.

## Dependency Management Policy

- Treat `npm install --legacy-peer-deps` and `--force` as temporary fallback tools, not default solutions.
- Before using either fallback, first try a stable fix: align conflicting package versions, remove obsolete dependencies, or replace incompatible packages.
- If a fallback is unavoidable to unblock work, document:
  - why the proper dependency fix was not completed yet,
  - what risk remains,
  - and the intended follow-up to remove the fallback requirement.
