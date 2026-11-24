import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { test } from 'node:test'

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

test('the override file is a pending proposal with valid kinds, domains and components', () => {
  assert.equal(proposal.formatVersion, 1)
  assert.match(proposal.status, /proposal/u)
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

test('the override file is not wired into the site', () => {
  const offenders = []
  const walk = directory => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = new URL(`${entry.name}${entry.isDirectory() ? '/' : ''}`, directory)
      if (entry.isDirectory()) walk(path)
      else if (/\.(?:ts|tsx)$/u.test(entry.name) && readFileSync(path, 'utf8').includes('classification-overrides')) offenders.push(path.pathname)
    }
  }
  walk(new URL('../../src/', import.meta.url))
  assert.deepEqual(offenders, [])
})
