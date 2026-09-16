# Cordis Plugins

The public registry for Cordis plugins — the smallest building block ("the
atom") every Cordis-based system, including ACRYL and ACRYL Blends, is
composed out of. A Cordis plugin is to a Blend what an npm package is to a
Docker image; this site is the npm-equivalent layer in that model.

See the sibling registry for complete compositions:
[acrylblends.github.io](https://acrylblends.github.io), and the design spec
this site implements:
[specs/036-cordis-ecosystem-and-acryl-blends](https://github.com/acryldev/acryl/tree/main/specs/036-cordis-ecosystem-and-acryl-blends)
in `acryldev/acryl`.

## Stack

Plain React + Vite + TypeScript + Tailwind CSS v4 + React Router, built as a
static site and deployed to GitHub Pages on every push to `main` via
`.github/workflows/deploy.yml`.

## Development

```sh
bun install
bun run dev
```

## Build

```sh
bun run build   # outputs dist/, with dist/404.html mirroring index.html
                # so client-side routes survive a hard reload on Pages
```
