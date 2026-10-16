// Cordis plugins shared as GitHub releases (acryldev/acryl spec 044): a public repository with the topic `cordis-plugin` whose latest release
// has one `.tgz`. Its package.json is read from inside the tarball, never run; what it provides and consumes comes from the service contract
// ACRYL generates into it (`acryl.requires`, `acryl.provides`, `acryl.slots`). Nobody submits anything: the topic is the listing.
import { createHash } from 'node:crypto'
import { gunzipSync } from 'node:zlib'

const BLOCK = 512

/**
 * Services only ACRYL apps provide (as of acryldev/acryl at 2026-10-16). A plugin requiring one of them runs in ACRYL, not in stock DSH; any
 * other required service is one stock DSH also provides. A known list, not a proof: the authority is the app the plugin is loaded into.
 */
export const ACRYL_ONLY_SERVICES = new Set(['appInstance', 'pluginHub', 'acrylWeb', 'acrylTools', 'desktopProfiles', 'desktopPnpm', 'livePluginActivation', 'acrylFrameworkPackages', 'acrPluginLifecycle', 'acrylExtensions'])

function field(block, offset, length) {
  const slice = block.subarray(offset, offset + length)
  const end = slice.indexOf(0)
  return Buffer.from(end === -1 ? slice : slice.subarray(0, end)).toString('utf8')
}

/** The package.json inside an npm-style tarball, or null. */
export function packageJsonFromTarball(gzipped, maxBytes = 64 * 1024 * 1024) {
  const archive = gunzipSync(gzipped, { maxOutputLength: maxBytes })
  let offset = 0
  let longPath
  while (offset + BLOCK <= archive.length) {
    const block = archive.subarray(offset, offset + BLOCK)
    if (block.every(byte => byte === 0)) break
    const size = Number.parseInt(field(block, 124, 12).trim() || '0', 8)
    const type = String.fromCharCode(block[156] ?? 0)
    const content = archive.subarray(offset + BLOCK, offset + BLOCK + size)
    offset += BLOCK + Math.ceil(size / BLOCK) * BLOCK
    if (type === 'x') { longPath = /(?:^|\n)\d+ path=(.*)\n/u.exec(Buffer.from(content).toString('utf8'))?.[1]; continue }
    const prefix = field(block, 345, 155)
    const path = longPath ?? (prefix === '' ? field(block, 0, 100) : `${prefix}/${field(block, 0, 100)}`)
    longPath = undefined
    if ((type === '0' || type === '\0') && path.split('/').slice(1).join('/') === 'package.json') {
      try { return JSON.parse(Buffer.from(content).toString('utf8')) } catch { return null }
    }
  }
  return null
}

export const integrityOf = bytes => `sha512-${createHash('sha512').update(bytes).digest('base64')}`
export const slugify = value => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

const sides = lists => (lists !== null && typeof lists === 'object' && !Array.isArray(lists) ? [...new Set(Object.values(lists).flatMap(list => (Array.isArray(list) ? list.filter(name => typeof name === 'string') : [])))].sort() : [])

/** The registry's category from what the plugin does: a UI it fills, a service it adds, a tool, a provider. */
export function categoryOf(manifest) {
  const acryl = manifest.acryl ?? {}
  const keywords = Array.isArray(manifest.keywords) ? manifest.keywords : []
  if (sides({ x: acryl.slots?.fills }).length > 0 || sides({ x: acryl.slots?.offers }).length > 0) return 'ui-client'
  if (sides(acryl.requires).includes('tools')) return 'tools'
  if (keywords.some(word => ['provider', 'llm', 'llm-provider', 'model-provider'].includes(word))) return 'providers'
  if (sides(acryl.provides).length > 0) return 'services'
  return 'services'
}

/**
 * From the service contract: "ACRYL" when it needs an ACRYL-only service, "Both" when every service it needs stock DSH has too. Without a
 * contract nothing is known beyond what it was built for, stock DSH ("DSH stock"); it may well run in ACRYL, but the registry does not claim it.
 */
export function compatibilityOf(manifest) {
  const requires = manifest.acryl?.requires
  if (requires === null || typeof requires !== 'object') return 'DSH stock'
  return sides(requires).some(name => ACRYL_ONLY_SERVICES.has(name)) ? 'ACRYL' : 'Both'
}

/** A registry entry for a release, or null when the package is not labelled a Cordis plugin. */
export function pluginFromRelease({ manifest, repository, owner, release, asset, integrity }) {
  if (typeof manifest?.name !== 'string' || typeof manifest.version !== 'string') return null
  const keywords = Array.isArray(manifest.keywords) ? manifest.keywords : []
  if (!keywords.includes('cordis-plugin')) return null
  const acryl = manifest.acryl ?? {}
  const [, ownerName, repoName] = /github\.com\/([^/]+)\/([^/]+)/u.exec(repository) ?? []
  return {
    slug: slugify(manifest.name),
    name: manifest.name,
    summary: typeof manifest.description === 'string' ? manifest.description : '',
    category: categoryOf(manifest),
    compatibility: compatibilityOf(manifest),
    publisher: owner,
    repoUrl: repository,
    ...(keywords.includes('acryl-package') ? { acrylPackage: true } : {}),
    provides: sides(acryl.provides),
    consumes: sides(acryl.requires),
    ...(acryl.slots?.fills?.length || acryl.slots?.offers?.length ? { slots: { offers: acryl.slots.offers ?? [], fills: acryl.slots.fills ?? [] } } : {}),
    version: manifest.version,
    releaseTag: release.tag_name,
    published: typeof release.published_at === 'string' ? release.published_at.slice(0, 10) : null,
    tarball: asset.browser_download_url,
    integrity,
    install: `dsh plugin --profile desktop add ${asset.browser_download_url}`,
    ...(ownerName && repoName ? { acrylPull: `/plugin pull github:${ownerName}/${repoName}@${manifest.version}` } : {}),
  }
}
