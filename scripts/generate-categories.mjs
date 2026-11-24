/**
 * Generate public/registry/categories.json v2 from the owner's taxonomy v04 and the Blends store's top level.
 * The 100 top-level names and order are acrylblends.github.io's 100 categories (the fixture is its live categories.json);
 * their subcategories and components are v04's. The 22 kinds are the owner's decision in specs/053 (acryldev/acryl).
 *
 *   node scripts/generate-categories.mjs <CordisPlugins_..._v04.json>
 */
import { readFile, writeFile } from 'node:fs/promises'

const KINDS = [
  { slug: 'themes', name: 'Themes & Appearance', description: 'Themes, brand, icons, fonts.' },
  { slug: 'ui', name: 'UI Panels & Views', description: 'Panels, views, layout, UI enhancements.' },
  { slug: 'sessions', name: 'Sessions & Messages', description: 'Chat history, sessions, message tools.' },
  { slug: 'tools', name: 'Agent Tools & Skills', description: 'Tools and capabilities the agent calls, skills.' },
  { slug: 'memory', name: 'Memory & Context', description: 'Memory, context, retrieval for the agent.' },
  { slug: 'models', name: 'Models & Providers', description: 'Model providers, routing, local models.' },
  { slug: 'usage', name: 'Usage & Billing', description: 'Tokens, cost, quotas.' },
  { slug: 'identity', name: 'Identity & Communication', description: 'Accounts, sign-in, people, team presence.' },
  { slug: 'channels', name: 'Channels & Notifications', description: 'Chat channels, notifications, messengers.' },
  { slug: 'integrations', name: 'Integrations', description: 'MCP, apps and outside services.' },
  { slug: 'web', name: 'Browser & Web', description: 'Browser use, web fetch, web pages.' },
  { slug: 'vision', name: 'Vision & Multimodal', description: 'Images, video, screen, multimodal input.' },
  { slug: 'voice', name: 'Voice & Audio', description: 'Speech in and out, audio.' },
  { slug: 'docs', name: 'Docs & Rendering', description: 'Documents, markdown, diagrams, rendering.' },
  { slug: 'git', name: 'Git & Code Review', description: 'Git, pull requests, review.' },
  { slug: 'workflow', name: 'Workflow & Automation', description: 'Workflows, schedules, automations.' },
  { slug: 'dev', name: 'Development & Runtime', description: 'Developer tools, runtimes, debugging.' },
  { slug: 'remote', name: 'Remote & Mobile', description: 'Remote access, phones, other devices.' },
  { slug: 'platform', name: 'OS & Platform Interop', description: 'Windows, WSL, macOS and Linux integration.' },
  { slug: 'markets', name: 'Plugin Markets & Managers', description: 'Catalogs, installers, plugin managers.' },
  { slug: 'agents', name: 'Agent Architecture & Research', description: 'Agent architectures, multi-agent, AGI exploration.' },
  { slug: 'fun', name: 'Fun', description: 'Just for fun.' },
]

const taxonomyPath = process.argv[2]
if (taxonomyPath === undefined) {
  console.error('usage: node scripts/generate-categories.mjs <CordisPlugins_..._v04.json>')
  process.exit(1)
}

const taxonomy = JSON.parse(await readFile(taxonomyPath, 'utf8'))
const blends = JSON.parse(await readFile(new URL('./fixtures/acrylblends-categories.json', import.meta.url), 'utf8'))

if (taxonomy.categories.length !== 100) throw new Error(`the taxonomy has ${taxonomy.categories.length} categories, not 100`)
if (blends.categories.length !== 100) throw new Error(`the Blends categories have ${blends.categories.length} categories, not 100`)

const categories = taxonomy.categories.map((category, index) => {
  const top = blends.categories[index]
  return {
    id: category.id,
    number: Number(category.id),
    name: top.name,
    slug: top.slug,
    taxonomyName: category.name,
    description: category.description,
    scope: category.scope ?? '',
    boundary: category.classificationBoundary ?? '',
    relatedCategoryIds: category.relatedCategoryIds ?? [],
    subcategories: category.subcategories.map(sub => ({
      id: sub.id,
      name: sub.name,
      slug: sub.slug,
      description: sub.description,
      scope: sub.description ?? '',
      boundary: (sub.includes ?? []).join('; '),
      includes: sub.includes ?? [],
      components: (sub.elements ?? []).filter(element => element.status !== 'redirect').map(element => ({
        id: element.id,
        name: element.name,
        slug: element.slug,
        description: element.description,
        kind: element.kind,
        ...(Array.isArray(element.implementationExamples) && element.implementationExamples.length > 0
          ? { examples: element.implementationExamples }
          : {}),
      })),
    })),
  }
})

const output = {
  formatVersion: 2,
  generatedFrom: 'CordisPlugins_classification_100_Categories_and_Subcategories_approach_v04.json',
  blendsCategories: 'https://acrylblends.github.io/categories.json',
  kinds: KINDS,
  categories,
}

const target = new URL('../public/categories.json', import.meta.url)
await writeFile(target, `${JSON.stringify(output, null, 2)}\n`)

const subcategories = categories.reduce((sum, category) => sum + category.subcategories.length, 0)
const components = categories.reduce((sum, category) => sum + category.subcategories.reduce((inner, sub) => inner + sub.components.length, 0), 0)
console.log(`categories.json v2: ${categories.length} domains, ${subcategories} subcategories, ${components} components, ${KINDS.length} kinds`)
