import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

// The fixture is the live https://acrylblends.github.io/categories.json (the Blends store's 100 categories, in order).
const blends = JSON.parse(readFileSync(new URL('../fixtures/acrylblends-categories.json', import.meta.url), 'utf8'))
const catalog = JSON.parse(readFileSync(new URL('../../public/categories.json', import.meta.url), 'utf8'))

const allComponents = catalog.categories.flatMap(category => category.subcategories.flatMap(sub => sub.components))

test('the 100 domains are the Blends store categories, in order', () => {
  assert.equal(catalog.formatVersion, 2)
  assert.equal(catalog.categories.length, 100)
  assert.deepEqual(catalog.categories.map(category => category.name), blends.categories.map(category => category.name))
  assert.deepEqual(catalog.categories.map(category => category.slug), blends.categories.map(category => category.slug))
  assert.deepEqual(catalog.categories.map(category => category.number), Array.from({ length: 100 }, (_, index) => index + 1))
})

test('every domain, subcategory and component id is unique, well formed and under its parent', () => {
  const ids = new Set()
  const add = id => {
    assert.equal(ids.has(id), false, `duplicate id ${id}`)
    ids.add(id)
  }
  for (const category of catalog.categories) {
    assert.match(category.id, /^\d{2,3}$/u)
    add(category.id)
    assert.ok(category.name.length > 0)
    assert.ok(category.slug.length > 0)
    assert.ok(category.scope.length >= 0)
    assert.equal(typeof category.boundary, 'string')
    for (const sub of category.subcategories) {
      assert.match(sub.id, /^\d{2,3}-\d{2}$/u)
      assert.ok(sub.id.startsWith(`${category.id}-`))
      add(sub.id)
      assert.ok(sub.name.length > 0)
      assert.ok(sub.slug.length > 0)
      assert.equal(typeof sub.scope, 'string')
      assert.equal(typeof sub.boundary, 'string')
      for (const component of sub.components) {
        assert.match(component.id, /^\d{2,3}-\d{2}-\d{2}$/u)
        assert.ok(component.id.startsWith(`${sub.id}-`))
        add(component.id)
        assert.ok(component.name.length > 0)
        assert.ok(component.slug.length > 0)
        assert.equal(typeof component.description, 'string')
      }
    }
  }
  assert.equal(catalog.categories.length, 100)
  assert.equal(catalog.categories.reduce((sum, category) => sum + category.subcategories.length, 0), 513)
  assert.equal(allComponents.length, 2286)
})

test('the 22 kinds are unique and the decided set', () => {
  const expected = [
    'themes', 'ui', 'sessions', 'tools', 'memory', 'models', 'usage', 'identity', 'channels', 'integrations', 'web',
    'vision', 'voice', 'docs', 'git', 'workflow', 'dev', 'remote', 'platform', 'markets', 'agents', 'fun',
  ]
  assert.deepEqual(catalog.kinds.map(kind => kind.slug), expected)
  assert.equal(new Set(catalog.kinds.map(kind => kind.name)).size, 22)
  for (const kind of catalog.kinds) {
    assert.ok(kind.name.length > 0)
    assert.ok(kind.description.length > 0)
  }
})
