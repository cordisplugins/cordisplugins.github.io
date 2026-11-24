import { useEffect, useState } from 'react'
import type { Plugin } from './registry-data'

export type CatalogKind = { slug: string; name: string; description: string }
export type CatalogComponent = { id: string; name: string; slug: string; description: string; kind?: string }
export type CatalogSubcategory = { id: string; name: string; slug: string; description: string; components: CatalogComponent[] }
export type CatalogDomain = { id: string; number: number; name: string; slug: string; taxonomyName: string; description: string; subcategories: CatalogSubcategory[] }
export type Catalog = { formatVersion: number; kinds: CatalogKind[]; categories: CatalogDomain[] }

export type CatalogState = { state: 'loading' } | { state: 'live'; catalog: Catalog } | { state: 'failed' }

let cache: Promise<Catalog> | undefined

/** The generated shared catalog (public/categories.json), fetched once per page. */
export function loadCatalog(): Promise<Catalog> {
  cache ??= fetch('/categories.json').then(response => {
    if (!response.ok) throw new Error(`categories.json answered ${response.status}`)
    return response.json() as Promise<Catalog>
  })
  return cache
}

export function useCatalog(): CatalogState {
  const [state, setState] = useState<CatalogState>({ state: 'loading' })
  useEffect(() => {
    let live = true
    loadCatalog()
      .then(catalog => { if (live) setState({ state: 'live', catalog }) })
      .catch(() => { if (live) setState({ state: 'failed' }) })
    return () => { live = false }
  }, [])
  return state
}

type Index = { domains: Map<string, { category: CatalogDomain; sub: CatalogSubcategory }>; components: Map<string, { category: CatalogDomain; sub: CatalogSubcategory; component: CatalogComponent }>; kinds: Map<string, CatalogKind> }
const indexes = new WeakMap<Catalog, Index>()

function indexOf(catalog: Catalog): Index {
  const existing = indexes.get(catalog)
  if (existing !== undefined) return existing
  const index: Index = { domains: new Map(), components: new Map(), kinds: new Map(catalog.kinds.map(kind => [kind.slug, kind])) }
  for (const category of catalog.categories) {
    for (const sub of category.subcategories) {
      index.domains.set(sub.id, { category, sub })
      for (const component of sub.components) index.components.set(component.id, { category, sub, component })
    }
  }
  indexes.set(catalog, index)
  return index
}

export const domainOf = (catalog: Catalog | undefined, id: string | undefined) =>
  catalog === undefined || id === undefined ? undefined : indexOf(catalog).domains.get(id)
export const componentOf = (catalog: Catalog | undefined, id: string | undefined) =>
  catalog === undefined || id === undefined ? undefined : indexOf(catalog).components.get(id)
export const kindOf = (catalog: Catalog | undefined, slug: string | undefined) =>
  catalog === undefined || slug === undefined ? undefined : indexOf(catalog).kinds.get(slug)

export type Classification = {
  classified: boolean
  kindName?: string
  domainName?: string
  subName?: string
  componentName?: string
}

/** What the card and the detail page show for a plugin: its kind, domain and component, or Unclassified when it has neither keyword. */
export function classificationOf(plugin: Plugin, catalog: Catalog | undefined): Classification {
  const kind = kindOf(catalog, plugin.kind)
  const domain = domainOf(catalog, plugin.domain)
  const component = componentOf(catalog, plugin.component)
  return {
    classified: plugin.kind !== undefined || plugin.domain !== undefined,
    ...(plugin.kind === undefined ? {} : { kindName: kind?.name ?? plugin.kind }),
    ...(domain === undefined ? {} : { domainName: domain.category.name, subName: domain.sub.name }),
    ...(plugin.component === undefined ? {} : { componentName: component?.component.name ?? plugin.component }),
  }
}

/** The text search sees the name, the description and the classification tags, old Blends placement included. */
export function searchText(plugin: Plugin, catalog: Catalog | undefined): string {
  const classification = classificationOf(plugin, catalog)
  return [
    plugin.name,
    plugin.summary,
    plugin.publisher,
    plugin.category,
    plugin.kind,
    plugin.domain,
    plugin.component,
    classification.kindName,
    classification.domainName,
    classification.subName,
    classification.componentName,
    plugin.placement?.category,
    plugin.placement?.subcategory,
  ]
    .filter((part): part is string => typeof part === 'string' && part.length > 0)
    .join(' ')
}
