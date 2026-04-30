# Vidyadhar's App Store

A minimal personal web-based app store. One page, one grid, every app a click away.

## Run locally

The page fetches `apps.json` over HTTP, so opening `index.html` directly with `file://` won't work. Serve it from a tiny local server:

```sh
cd "Vidyadhar's App Store"
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Add or remove an app

Edit `apps.json` — that's the only file you need to touch.

```json
{
  "name": "App name",
  "url": "https://...",
  "description": "Optional one-liner",
  "tag": "productivity",
  "image": "assets/your-icon.svg"
}
```

Required: `name`, `url`. Everything else is optional. If `image` is missing or fails to load, the card falls back to `assets/placeholder.svg`. Tag chips appear automatically based on whatever tags are present in the file.

## Deploy to Vercel

Two paths — pick whichever fits your workflow.

### CLI

```sh
npm i -g vercel
cd "Vidyadhar's App Store"
vercel deploy
```

The first run will ask which scope to deploy under and create a new project. Subsequent deploys are a single command.

### Git import

1. Push the project to a GitHub/GitLab/Bitbucket repo.
2. In the Vercel dashboard, click **Add New → Project** and import the repo.
3. No framework preset, no build command, no install command — Vercel will serve `index.html` directly.

The included `vercel.json` sets `cleanUrls: true`, gives `/assets/*` a long immutable cache, and keeps `apps.json` on `no-cache` so edits show up the moment you redeploy.

## File structure

```
.
├── index.html          markup
├── styles.css          design tokens + components
├── app.js              fetch JSON, render grid, search/filter
├── apps.json           your apps
├── assets/
│   └── placeholder.svg fallback icon
├── vercel.json         hosting config
├── BUILD_PLAN.md       phase-by-phase build notes
└── docs/               original product brief + UI spec
```
