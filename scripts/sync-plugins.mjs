// Refresh src/data/discovered-plugins.json: every public repository with the topic `cordis-plugin` whose latest release carries one `.tgz`
// (acryldev/acryl spec 044), each marked official or community by its owner (official-owners.json), minus blocklist.json. Runs in the Pages
// workflow on each push, by hand and every hour (the hour is how a community plugin released anywhere appears without anyone pushing here); the hand-written entries in src/lib/registry-data.ts stay
// as they are and win over a discovered entry with the same name.
import { readFile, writeFile } from 'node:fs/promises'
import { blockedReason, integrityOf, originOf, packageJsonFromTarball, pluginFromRelease, reservedNameReason } from './lib/discover.mjs'

const output = new URL('../src/data/discovered-plugins.json', import.meta.url)
const official = JSON.parse(await readFile(new URL('../official-owners.json', import.meta.url), 'utf8'))
const blocklist = JSON.parse(await readFile(new URL('../blocklist.json', import.meta.url), 'utf8'))
const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'cordisplugins-sync (+https://cordisplugins.github.io)', ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}) }

async function json(url) {
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(20_000) })
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`${url} answered ${response.status}`)
  return response.json()
}

const repositories = []
for (let page = 1; page <= 10; page += 1) {
  const result = await json(`https://api.github.com/search/repositories?q=${encodeURIComponent('topic:cordis-plugin is:public archived:false')}&per_page=100&page=${page}`)
  if (!Array.isArray(result?.items)) throw new Error('GitHub returned an invalid search result')
  repositories.push(...result.items)
  if (result.items.length < 100) break
}

const plugins = []
const skipped = []
// Anything that cannot be listed is left out with its reason in the log; the site never breaks because of one repository.
const skip = (repository, reason) => {
  skipped.push(repository.full_name)
  console.warn(`skipped ${repository.full_name}: ${reason}`)
}
for (const repository of repositories) {
  try {
    const blocked = blockedReason(repository.full_name, blocklist)
    if (blocked !== undefined) { skip(repository, blocked); continue }
    const origin = originOf(repository.owner.id, official)
    const release = await json(`https://api.github.com/repos/${repository.full_name}/releases/latest`)
    // A fork has no releases of its own until its owner makes one: a copy of someone's plugin is listed only once it is released on its own.
    if (release === null) { skip(repository, repository.fork ? 'a fork without its own release' : 'no release'); continue }
    const tarballs = (release.assets ?? []).filter(asset => asset.name.endsWith('.tgz'))
    if (tarballs.length !== 1) { skip(repository, `its latest release has ${tarballs.length} .tgz files, not one`); continue }
    const response = await fetch(tarballs[0].browser_download_url, { headers: { 'User-Agent': headers['User-Agent'] }, signal: AbortSignal.timeout(20_000) })
    if (!response.ok) { skip(repository, `its release file answered ${response.status}`); continue }
    const bytes = new Uint8Array(await response.arrayBuffer())
    const manifest = packageJsonFromTarball(bytes)
    if (manifest === null) { skip(repository, 'its release file has no readable package.json'); continue }
    const reserved = origin === 'community' ? reservedNameReason(manifest.name, official) : undefined
    if (reserved !== undefined) { skip(repository, `${reserved}, which only official repositories may use`); continue }
    const plugin = pluginFromRelease({ manifest, repository: repository.html_url, owner: repository.owner.login, origin, release, asset: tarballs[0], integrity: integrityOf(bytes) })
    if (plugin === null) { skip(repository, 'its package.json has no name and version, or no cordis-plugin keyword'); continue }
    plugins.push(plugin)
  } catch (cause) {
    skip(repository, cause instanceof Error ? cause.message : String(cause))
  }
}
plugins.sort((a, b) => a.name.localeCompare(b.name))
await writeFile(output, `${JSON.stringify({ generatedAt: new Date().toISOString(), topic: 'cordis-plugin', searched: repositories.length, plugins }, null, 2)}\n`)
console.log(`${plugins.length} released plugins among ${repositories.length} repositories with the topic cordis-plugin (${plugins.filter(p => p.origin === 'official').length} official, ${plugins.filter(p => p.origin === 'community').length} community, ${skipped.length} skipped)`)
