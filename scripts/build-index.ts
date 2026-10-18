import { mkdirSync, writeFileSync } from "node:fs";
import { plugins } from "../src/lib/registry-data.ts";

const entries = plugins
  .filter((p) => !p.private)
  .map((p) => ({
    id: p.slug,
    name: p.name,
    description: p.summary,
    category: p.category,
    compatibility: p.compatibility,
    publisher: p.publisher,
    repo: p.repoUrl,
    page: `https://cordisplugins.github.io/plugins/p/${p.slug}`,
    acrylPackage: p.acrylPackage === true,
    provides: p.provides,
    consumes: p.consumes,
    ...(p.version ? { version: p.version, releaseTag: p.releaseTag, published: p.published, tarball: p.tarball, integrity: p.integrity, install: p.install, acrylPull: p.acrylPull } : {}),
  }))
  .sort((a, b) => a.id.localeCompare(b.id));

mkdirSync("public/registry", { recursive: true });
writeFileSync("public/registry/index.json", JSON.stringify({ formatVersion: 1, entries }, null, 2) + "\n");
console.log(`registry/index.json: ${entries.length} plugins`);
