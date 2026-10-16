// Refresh src/data/discovered-plugins.json: every public repository with the topic `cordis-plugin` whose latest release carries one `.tgz`
// (acryldev/acryl spec 044). Runs in the Pages workflow on each push and every hour; the hand-written entries in src/lib/registry-data.ts stay
// as they are and win over a discovered entry with the same name.
import { writeFile } from 'node:fs/promises'
import { integrityOf, packageJsonFromTarball, pluginFromRelease } from './lib/discover.mjs'

const output = new URL('../src/data/discovered-plugins.json', import.meta.url)
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
for (const repository of repositories) {
  try {
    const release = await json(`https://api.github.com/repos/${repository.full_name}/releases/latest`)
    const tarballs = (release?.assets ?? []).filter(asset => asset.name.endsWith('.tgz'))
    if (tarballs.length !== 1) continue
    const response = await fetch(tarballs[0].browser_download_url, { headers: { 'User-Agent': headers['User-Agent'] }, signal: AbortSignal.timeout(20_000) })
    if (!response.ok) continue
    const bytes = new Uint8Array(await response.arrayBuffer())
    const manifest = packageJsonFromTarball(bytes)
    const plugin = manifest === null ? null : pluginFromRelease({ manifest, repository: repository.html_url, owner: repository.owner.login, release, asset: tarballs[0], integrity: integrityOf(bytes) })
    if (plugin !== null) plugins.push(plugin)
  } catch (cause) {
    console.warn(`skipped ${repository.full_name}: ${cause instanceof Error ? cause.message : String(cause)}`)
  }
}
plugins.sort((a, b) => a.name.localeCompare(b.name))
await writeFile(output, `${JSON.stringify({ generatedAt: new Date().toISOString(), topic: 'cordis-plugin', searched: repositories.length, plugins }, null, 2)}\n`)
console.log(`${plugins.length} released plugins among ${repositories.length} repositories with the topic cordis-plugin`)
