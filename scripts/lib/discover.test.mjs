import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, test } from 'node:test'
import { blockedReason, categoryOf, classificationOf, compatibilityOf, nativeSizes, originOf, packageJsonFromTarball, pluginFromRelease, reservedNameReason, storePlacementOf } from './discover.mjs'

const made = []
afterEach(() => { for (const dir of made.splice(0)) rmSync(dir, { recursive: true, force: true }) })

const quickNotes = {
  name: 'acryl-quick-notes', version: '0.2.2', description: 'Quick Notes', keywords: ['acryl-package', 'cordis-plugin', 'dsh-plugin'],
  acryl: { requires: { host: ['connection', 'dshHomePath', 'webServer'], client: ['connection', 'slots'] }, provides: { host: [], client: [] }, slots: { offers: [], fills: ['conversation.session.header.actions'] } },
}
const release = { tag_name: 'v0.2.2', published_at: '2026-10-16T05:00:00Z' }
const asset = { name: 'acryl-quick-notes-0.2.2.tgz', browser_download_url: 'https://github.com/inboxxobni/acryl-quick-notes/releases/download/v0.2.2/acryl-quick-notes-0.2.2.tgz' }

test('reads package.json from inside a release tarball', () => {
  const dir = mkdtempSync(join(tmpdir(), 'cordis-registry-'))
  made.push(dir)
  mkdirSync(join(dir, 'package'))
  writeFileSync(join(dir, 'package', 'package.json'), JSON.stringify(quickNotes))
  execFileSync('tar', ['-czf', join(dir, 'p.tgz'), '-C', dir, 'package'])
  assert.deepEqual(packageJsonFromTarball(readFileSync(join(dir, 'p.tgz'))), quickNotes)
})

test('a release becomes an entry: provides and consumes from the contract, its slots, version, install lines for DSH and ACRYL', () => {
  const entry = pluginFromRelease({ manifest: quickNotes, repository: 'https://github.com/inboxxobni/acryl-quick-notes', owner: 'inboxxobni', release, asset, integrity: 'sha512-x' })
  assert.deepEqual(entry, {
    slug: 'acryl-quick-notes', name: 'acryl-quick-notes', summary: 'Quick Notes', category: 'ui-client', compatibility: 'Both', publisher: 'inboxxobni', origin: 'community',
    repoUrl: 'https://github.com/inboxxobni/acryl-quick-notes', acrylPackage: true, provides: [], consumes: ['connection', 'dshHomePath', 'slots', 'webServer'],
    slots: { offers: [], fills: ['conversation.session.header.actions'] }, version: '0.2.2', releaseTag: 'v0.2.2', published: '2026-10-16',
    tarball: asset.browser_download_url, integrity: 'sha512-x', install: `dsh plugin --profile desktop add ${asset.browser_download_url}`,
    acrylPull: '/plugin pull github:inboxxobni/acryl-quick-notes@0.2.2',
  })
})

test('category and compatibility are computed, and a package without the cordis-plugin label is not listed', () => {
  assert.equal(categoryOf({ acryl: { requires: { host: ['tools'] } } }), 'tools')
  assert.equal(categoryOf({ acryl: { provides: { host: ['notesStore'] } } }), 'services')
  assert.equal(compatibilityOf({ acryl: { requires: { host: ['appInstance'] } } }), 'ACRYL')
  assert.equal(compatibilityOf({ acryl: { requires: { host: ['connection'] } } }), 'Both')
  assert.equal(compatibilityOf({}), 'DSH stock')
  assert.equal(pluginFromRelease({ manifest: { ...quickNotes, keywords: ['dsh-plugin'] }, repository: 'r', owner: 'o', release, asset, integrity: 'x' }), null)
})

test('a plugin that brings a native package lists only its sizes per OS and CPU', () => {
  const manifest = { ...quickNotes, acrylblends: { native: [
    { package: '@x/engine-darwin-arm64', version: '1.0.0', os: 'darwin', cpu: 'arm64', integrity: 'sha512-a', size: 153160461 },
    { package: '@x/engine-wasm', version: '1.0.0', os: 'linux', integrity: 'sha512-b', size: 152357942 },
    { os: 'win32', size: -1 },
  ] } }
  assert.deepEqual(nativeSizes(manifest), [{ os: 'darwin', cpu: 'arm64', size: 153160461 }, { os: 'linux', size: 152357942 }])
  assert.deepEqual(pluginFromRelease({ manifest, repository: 'https://github.com/o/r', owner: 'o', release, asset, integrity: 'x' }).native, nativeSizes(manifest))
  assert.equal(pluginFromRelease({ manifest: quickNotes, repository: 'https://github.com/o/r', owner: 'o', release, asset, integrity: 'x' }).native, undefined)
})

const pomodoro = {
  name: 'acrylblends-pomodoro', version: '0.1.0', description: 'A timer', keywords: ['cordis', 'cordis-plugin', 'acrylblends'],
  acryl: { schemaVersion: 1, requires: { host: ['router', 'routerHttp'] }, provides: { host: ['timer'] }, slots: { offers: [], fills: [] } },
}
const pomodoroAsset = { name: 'acrylblends-pomodoro-0.1.0.tgz', browser_download_url: 'https://github.com/inboxxobni/acrylblends-pomodoro/releases/download/v0.1.0/acrylblends-pomodoro-0.1.0.tgz' }

test('a plugin made in an acrylblends app says so, whatever it requires, and installs with the app\'s own pull', () => {
  assert.equal(compatibilityOf(pomodoro), 'ACRYL Blends')
  assert.equal(compatibilityOf({ keywords: ['acrylblends'] }), 'ACRYL Blends')
  assert.equal(compatibilityOf({ ...pomodoro, acryl: { requires: { host: ['appInstance'] } } }), 'ACRYL Blends')
  const entry = pluginFromRelease({ manifest: pomodoro, repository: 'https://github.com/inboxxobni/acrylblends-pomodoro', owner: 'inboxxobni', release: { tag_name: 'v0.1.0', published_at: '2026-11-07T05:00:00Z' }, asset: pomodoroAsset, integrity: 'sha512-x' })
  assert.deepEqual(
    [entry.compatibility, entry.consumes, entry.provides, entry.install, entry.acrylPull],
    ['ACRYL Blends', ['router', 'routerHttp'], ['timer'], 'npm run acryl -- plugin pull github:inboxxobni/acrylblends-pomodoro@0.1.0', undefined],
  )
})

test('a plugin without the acrylblends keyword keeps its tier and its DSH and ACRYL lines', () => {
  assert.equal(compatibilityOf({ keywords: ['cordis-plugin'], acryl: { requires: { host: ['connection'] } } }), 'Both')
  assert.equal(compatibilityOf({ keywords: 'acrylblends' }), 'DSH stock')
})

const official = JSON.parse(readFileSync(new URL('../../official-owners.json', import.meta.url), 'utf8'))

test('origin comes from the owner id, never the login an author could take over', () => {
  assert.equal(originOf(329572928, official), 'official')
  assert.equal(originOf(1, official), 'community')
  assert.equal(originOf(undefined, official), 'community')
})

test('a community name may not use an official scope or prefix', () => {
  assert.match(reservedNameReason('@acrylblends/notes', official), /official scope @acrylblends/)
  assert.match(reservedNameReason('@ACRYL/x', official), /official scope @acryl$/)
  assert.match(reservedNameReason('cordisplugins-notes', official), /official prefix cordisplugins-/)
  assert.equal(reservedNameReason('@acrylish/notes', official), undefined)
  assert.equal(reservedNameReason('my-acrylblends-notes', official), undefined)
})

test('the blocklist matches an owner or one repository, ignoring case', () => {
  const blocklist = { owners: ['Bad'], repositories: ['someone/Evil-Plugin'] }
  assert.match(blockedReason('bad/anything', blocklist), /owner bad/)
  assert.match(blockedReason('Someone/evil-plugin', blocklist), /blocklist/)
  assert.equal(blockedReason('someone/good', blocklist), undefined)
})

test('a plugin is placed in the Blends store categories by its package.json keywords', () => {
  const categories = [{ slug: 'business', name: 'Business', subs: [{ slug: 'finance', name: 'Finance' }] }]
  assert.deepEqual(storePlacementOf(['cordis-plugin', 'acrylblends-category-business', 'acrylblends-subcategory-finance'], categories), { category: 'Business', categorySlug: 'business', subcategory: 'Finance', subcategorySlug: 'finance' })
  assert.deepEqual(storePlacementOf(['acrylblends-category-business', 'acrylblends-subcategory-games'], categories), { category: 'Business', categorySlug: 'business' })
  assert.equal(storePlacementOf(['acrylblends-category-cooking'], categories), undefined)
  assert.equal(storePlacementOf(['cordis-plugin'], categories), undefined)
  const entry = pluginFromRelease({ manifest: { name: 'p', version: '1.0.0', keywords: ['cordis-plugin', 'acrylblends-category-business'] }, repository: 'https://github.com/o/p', owner: 'o', release: { tag_name: 'v1.0.0' }, asset: { browser_download_url: 'https://x/p.tgz' }, integrity: 'x', categories })
  assert.deepEqual(entry.placement, { category: 'Business', categorySlug: 'business' })
})

test('a plugin declares its catalog kind, domain and component by package.json keywords', () => {
  assert.deepEqual(classificationOf(['cordis-plugin']), {})
  assert.deepEqual(classificationOf(['cordis-kind-models', 'cordis-domain-05-01', 'cordis-component-05-01-01']), { kind: 'models', domain: '05-01', component: '05-01-01' })
  assert.deepEqual(classificationOf(['cordis-kind-tools', 'cordis-domain-05-04']), { kind: 'tools', domain: '05-04' })
  const entry = pluginFromRelease({
    manifest: { name: 'p', version: '1.0.0', keywords: ['cordis-plugin', 'cordis-kind-models', 'cordis-domain-05-01', 'cordis-component-05-01-01'] },
    repository: 'https://github.com/o/p', owner: 'o', release: { tag_name: 'v1.0.0' }, asset: { browser_download_url: 'https://x/p.tgz' }, integrity: 'x',
  })
  assert.equal(entry.kind, 'models')
  assert.equal(entry.domain, '05-01')
  assert.equal(entry.component, '05-01-01')
  assert.deepEqual(classificationOf(['cordis-kind-themes', 'acrylblends-category-business']), { kind: 'themes' })
})
