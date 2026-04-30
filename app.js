/*
 * Vidyadhar's App Store — app.js
 *
 * Phase 6: data loading + grid rendering + live search + tag filter.
 * Search and active tag combine with AND logic. Tag chips are derived
 * dynamically from whatever tags appear in apps.json.
 */

const FALLBACK_IMAGE = "assets/placeholder.svg";

const state = {
  apps: [],     // full list from apps.json (post-validation)
  search: "",   // current search query
  tag: null,    // active tag, or null if none
};

const els = {
  grid: document.getElementById("app-grid"),
  emptyState: document.getElementById("empty-state"),
  search: document.getElementById("search"),
  tagFilter: document.getElementById("tag-filter"),
};

// ------------------------------------------------------------------
// Data loading
// ------------------------------------------------------------------

/**
 * Fetch and parse apps.json, then build the tag chips and render the grid.
 * On any failure, render a friendly error in the empty-state slot.
 */
async function loadApps() {
  try {
    const res = await fetch("apps.json", { cache: "no-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    if (!Array.isArray(data)) {
      throw new Error("apps.json must be an array");
    }

    // Drop entries missing the absolute essentials. A card without name or url
    // can't be rendered usefully and would just be visual noise.
    state.apps = data.filter((entry) => entry && entry.name && entry.url);

    renderTags();
    applyFilters();
  } catch (err) {
    showError(err.message);
  }
}

// ------------------------------------------------------------------
// Filtering
// ------------------------------------------------------------------

/**
 * Compute the filtered subset and re-render the grid.
 * Search + active tag combine with AND logic.
 */
function applyFilters() {
  const q = state.search.trim().toLowerCase();
  const filtered = state.apps.filter((app) => {
    if (state.tag && app.tag !== state.tag) return false;
    if (q) {
      const haystack = `${app.name} ${app.description || ""}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
  renderApps(filtered);
}

// ------------------------------------------------------------------
// Tag chips
// ------------------------------------------------------------------

/**
 * Build the tag chip row from the unique set of tags present in state.apps.
 * If no apps have tags, the row stays empty (no visual placeholder).
 */
function renderTags() {
  const tags = [
    ...new Set(state.apps.map((a) => a.tag).filter(Boolean)),
  ].sort();

  els.tagFilter.replaceChildren();
  if (!tags.length) return;

  for (const tag of tags) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "tag-chip";
    chip.dataset.tag = tag;
    chip.textContent = tag;
    chip.setAttribute("aria-pressed", String(state.tag === tag));
    chip.addEventListener("click", () => toggleTag(tag));
    els.tagFilter.appendChild(chip);
  }
}

/**
 * Toggle the active tag. Clicking the active tag clears the filter.
 */
function toggleTag(tag) {
  state.tag = state.tag === tag ? null : tag;

  // Sync aria-pressed on every chip without rebuilding the DOM (avoids flicker).
  for (const chip of els.tagFilter.querySelectorAll(".tag-chip")) {
    chip.setAttribute(
      "aria-pressed",
      String(chip.dataset.tag === state.tag),
    );
  }

  applyFilters();
}

// ------------------------------------------------------------------
// Rendering
// ------------------------------------------------------------------

/**
 * Render the given list of apps into #app-grid.
 * Pass the filtered subset from applyFilters().
 */
function renderApps(apps) {
  els.grid.replaceChildren();

  if (!apps.length) {
    els.emptyState.hidden = false;
    els.emptyState.textContent = state.apps.length
      ? "No apps match. Try clearing your search or filter."
      : "No apps yet. Add some entries to apps.json.";
    return;
  }

  els.emptyState.hidden = true;

  const fragment = document.createDocumentFragment();
  for (const app of apps) {
    fragment.appendChild(buildCard(app));
  }
  els.grid.appendChild(fragment);
}

/**
 * Build a single .app-card DOM node for one app entry.
 * Uses textContent (never innerHTML) so values from apps.json
 * can't inject markup or scripts.
 */
function buildCard(app) {
  const card = document.createElement("a");
  card.className = "app-card";
  card.href = app.url;
  card.target = "_blank";
  card.rel = "noopener noreferrer";

  // Icon — fall back to placeholder if no image or if the image fails to load.
  const iconWrap = document.createElement("span");
  iconWrap.className = "app-card__icon";

  const img = document.createElement("img");
  img.src = app.image || FALLBACK_IMAGE;
  img.alt = "";
  img.loading = "lazy";
  img.addEventListener("error", () => {
    if (img.src.endsWith(FALLBACK_IMAGE)) return; // already fell back
    img.src = FALLBACK_IMAGE;
  });
  iconWrap.appendChild(img);
  card.appendChild(iconWrap);

  const name = document.createElement("h2");
  name.className = "app-card__name";
  name.textContent = app.name;
  card.appendChild(name);

  if (app.description) {
    const desc = document.createElement("p");
    desc.className = "app-card__desc";
    desc.textContent = app.description;
    card.appendChild(desc);
  }

  return card;
}

function showError(message) {
  els.grid.replaceChildren();
  els.emptyState.hidden = false;
  els.emptyState.textContent =
    `Couldn't load apps (${message}). Try refreshing the page.`;
}

// ------------------------------------------------------------------
// Init
// ------------------------------------------------------------------
els.search.addEventListener("input", (event) => {
  state.search = event.target.value;
  applyFilters();
});

loadApps();
