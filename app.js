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

let searchAnalyticsTimer;

function track(eventName, properties = {}) {
  window.AppAnalytics?.capture(eventName, properties);
}

function appDestination(appUrl) {
  const url = new URL(appUrl, window.location.href);
  return {
    destination_type: url.origin === window.location.origin ? "internal" : "external",
    destination_origin: url.origin,
    destination_path: url.origin === window.location.origin ? url.pathname : undefined,
  };
}

function appCountByTag(tag) {
  return state.apps.filter((app) => !tag || app.tag === tag).length;
}

function getFilteredApps() {
  const q = state.search.trim().toLowerCase();
  return state.apps.filter((app) => {
    if (state.tag && app.tag !== state.tag) return false;
    if (q) {
      const haystack = `${app.name} ${app.description || ""}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

function trackSearchChanged(filteredCount) {
  clearTimeout(searchAnalyticsTimer);
  searchAnalyticsTimer = setTimeout(() => {
    const queryLength = state.search.trim().length;
    if (!queryLength) return;

    track("app_search_performed", {
      query_length: queryLength,
      active_tag: state.tag,
      result_count: filteredCount,
      total_app_count: state.apps.length,
    });
  }, 700);
}

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
    const filtered = applyFilters();
    track("apps_catalog_loaded", {
      app_count: state.apps.length,
      rendered_app_count: filtered.length,
      tag_count: new Set(state.apps.map((a) => a.tag).filter(Boolean)).size,
    });
  } catch (err) {
    showError(err.message);
    track("apps_catalog_load_failed", {
      error_message: err.message,
    });
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
  const filtered = getFilteredApps();
  renderApps(filtered);
  return filtered;
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
  const wasActive = state.tag === tag;
  state.tag = wasActive ? null : tag;

  // Sync aria-pressed on every chip without rebuilding the DOM (avoids flicker).
  for (const chip of els.tagFilter.querySelectorAll(".tag-chip")) {
    chip.setAttribute(
      "aria-pressed",
      String(chip.dataset.tag === state.tag),
    );
  }

  const filtered = applyFilters();
  track("app_tag_filter_toggled", {
    tag,
    action: wasActive ? "cleared" : "selected",
    result_count: filtered.length,
    tag_app_count: appCountByTag(tag),
    search_active: Boolean(state.search.trim()),
  });
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

  const cardUrl = new URL(app.url, window.location.href);
  if (cardUrl.origin !== window.location.origin) {
    card.target = "_blank";
    card.rel = "noopener noreferrer";
  }
  card.addEventListener("click", () => {
    track("app_opened", {
      app_name: app.name,
      app_tag: app.tag || null,
      search_active: Boolean(state.search.trim()),
      active_tag: state.tag,
      ...appDestination(app.url),
    });
  });

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
  const filtered = applyFilters();
  trackSearchChanged(filtered.length);
});

window.AppAnalytics?.page({ page_name: "App Store" });
track("app_store_viewed", {
  initial_search_active: Boolean(state.search.trim()),
});

loadApps();
