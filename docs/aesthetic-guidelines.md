---
title: Galactic Polymath Portal Aesthetic Guidelines
slug: gp-aesthetic-guidelines
version: 0.1.0
lastUpdated: 2024-05-17
owners:
  - Product
  - Design
sourceDocs:
  - JobViz 2.0 minimum scope.docx
audiences:
  - design
  - engineering
  - marketing
format: markdown+yaml+json
---

## Purpose
Create a single source of truth for the look, feel, and behavior of Galactic Polymath products so JobViz 2.0, the teacher portal, and public marketing pages feel related while still letting JobViz stand out as a data-rich playground. This guide mixes narrative direction for humans with structured tokens and checklists for code generation.

## Design Philosophy
- **Innovative but inviting:** Blend research-lab credibility with energetic classroom vibes. Visuals should feel modern and science-forward, yet approachable for educators pressed for time.
- **One ecosystem, distinct personalities:** JobViz adopts richer data cues, stacked iconography, and micro-interactions, but shares navigation, typography, spacing, and palette logic with the rest of the site.
- **Freemium transparency:** Communicate the value of GP+ convenience features (editable files, JobViz tours, bulk downloads) without hiding the open-access science resources that anchor the brand.
- **Squarespace parity:** Borrow hierarchy, generous whitespace, and typographic pacing from the marketing site so a user can land on any page and know they are still inside Galactic Polymath.

## Experience Pillars (Teachers & Students)
### Low-Friction Teacher Prep
- Keep primary actions (Assign, Download, Share) visible above the fold on desktop and within the first swipe on mobile.
- Limit filters or settings to the 3 most critical choices in default views; tuck advanced options into accordions to reduce cognitive load.
- Assignment banners (JobViz or unit pages) max out at three lines on mobile and can sit in a sticky rail on large screens.

### Joyful Student Exploration
- Category vs. job cards use distinct treatments: categories are outlined with count badges, jobs use subtle gradients or fills plus stacked icons.
- Emoji-based ratings and cache-friendly trackers show immediate feedback without requiring accounts; add helper text (5=Love ... 1=Nope) wherever the control appears.
- Micro-gamification (streaks, badges) stays opt-in and respects privacy; no persistent profiles are created for students.

### Unified Discovery
- **Home page search/filter:** Prominent search slot with smart defaults, curated unit collections, and teacher testimonials. Filters collapse into chips below 768px.
- **Unit pages:** Provide a consistent hero (title, grade band, primary CTA), quick stats bar (prep time, duration, materials), and a scrollable lesson outline with sticky section markers.
- **JobViz:** Emphasize data visualization but reuse portal spacing, typography, and CTA styles so the experience still feels native.

## Layout & Responsive System
### Breakpoints
| Breakpoint | Width (px) | Usage |
|------------|------------|-------|
| xs         | <480       | Small phones; single-column layouts, collapsible banners |
| sm         | 480-767    | Larger phones; stacked cards, carousel for assignment jobs |
| md         | 768-1023   | Tablets/small laptops; two-column grids, side panel optional |
| lg         | 1024-1439  | Desktops; sticky side rails, expanded nav |
| xl         | ≥1440      | Wide screens; max content width 1280px, center gutters |

Implement layouts via CSS grid + flex utilities; prefer container queries for component tweaks instead of duplicating markup.

### Page Archetypes
- **Home with search/filter:** Hero spans full width, search bar uses Hydro Blue accent, featured units display as card triplets (lg) or horizontal scroll (sm). Provide quick links to GP+ upsells in tertiary placements only.
- **Unit detail:** Sidebar (md+) houses lesson navigation and supporting assets toggles. On xs-sm, convert sidebar into a top sticky segmented control. Keep download CTAs persistent but dimmed for non-GP+ users with inline explanations.
- **JobViz explorer:** Left/center column shows hierarchy, right column (lg+) can host assignment or detail pane. On mobile, use modal overlays for job details; ensure modals are full-height with swipe-to-close gestures.
- **Modals and drawers:** Always trap focus, supply top-right close button + bottom CTA, and use consistent padding (24px desktop, 16px mobile). Panel backgrounds adopt theme colors with 92-96% opacity so motion remains subtle.
- **Section spacing:** Use `6.6vmax` for top and bottom padding on full-width marketing-style sections to mirror the Squarespace rhythm.

## Color & Theming
| Token | Hex | Role | Light Mode | Dark Mode |
|-------|-----|------|------------|-----------|
| `brand-hydro-blue` | #2C83C3 | Primary links, search accents | Buttons, active chips | Outline strokes, icon fills |
| `brand-lightning-purple` | #6C2D82 | Secondary CTA, highlights | Gradient start for JobViz cards | Background tint behind premium badges |
| `brand-fuchsia` | #FF3DAC | Data callouts, hover states | Spark lines, notification dots | Gradient midpoint for emphasis |
| `brand-atomic-blue` | #6812D1 | Depth, charts | Job-level card fill overlays | Primary surfaces in dark theme |
| `brand-burst-purple` | #CB1F83 | Alerts, progress states | Success path markers (paired with hydro) | Accent text on dark backgrounds |
| `brand-galactic-black` | #363636 | Body text | Default text color | Elevated surface |
| `brand-sparkle-white` | #F0F4FF | Backgrounds | Base page backdrop | Text/icon color for dark theme |
| `brand-plus-blue` | #1826BC | GP+ exclusive cues | Premium nav tabs, gradients | Halo behind GP+ badges |
| `brand-free-blue` | #00ACEB | Free-tier cues | Info banners | Outline-only in dark mode |

Guidelines:
- Use gradients sparingly: Job-level cards can blend Atomic Blue to Fuchsia at ≤15% opacity overlay.
- GP+ zones require at least one persistent signal (Plus Blue highlight, badge, or background gradient) but should not obscure content.
- Minimum contrast ratio 4.5:1 for text; lighten/darken tokens using auto-calculated steps (`brand-hydro-blue-100`, `-200`, etc.) derived from the base palette.

### Standards Subject Colors
Use these as subtle accents in standards-alignment UI (chips, borders, icons), not full-surface fills.

| Subject | Hex | RGB | Token |
|---------|-----|-----|-------|
| Math | `#DB4125` | `219, 65, 37` | `subject-math` |
| ELA | `#ECA14D` | `236, 161, 77` | `subject-ela` |
| Extra | `#F4F0D9` | `244, 240, 217` | `subject-extra` |
| Science | `#B798E8` | `183, 152, 232` | `subject-science` |
| Social Studies | `#633A9A` | `99, 58, 154` | `subject-social-studies` |
| Sustainability | `#349964` | `52, 153, 100` | `subject-sustainability` |
| SEL | `#0070DA` | `0, 70, 218` | `subject-sel` |

## Typography & Iconography
- **Primary font:** Noto Sans Light/Regular/SemiBold with system fallbacks (`"Noto Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`).
- Heading scale: H1 40/44, H2 32/36, H3 24/28, Body 18/28 for portal readability; tighten to 16/24 for dense tables.
- Minimum readable sizes: body-like instructional text should be at least 14px on mobile and 15-16px on desktop; reserve 12-13px for short labels/chips only.
- Use stacked icon pairs for JobViz job cards: outer glyph = category, inner = specific job. Maintain 24px outer, 16px inner, 2px stroke.
- Emoji ratings should render with consistent line height and include aria-labels describing the rating meaning.
- Navigation and filter icons follow mono-line style at 1.5px stroke; avoid mixing filled and outline icons within a single component.

## Micro-interactions & Motion
- Default animation timing: 150-200ms ease-out for hover/tap, 250ms ease-in-out for modal transitions. No animation should exceed 300ms.
- Provide tactile feedback on filter chip changes (color swap + 4px underline). For carousels, use snap points and limit auto-scrolling; user swipes take precedence.
- Respect `prefers-reduced-motion`: disable parallax, swap animated gradients for static fills, and shorten fade durations to 100ms.
- JobViz emoji toggles animate between states using scale (0.95 -> 1) and color shifts tied to rating value.

## Accessibility & Performance Guardrails
- Touch targets ≥44x44px, including stacked icons and carousel arrows.
- Keyboard order matches visual order; assignment banners and modals include skip links back to main content.
- Provide descriptive aria labels for CTA buttons (e.g., "Assign Data Streams unit to class").
- Lazy-load heavy data visualizations, but prefetch next-level hierarchy nodes to keep JobViz snappy. Keep core CSS under 150kb compressed; prefer CSS variables for theming.
- For cache-only interactions (emoji ratings), show persistence expectations ("Saved on this device") and provide a reset control.

## Shareability, Meta Tags, and SEO
- **Titles & descriptions:** Keep `<title>` ≤60 chars and `<meta name="description">` between 140-160 chars with action-oriented copy for teachers. Highlight freemium benefits ("Free open-access lessons" vs. "GP+ editable pack").
- **Open Graph/Twitter:** Supply `og:title`, `og:description`, `og:image` (1200x630), and matching `twitter:card=summary_large_image`. Variant images for GP+ pages should show premium cues but avoid exposing gated assets.
- **Structured data:** Use schema.org `Course` for units, `CreativeWork` for lesson plans, and `Dataset` for JobViz views with JSON-LD blocks. Include `isAccessibleForFree` and `offers` metadata to surface GP+ upsells without harming SEO.
- **Robots directives:** Default to `index,follow`. Apply `noindex,follow` to staging, experiments, or thin duplicate views (e.g., parameter-only variations). Keep downloadable assets behind authenticated routes and expose summary pages instead.
- **Canonical strategy:** Select one canonical URL pattern per resource, e.g., `https://teach.galacticpolymath.com/units/en-US/{id}`. All alternate locale URLs (`/units/en-NZ/4`) and backwards-compatible shorthand (`/units/1`) should output `<link rel="canonical" href="{default-locale-url}">` plus `rel="alternate" hreflang="en-US"` / `hreflang="en-NZ"` / `hreflang="x-default"`. Consistency signals to search engines which version to index and prevents splitting ranking signals.
- **Redirects:** Maintain 301 redirects from `/units/{id}` to the locale-specific canonical so analytics and SEO accumulate in one place. When locale detection re-routes users, still render the canonical tag for the destination page to avoid confusion.
- **Freemium previews:** Allow crawlers and social scrapers to fetch summary text and thumbnails, but gate downloads or interactive editors via runtime checks (not just client-side). Provide teaser copy that clarifies GP+ adds editable lessons, classroom analytics, and JobViz tours.
- **Sitemaps:** Generate locale-aware sitemaps with `<xhtml:link>` entries for each translation. Update nightly to keep Google Search Console aware of new units or JobViz assignments.

## Appendix: Tokens and Component Examples
### Design Tokens (JSON)
```json
{
  "color": {
    "brand": {
      "hydroBlue": "#2C83C3",
      "lightningPurple": "#6C2D82",
      "fuchsia": "#FF3DAC",
      "atomicBlue": "#6812D1",
      "burstPurple": "#CB1F83",
      "galacticBlack": "#363636",
      "sparkleWhite": "#F0F4FF",
      "plusBlue": "#1826BC",
      "freeBlue": "#00ACEB"
    },
    "subject": {
      "math": "#DB4125",
      "ela": "#ECA14D",
      "extra": "#F4F0D9",
      "science": "#B798E8",
      "socialStudies": "#633A9A",
      "sustainability": "#349964",
      "sel": "#0070DA"
    }
  },
  "typography": {
    "fontFamily": "\"Noto Sans\", \"Inter\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
    "scale": {
      "h1": "40px/44px",
      "h2": "32px/36px",
      "h3": "24px/28px",
      "body": "18px/28px"
    }
  },
  "spacing": {
    "xs": "4px",
    "sm": "8px",
    "md": "16px",
    "lg": "24px",
    "xl": "40px"
  },
  "radii": {
    "soft": "12px",
    "pill": "999px"
  }
}
```

### CSS Variable Seed
```css
:root {
  --color-brand-hydro-blue: #2c83c3;
  --color-brand-lightning-purple: #6c2d82;
  --color-brand-fuchsia: #ff3dac;
  --color-brand-atomic-blue: #6812d1;
  --color-brand-burst-purple: #cb1f83;
  --color-brand-galactic-black: #363636;
  --color-brand-sparkle-white: #f0f4ff;
  --color-brand-plus-blue: #1826bc;
  --color-brand-free-blue: #00aceb;
  --color-subject-math: #db4125;
  --color-subject-ela: #eca14d;
  --color-subject-extra: #f4f0d9;
  --color-subject-science: #b798e8;
  --color-subject-social-studies: #633a9a;
  --color-subject-sustainability: #349964;
  --color-subject-sel: #0070da;
  --font-family-base: "Noto Sans","Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  --radius-soft: 12px;
}
@media (prefers-color-scheme: dark) {
  :root {
    --surface-base: #0f111a;
    --text-primary: #f0f4ff;
  }
}
```

### Card Example (Job-Level)
```html
<article class="card card--job">
  <header>
    <span class="icon-stack">
      <i class="icon icon--category"></i>
      <i class="icon icon--job"></i>
    </span>
    <p class="eyebrow">Level 3 · 24k jobs</p>
    <h3>Data Scientist</h3>
  </header>
  <dl>
    <div><dt>Median wage</dt><dd>$103K</dd></div>
    <div><dt>Education</dt><dd>Master's</dd></div>
  </dl>
  <button class="cta">View details</button>
</article>
```

Use this appendix as the machine-readable hook for scripts that lint styles or auto-generate tokens. Keep it in sync whenever palette or spacing rules change.
