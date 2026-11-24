import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { overridesApproved, withOverride } from './classification.mjs'

const catalog = JSON.parse(readFileSync(new URL('../../public/categories.json', import.meta.url), 'utf8'))
const proposal = JSON.parse(readFileSync(new URL('../../src/data/classification-overrides.json', import.meta.url), 'utf8'))

const kinds = new Set(catalog.kinds.map(kind => kind.slug))
const domains = new Map()
const components = new Map()
for (const category of catalog.categories) {
  for (const sub of category.subcategories) {
    domains.set(sub.id, sub)
    for (const component of sub.components) components.set(component.id, { ...component, sub: sub.id })
  }
}

test('the override file is approved, with valid kinds, domains and components and no blocked plugin', () => {
  assert.equal(proposal.formatVersion, 1)
  assert.equal(overridesApproved(proposal), true)
  const blocked = new Set(JSON.parse(readFileSync(new URL('../../blocklist.json', import.meta.url), 'utf8')).repositories.map(name => name.split('/')[1]))
  for (const name of Object.keys(proposal.overrides)) assert.equal(blocked.has(name), false, `${name} is on the blocklist`)
  const entries = Object.entries(proposal.overrides)
  assert.equal(entries.length, 75)
  for (const [name, entry] of entries) {
    assert.ok(name.length > 0)
    assert.ok(kinds.has(entry.kind), `${name}: unknown kind ${entry.kind}`)
    assert.ok(domains.has(entry.domain), `${name}: unknown domain ${entry.domain}`)
    assert.ok(entry.reason.length > 10)
    if (entry.component !== undefined) {
      const component = components.get(entry.component)
      assert.ok(component !== undefined, `${name}: unknown component ${entry.component}`)
      assert.equal(component.sub, entry.domain, `${name}: ${entry.component} is not under ${entry.domain}`)
    }
  }
})

test('the override file is read only once approved, and an author keyword wins', () => {
  const plugin = { name: 'x', summary: '' }
  const file = status => ({ status, overrides: { x: { kind: 'dev', domain: '04-05', component: '04-05-02' } } })
  assert.equal(overridesApproved(file('proposal - owner approval pending')), false)
  assert.deepEqual(withOverride(plugin, file('proposal - owner approval pending')), plugin)
  assert.deepEqual(withOverride(plugin, file('approved by the owner 2026-11-26')), { ...plugin, kind: 'dev', domain: '04-05', component: '04-05-02' })
  assert.deepEqual(withOverride({ ...plugin, kind: 'fun' }, file('approved')), { ...plugin, kind: 'fun', domain: '04-05', component: '04-05-02' })
  assert.deepEqual(withOverride({ ...plugin, domain: '41-02' }, file('approved')), { ...plugin, kind: 'dev', domain: '41-02' })
  assert.equal(withOverride({ name: 'unknown' }, file('approved')).kind, undefined)
})
