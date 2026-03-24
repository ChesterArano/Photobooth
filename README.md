# Photobooth

Vite + React photobooth app.

## Local dev

```bash
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy (GitHub Pages)

This repo includes a GitHub Actions workflow that builds on every push to `main` and deploys the static site to GitHub Pages.

1. Push this repo to GitHub.
2. In GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Push to `main` (or run the workflow manually).

The Vite `base` path is set automatically during the Pages build (so assets load correctly under `https://<user>.github.io/<repo>/`).
