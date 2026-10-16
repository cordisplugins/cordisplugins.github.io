import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, test } from 'node:test'
import { categoryOf, compatibilityOf, packageJsonFromTarball, pluginFromRelease } from './discover.mjs'

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
    slug: 'acryl-quick-notes', name: 'acryl-quick-notes', summary: 'Quick Notes', category: 'ui-client', compatibility: 'Both', publisher: 'inboxxobni',
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
