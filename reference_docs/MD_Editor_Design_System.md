# MD Editor — Design System

> **Purpose of this file.** A single source of truth for any human or AI agent building the MD Editor UI. It defines design principles, tokens, component specs, and — most importantly — the rules for **hover affordances and state visibility**, which is where this app's UI is most likely to break.
>
> **Lineage.** Interaction patterns are inspired by **Notion** (warm-minimal surfaces, hover-revealed block controls, progressive disclosure). The token architecture and theming model follow **GitHub Primer** (base → functional → component tiers; `fgColor`/`bgColor`/`borderColor` semantics). Hover/focus behavior follows **WCAG 2.1 SC 1.4.13** (dismissible, hoverable, persistent).
>
> **How agents should use this.** Never hardcode raw hex/px values in components. Always reference the CSS variables in §3. If a needed value is missing, add a token here first, then use it.

---

## 1. Design Principles

1. **Reading first, chrome last.** The reader canvas is the product. All controls (copy, comment, save badges, TOC) are secondary and must never compete with the text. Borrow Notion's discipline: a clean, open surface with controls hidden until the user needs them.
2. **Progressive disclosure over density.** Block-level actions (copy, comment) appear on hover/focus, not permanently. The exception: state that carries meaning (a dirty dot, an existing comment indicator) is always visible.
3. **Every hover affordance is also a focus affordance.** Anything reachable by mouse hover must be reachable and operable by keyboard. No mouse-only controls.
4. **State is legible, not loud.** Save status, dirty files, and active sections are communicated with the quietest signal that still reads clearly — a colored dot, a muted badge, a subtle background — never with heavy color or motion.
5. **One token system, two themes.** Light and dark are the same functional tokens resolving to inverted neutral scales. Components reference functional tokens only; they never branch on theme.

---

## 2. Token Architecture

Three tiers, following Primer. Components consume **only functional and component tokens** — never base.

```
base/*        →  raw constant values (gray.0 … gray.12, blue.5, etc.). Never used directly.
functional/*  →  semantic, theme-aware (fgColor-default, bgColor-muted, borderColor-default).
component/*   →  scoped to one component when functional tokens aren't specific enough
                 (e.g. commentCard-bgColor, dirtyDot-bgColor).
```

Naming convention (CSS): `--{property}-{role?}-{variant}`
- `property`: `fgColor` | `bgColor` | `borderColor` | `shadow`
- `variant`: `default` (primary), `muted` (secondary), `emphasis` (stronger), `disabled`
- role (optional): `accent` | `success` | `danger` | `attention`

---

## 3. Design Tokens (CSS variables)

Drop these into `:root` and `[data-theme="dark"]`. These are the only color/space/type values components may reference.

### 3.1 Color — Light theme (`:root`)

```css
:root {
  /* Foreground (text & icons) */
  --fgColor-default: #1f2328;   /* primary text */
  --fgColor-muted:   #59636e;   /* secondary text, metadata, inactive icons */
  --fgColor-subtle:  #818b98;   /* placeholder, faint hints */
  --fgColor-onEmphasis: #ffffff;/* text on accent/danger emphasis fills */
  --fgColor-accent:  #0969da;   /* links, active section in TOC */
  --fgColor-success: #1a7f37;   /* "Saved to disk" */
  --fgColor-attention: #9a6700; /* "Saving draft..." / unsaved */
  --fgColor-danger:  #cf222e;   /* destructive (delete comment) */

  /* Background (surfaces & fills) */
  --bgColor-default: #ffffff;   /* reader canvas, doc viewer */
  --bgColor-muted:   #f6f8fa;   /* sidebar, TOC panel */
  --bgColor-inset:   #f6f8fa;   /* code blocks, inputs */
  --bgColor-hover:   #eaeef2;   /* row / block hover */
  --bgColor-active:  #dde3ea;   /* selected file row */
  --bgColor-accent-muted: #ddf4ff; /* highlighted active TOC item bg */
  --bgColor-accent-emphasis: #0969da;
  --bgColor-danger-emphasis: #cf222e;
  --bgColor-overlay: #ffffff;   /* floating comment card, toolbar, menus */

  /* Border & dividers */
  --borderColor-default: #d1d9e0;
  --borderColor-muted:   #d1d9e0b3; /* ~70% — subtle dividers */
  --borderColor-accent:  #0969da;
  --borderColor-focus:   #0969da;

  /* Shadows / elevation */
  --shadow-resting: 0 1px 0 rgba(31,35,40,0.04);
  --shadow-floating: 0 8px 24px rgba(31,35,40,0.12); /* comment card, toolbar */
  --shadow-overlay:  0 1px 3px rgba(31,35,40,0.12), 0 8px 24px rgba(31,35,40,0.12);

  /* Component-scoped */
  --dirtyDot-bgColor: var(--fgColor-attention);
  --selection-bgColor: #b6e3ff;
}
```

### 3.2 Color — Dark theme (`[data-theme="dark"]`)

```css
[data-theme="dark"] {
  --fgColor-default: #f0f6fc;
  --fgColor-muted:   #9198a1;
  --fgColor-subtle:  #6e7681;
  --fgColor-onEmphasis: #ffffff;
  --fgColor-accent:  #4493f8;
  --fgColor-success: #3fb950;
  --fgColor-attention: #d29922;
  --fgColor-danger:  #f85149;

  --bgColor-default: #0d1117;
  --bgColor-muted:   #151b23;
  --bgColor-inset:   #010409;
  --bgColor-hover:   #1f262e;
  --bgColor-active:  #272e37;
  --bgColor-accent-muted: #388bfd1a;
  --bgColor-accent-emphasis: #1f6feb;
  --bgColor-danger-emphasis: #da3633;
  --bgColor-overlay: #151b23;

  --borderColor-default: #3d444d;
  --borderColor-muted:   #3d444db3;
  --borderColor-accent:  #4493f8;
  --borderColor-focus:   #4493f8;

  --shadow-resting: 0 0 0 1px #3d444d;
  --shadow-floating: 0 8px 24px rgba(1,4,9,0.5);
  --shadow-overlay:  0 8px 24px rgba(1,4,9,0.5);

  --dirtyDot-bgColor: var(--fgColor-attention);
  --selection-bgColor: #1f6feb66;
}
```

### 3.3 Spacing scale

A 4px-based scale (Primer functional sizing). Use these for all gap/padding/margin.

```css
:root {
  --space-3xs: 2px;
  --space-2xs: 4px;
  --space-xs:  8px;
  --space-sm:  12px;
  --space-md:  16px;
  --space-lg:  24px;
  --space-xl:  32px;
  --space-2xl: 48px;
}
```

### 3.4 Typography

```css
:root {
  /* Reader uses a comfortable reading face; UI chrome uses the system stack. */
  --font-ui: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif;
  --font-reader: ui-serif, Georgia, Cambria, "Times New Roman", serif; /* swap to sans if preferred */
  --font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;

  /* Reader type scale (the canvas) */
  --reader-fontSize-body: 1rem;     /* base; zoom multiplies this, 80%–200% */
  --reader-lineHeight-body: 1.6;
  --reader-h1: 2rem;
  --reader-h2: 1.5rem;
  --reader-h3: 1.25rem;
  --reader-h4: 1rem;
  --reader-maxWidth: 720px;         /* optimal reading measure */

  /* UI type scale (chrome) */
  --ui-fontSize-sm: 12px;           /* badges, metadata, TOC leaves */
  --ui-fontSize-md: 13px;           /* sidebar items, buttons */
  --ui-fontSize-lg: 14px;           /* doc title */
  --ui-fontWeight-normal: 400;
  --ui-fontWeight-medium: 500;
  --ui-fontWeight-semibold: 600;
}
```

> **Zoom:** the 80%–200% control scales `--reader-fontSize-body` only (e.g. via a multiplier on the `#reader` font-size). It must NOT scale UI chrome — the sidebar, badges, and toolbar stay fixed.

### 3.5 Radius, borders, motion, z-index

```css
:root {
  --radius-sm: 4px;   /* buttons, inputs, badges, file rows */
  --radius-md: 6px;   /* cards, code blocks */
  --radius-lg: 12px;  /* floating comment card, toolbar */

  --borderWidth-thin: 1px;
  --focus-outlineWidth: 2px;
  --focus-outlineOffset: 2px;

  /* Motion — keep subtle. Reveal fast, settle gently. */
  --motion-fast: 80ms;    /* hover fades on block controls */
  --motion-base: 150ms;   /* card/toolbar appear, theme switch */
  --easing-standard: cubic-bezier(0.2, 0, 0.2, 1);

  /* Stacking order */
  --z-sidebar: 10;
  --z-docHeader: 20;
  --z-commentCard: 100;
  --z-highlightToolbar: 110;  /* above comment card */
  --z-menu: 120;
}
```

> **Reduced motion:** wrap all transitions in `@media (prefers-reduced-motion: no-preference)`. Under reduced-motion, controls appear/disappear instantly with no transform.

---

## 4. State & Status Vocabulary

A fixed mapping so save/dirty states are consistent everywhere.

| State | Where | Token | Visual |
| :-- | :-- | :-- | :-- |
| Clean / saved | Doc header badge | `--fgColor-success` | "Saved to disk", subtle, no fill |
| Saving draft | Doc header badge | `--fgColor-attention` | "Saving draft…" |
| Draft autosaved (unsaved to disk) | Doc header badge | `--fgColor-attention` | "Draft autosaved" |
| Dirty file | Sidebar row | `--dirtyDot-bgColor` | 6px dot before/after filename |
| Active file | Sidebar row | `--bgColor-active` + `--fgColor-default` | filled row |
| Active TOC section | TOC item | `--fgColor-accent` + `--bgColor-accent-muted` | colored text + tinted bg |
| Has comment | Block comment button | `--fgColor-accent` | button stays visible + tinted |

---

## 5. Component Specs

Each maps to a component named in the app reference. Specs list resting / hover / focus / active states.

### 5.1 Sidebar
- **Surface:** `--bgColor-muted`, right border `--borderColor-default`. Resizable 180–450px.
- **Brand row:** title in `--ui-fontWeight-semibold`; theme toggle (`◐`) and zoom (`A−`/`100%`/`A+`) as icon buttons (see 5.7).
- **Open buttons:** "Open folder", "Open files…", and conditionally "Restore Folder Access" — use the secondary button style.
- **Search input:** full-width, `--bgColor-default`, `--radius-sm`, `1px --borderColor-default`. Focus → `--borderColor-focus` + focus ring.

### 5.2 File list item
- **Resting:** `--fgColor-muted`, transparent bg, padding `--space-xs --space-sm`, `--radius-sm`.
- **Hover:** bg `--bgColor-hover`.
- **Active (open file):** bg `--bgColor-active`, text `--fgColor-default`, weight `medium`.
- **Dirty dot:** 6px circle, `--dirtyDot-bgColor`, `--space-xs` gap from the name. **Always visible when dirty** — this is meaningful state, never hover-gated.
- **Keyboard:** `j`/`k` move selection; selected row must show the same visual as hover/active and scroll into view.

### 5.3 Doc header
- Sticky top, `--bgColor-default`, bottom border `--borderColor-muted`, `--z-docHeader`.
- **Left:** doc name (`--ui-fontSize-lg`, `semibold`) + save status badge (5.4).
- **Right:** "Save" (primary button) + "Save As…" (secondary button).

### 5.4 Save status badge
- Pill, `--ui-fontSize-sm`, no fill, colored text per §4. `--radius-sm`.
- Transition text/color over `--motion-base`. Never flash or animate aggressively.

### 5.5 Reader canvas (`#reader`)
- `contentEditable="true"`, `--bgColor-default`, `--font-reader`, max-width `--reader-maxWidth` centered, generous vertical rhythm.
- **Selection:** `::selection { background: var(--selection-bgColor); }`.
- **Editing affordance:** caret only — no border or box around the canvas. The page should not "look like a form".
- Headings, code (`--bgColor-inset`, `--font-mono`, `--radius-md`), blockquotes (left border `--borderColor-default`, `--fgColor-muted`), tables (borders `--borderColor-muted`) all use tokens above.

### 5.6 Block controls (copy + comment) — **critical**
Quick-copy and comment buttons attached to each block (paragraph, heading, table, code, list item).

- **Resting:** opacity 0, `pointer-events: none`. Positioned in the left or right gutter so they never reflow text.
- **On block hover OR block focus-within:** fade to opacity 1 over `--motion-fast`, `pointer-events: auto`.
- **Comment button when a comment exists:** **always** opacity 1 and tinted `--fgColor-accent` (meaningful state overrides hover-gating).
- **Icon buttons:** 28×28 hit area minimum (see 5.7), `--fgColor-muted` resting → `--fgColor-default` on hover, bg `--bgColor-hover` on hover.
- **Keyboard:** each block control is a real `<button>` in tab order; focusing it reveals it (focus-within rule above). Provide `aria-label` ("Copy block", "Comment on block").

### 5.7 Icon button (shared)
- Min hit target **28×28px** on desktop, **44×44px** on touch. Maintain ≥8px between adjacent targets.
- Resting `--fgColor-muted`; hover bg `--bgColor-hover` + `--fgColor-default`; focus-visible → 2px `--borderColor-focus` ring at `--focus-outlineOffset`.

### 5.8 Floating comment card (typed comments)
- `--bgColor-overlay`, `--radius-lg`, `--shadow-floating`, `--z-commentCard`. Anchored to the right margin of the active block.
- **List editor.** A block can hold multiple comments; the card lists each as a row: anchor label (the quoted source text, italic `--fgColor-muted`), a **type selector**, a body textarea (`--bgColor-inset`, `--radius-sm`), read-only agent replies, and a **Delete** (danger) action. A header **"+ Add a note"** appends a block-level comment.
- **Comment types (intent for the downstream AI agent).** Each comment carries a `type`, set live via a 3-button selector `[? Ask] [↳ Reply] [✎ Edit]` (active = `--bgColor-accent-muted` + `--fgColor-accent`). Default **Ask** — the only non-destructive option.
  - `ask` — agent answers in chat only; no file change.
  - `reply` — agent appends a nested reply block; replies render read-only, indented under the comment with author + timestamp.
  - `edit` — agent edits the doc, then flips the comment to `resolved`.
  - `resolved` — dimmed and hidden behind a **"Show resolved (n)"** header toggle; choosing a live type reopens it.
- **Anchoring.** Comments relocate by `anchor` (a substring of the source text), not by position; a comment whose anchor no longer matches surfaces in the orphaned-comments panel (top of `#preview-container`, `--fgColor-attention` accent) and is preserved on save.
- **Live autosave — no Save button.** Type changes and every keystroke write to the block's draft immediately. The card is purely for editing; closing never loses or commits anything beyond what's already persisted. Delete (per row) removes that comment.
- **Lifecycle / lock states — see §6. This is the most failure-prone component.**
- **Dismiss (not save):** `Ctrl/Cmd + Enter` closes the card; `Esc` closes it and restores focus to the originating block's comment button. Both are dismiss-only.
- **Serialization & agent contract.** Comments persist as `<!-- comment id type author anchor ts -->…<!-- /comment -->` blocks (replies nested, `resolved` adds `resolved-by`/`resolved-ts`). A single `<!-- AGENT-CONTRACT … -->` block is prepended to any file containing comments, declaring the per-type rules so an agent reading the file behaves deterministically.

### 5.9 Highlight toolbar (`#highlight-toolbar`)
- Appears on text selection inside `#reader`. `--bgColor-overlay`, `--radius-lg`, `--shadow-floating`, `--z-highlightToolbar` (above the comment card).
- Positioned above the selection via `range.getBoundingClientRect()`; flip below if it would clip the viewport top.
- Three actions: **Copy selection**, **Search selection** (opens `https://www.google.com/search?q=…` in a new tab), and **Comment on selection** (opens the comment card with a new comment anchored to the full selected text).
- Dismiss on selection collapse, scroll, or `Esc`.

### 5.10 Table of Contents (right panel)
- `--bgColor-muted`, left border `--borderColor-muted`. Collapsible tree from `#`–`####`.
- **Active section:** `--fgColor-accent` text + `--bgColor-accent-muted` bg, updated live via `IntersectionObserver`. Smooth-scroll on click.
- Expand-all / collapse-all icon buttons at top. Each node is keyboard-focusable; chevrons toggle on `Enter`/`Space`.

---

## 6. Hover Affordance & State-Visibility Rules — **READ BEFORE BUILDING**

This app reveals a lot on hover (block controls, comment cards). That density is exactly where it gets cluttered or broken. These rules are non-negotiable and follow **WCAG 2.1 SC 1.4.13 (Content on Hover or Focus)**.

**The three guarantees.** Any content revealed on hover/focus must be:
1. **Dismissible** — closable via `Esc` without moving the pointer or focus.
2. **Hoverable** — the user can move the pointer *onto* the revealed content (e.g. from the block into the comment card) **without it disappearing**.
3. **Persistent** — it stays until the user dismisses it or moves pointer/focus away — it does not auto-hide on a timer.

**The comment-card lock model (the hard part).** The card spans a gap between the block and the floating card, so naive `mouseleave` will close it mid-traverse. Track three independent boolean locks and hide the card **only when all three are false**:

```
activeBlockHovered   // pointer is over the source block
commentBoxHovered    // pointer is over the floating card itself (satisfies "hoverable")
commentBoxFocused    // focus is inside the card's textarea/buttons (satisfies keyboard use)

hideCard = !(activeBlockHovered || commentBoxHovered || commentBoxFocused)
```

- Add a small **hover bridge** (an invisible padding zone, ~8–12px) between block and card so the pointer never crosses dead space that would drop all locks.
- A block that **has a saved comment** keeps its comment button visible and tinted at all times — it is state, not an affordance, so it is never hover-gated.

**Focus parity.** Everything revealed on hover must also reveal on keyboard focus. Use `:focus-within` on the block to mirror the `:hover` reveal. Block controls are real `<button>`s in the tab order.

**Focus visibility.** Use `:focus-visible` for keyboard rings (`2px --borderColor-focus`, `--focus-outlineOffset`) so mouse clicks don't show rings but keyboard users always do. Never remove outlines without a replacement. Focus indicator contrast ≥ 3:1 against adjacent colors.

**Don't over-hide.** Per Nielsen Norman's progressive-disclosure guidance: hide *secondary* actions, keep *frequent/meaningful* ones visible. Save status, dirty dots, comment-exists indicators, and the active-section highlight are always on. Copy/comment buttons and the highlight toolbar are the only hover-gated elements.

**No title-attribute-only tooltips.** They're unreachable by touch and keyboard. If a control needs a label, use a real tooltip component or visible `aria-label`.

---

## 7. Accessibility Checklist (per component)

- [ ] All interactive elements are native `<button>`/`<a>`/`<input>` or have `role` + `tabindex="0"`.
- [ ] Tab order is logical: sidebar → search → file list → doc header → reader → TOC.
- [ ] Focus never gets trapped (except modal comment card, which traps + restores focus to the originating button on close).
- [ ] Hover-revealed content is dismissible / hoverable / persistent (§6).
- [ ] Text contrast ≥ 4.5:1; UI/icon/focus contrast ≥ 3:1. (Tokens above are tuned for this.)
- [ ] Touch targets ≥ 44×44px; desktop icon targets ≥ 28×28px; ≥ 8px between targets.
- [ ] All keyboard shortcuts use a modifier (the unmodified `j`/`k`/`/` only fire when the reader/sidebar isn't in a text field).
- [ ] `prefers-reduced-motion` disables transforms and fades.
- [ ] Live region announces save-status changes for screen readers (`aria-live="polite"`).

---

## 8. Implementation Notes for AI Agents

- **Token discipline:** never write a raw hex or px in a component. Reference §3 variables. Need a new value? Add a token first.
- **Theming:** toggle `[data-theme="dark"]` on `<html>`; persist to `localStorage`. Do not branch component logic on theme — the functional tokens already resolve.
- **Zoom:** multiply `--reader-fontSize-body` only; clamp 0.8–2.0; persist to `localStorage`.
- **Reveal pattern (reference CSS):**

```css
.block .block-controls { opacity: 0; pointer-events: none;
  transition: opacity var(--motion-fast) var(--easing-standard); }
.block:hover .block-controls,
.block:focus-within .block-controls { opacity: 1; pointer-events: auto; }
.block[data-block-comment] .comment-btn { opacity: 1; color: var(--fgColor-accent); }

@media (prefers-reduced-motion: reduce) {
  .block .block-controls { transition: none; }
}
```

- **Comment card:** implement the three-lock model from §6 verbatim; debounce the hide check on a microtask so transient pointer gaps between block and card don't close it.
- **Highlight toolbar:** recompute position on `selectionchange` + `scroll`; hide on collapsed selection.
- **Do not** introduce new colors, fonts, radii, or shadows outside this file. Propose additions as new tokens here instead.

---

*Inspiration credits: token tiering & color semantics adapted from GitHub Primer; interaction feel (hover-revealed controls, progressive disclosure, warm-minimal surfaces) inspired by Notion; hover/focus behavior per WCAG 2.1 SC 1.4.13 and Nielsen Norman Group progressive-disclosure guidance. This is an independent system for the MD Editor, not affiliated with or endorsed by GitHub or Notion. Color values are tuned for WCAG AA contrast but should be re-verified if changed.*
