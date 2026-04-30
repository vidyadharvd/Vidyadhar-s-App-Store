# Vidyadhar's App Store — Build Plan

A 1-day MVP build plan derived from the Product Brief and UI Layout & Component Spec.

## Stack & deployment decisions

- **Stack:** Vanilla HTML, CSS, JavaScript. No build step, no framework. Single `index.html` + `apps.json` + one CSS file + one JS file.
- **Search & tags:** included in MVP.
- **Hosting:** Vercel (zero-config static deploy via Git or `vercel deploy`).
- **App data:** placeholder entries for now; swap in real apps later by editing `apps.json` only.

## Target file structure

```
Vidyadhar's App Store/
├── index.html          # markup + container shells
├── styles.css          # design tokens + layout + components
├── app.js              # fetch JSON, render grid, search/filter
├── apps.json           # data source (name, url, description, tag, image)
├── assets/             # icons / fallback images
│   └── placeholder.svg
├── docs/               # existing — Product Brief, UI Spec
└── README.md           # how to run, how to add an app
```

## Phase breakdown (1 day)

### Phase 1 — Scaffold & data shape (~30 min)

Create the file skeleton, define the `apps.json` schema, and seed it with 6–8 placeholder entries so the grid has something realistic to render against.

JSON entry shape:

```json
{
  "name": "App name",
  "url": "https://...",
  "description": "One-line description (optional)",
  "tag": "productivity",
  "image": "assets/placeholder.svg"
}
```

Acceptance: `apps.json` parses, has variety in tags so filter logic is exercisable.

### Phase 2 — Design tokens in CSS (~30 min)

Translate the spec's design tokens into CSS custom properties at `:root` so everything downstream references them. This is the single most leveraged step — get tokens right and the rest of the styling falls out.

Tokens to define: color palette (primary `#6EE7B7`, secondary `#93C5FD`, accent `#FDE68A`, background `#F9FAFB`, card backgrounds `#E0F2FE` / `#FEF3C7` / `#DCFCE7`, text primary `#111827`, text secondary `#6B7280`); spacing scale (4/8/16/24/32); radii (cards 16–20px, buttons 12–16px); shadow `0 4px 12px rgba(0,0,0,0.06)`; typography (Inter via Google Fonts, system sans-serif fallback).

Acceptance: a swatch test page (or just inline divs) renders each token correctly.

### Phase 3 — Layout & header (~30 min)

Single-page layout with a centered container capped at ~1000px, generous page padding (24–32px). Header has the title "Vidyadhar's App Store" left-aligned, optional subtitle, no nav. No auth controls.

Acceptance: header renders cleanly on mobile and desktop, title typography matches spec (20–24px, medium/semi-bold).

### Phase 4 — App grid & cards (~1.5 hr)

Build the responsive CSS Grid: `grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))` gives the 2–4 column behavior automatically. Grid gap 16–24px.

App card markup is a single `<a>` element wrapping the image, name, and optional description so the entire card is the click target and opens in a new tab (`target="_blank" rel="noopener noreferrer"`).

Card styling: rounded 16–20px corners, soft pastel backgrounds rotated across cards (cycle through the three card-bg tokens by index), 16–20px padding, light shadow, hover lifts shadow + scales 1.02 with a smooth transition.

Acceptance: render the 6–8 placeholder apps, verify the grid collapses to single column on narrow viewports, hover state feels right.

### Phase 5 — Data loading & rendering (~45 min)

`app.js` fetches `apps.json` on load, maps each entry to a card DOM node, and appends to the grid container. Handle the optional fields gracefully (no description → omit the line; no image → fallback SVG; no tag → don't render the chip).

Edge cases to handle: empty `apps.json` (show an empty state), failed fetch (show a friendly error), missing `url` (skip the entry or render disabled).

Acceptance: editing `apps.json` and reloading is the only step needed to add/remove an app.

### Phase 6 — Search & tag filter (~1 hr)

Search input above the grid: case-insensitive substring match against `name` + `description`. Tag pills below the search, derived dynamically from the tags present in `apps.json` (no hardcoded list). Clicking a tag filters; clicking again clears. Search and tag combine with AND logic.

Keep state in a tiny in-memory object; re-render the grid on each change. No URL state for MVP (skip query params).

Acceptance: typing filters live; tag chip toggles; clearing both restores the full grid; no flicker.

### Phase 7 — Polish (~45 min)

Smooth transitions on hover (transform + box-shadow, 150–200ms ease). Focus states for keyboard nav (visible outline on cards and search input). Mobile: tap targets ≥44px, single column, larger card padding. Add a subtle page-load fade-in.

Accessibility quick pass: semantic HTML (`<main>`, `<header>`, `<h1>`, `<a>` for cards), alt text on images, sufficient contrast (the pastels are light — verify text-on-card contrast hits WCAG AA, may need to keep text dark `#111827`).

Acceptance: keyboard-navigable end-to-end, screen reader announces card name + description.

### Phase 8 — Verify & deploy (~30 min)

Local verification checklist:
- Loads in Chrome, Safari, Firefox without console errors.
- Responsive: 360px, 768px, 1024px, 1440px viewports all look right.
- Search + tag filter behave correctly with empty results.
- All cards open in a new tab.
- Lighthouse: aim for 95+ on Performance, 100 on Accessibility.

Deploy to Vercel: `vercel deploy` from the project root, or push to GitHub and import the repo in the Vercel dashboard. Static, no framework preset needed — Vercel will serve `index.html` directly. Verify the production URL.

Acceptance: live URL works, `apps.json` is fetched correctly from the deployed domain.

## Stretch items (post-MVP)

Recently visited section (localStorage). Light/dark mode toggle. Keyboard shortcut (`/` to focus search, `Esc` to clear). URL state for shareable filtered views. Categories / sections instead of a flat grid. Favicon + OG image for the app store itself.

## Risks & open questions

- **Card background contrast:** the pastel card backgrounds are very light. Description text in `#6B7280` on `#FEF3C7` may be borderline for AA — verify with a contrast checker during Phase 7 and darken if needed.
- **App icons:** if real apps don't have hosted icons, plan for a uniform fallback (initials in a colored circle, or a single placeholder SVG) so the grid stays visually consistent.
- **JSON updates in production:** because `apps.json` is static, every change requires a redeploy. Acceptable for MVP but worth noting if the app list churns.

## Definition of done

The success metric from the brief is "access any app within 1–2 clicks." Concretely: open the URL → see all apps in a grid → click one → app opens in a new tab. Every other feature (search, tags, hover states) is in service of that flow staying fast and pleasant.
