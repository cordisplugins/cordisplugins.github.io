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

## How plugins get listed

No submission: a public GitHub repository with the topic `cordis-plugin` whose latest release has one `.tgz` is listed within the hour.
`scripts/sync-plugins.mjs` reads its `package.json` from inside the tarball (never runs it) and takes what it provides and consumes, and the
UI slots it fills, from the service contract ACRYL generates (`acryl.requires`, `acryl.provides`, `acryl.slots`; acryldev/acryl spec 044).
Compatibility is computed: "ACRYL" when it needs an ACRYL-only service, "Both" when its contract needs only services stock DSH also has,
"DSH stock" when it has no contract. Hand-written entries in `src/lib/registry-data.ts` win over a discovered one with the same name.

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
