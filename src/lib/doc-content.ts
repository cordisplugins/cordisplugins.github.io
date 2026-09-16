// Real, hand-written content — grounded in the actual Cordis protocol, the
// acryldev/acryl repo's own Cordis development discipline, and the real
// plugins this ecosystem has built. Not placeholder registry copy.
// Keyed "<group-slug>/<item-slug>" for Docs pages, or a flat slug for Ecosystem.
export type DocEntry = {
  intro: string;
  body: { heading?: string; paragraphs: string[]; note?: string }[];
  code?: { label: string; code: string };
};

const helloCode = `import { Context } from 'cordis'

export const name = 'hello'

export function apply(ctx: Context) {
  ctx.on('ready', () => {
    ctx.logger.info('hello, world')
  })
}`;

const cordisYamlCode = `# cordis.yml
plugins:
  hello: {}`;

const serviceCode = `import { Context, Service } from 'cordis'

declare module 'cordis' {
  interface Context {
    greeter: GreeterService
  }
}

class GreeterService extends Service {
  constructor(ctx: Context) {
    super(ctx, 'greeter')
  }
  greet(name: string) {
    return \`hello, \${name}\`
  }
}

export const name = 'greeter'
export function apply(ctx: Context) {
  ctx.plugin(GreeterService)
}`;

const injectCode = `export const name = 'consumer'
export const inject = ['greeter']

export function apply(ctx: Context) {
  ctx.on('ready', () => {
    ctx.logger.info(ctx.greeter.greet('cordis'))
  })
}`;

const compositionYamlCode = `# cordis.yml
plugins:
  hello:
    id: my-hello
    disabled: false
  greeter: {}
  group:my-group:
    isolate: true
    plugins:
      consumer: {}`;

const effectCode = `export function apply(ctx: Context) {
  ctx.effect(() => {
    const timer = setInterval(() => ctx.logger.info('tick'), 1000)
    // Disposer: runs on unload, reactivation, or Fiber disposal.
    return () => clearInterval(timer)
  })
}`;

const loaderRowIdExample = `# Wrong: row id doesn't say what the package is
include:
  - dsh-editor          # actually acryl-dsh-editor-plugin

# Right: row id equals package name by default
include:
  - acryl-development-canvas`;

const cliInstallCode = "npm install -g @acryl/cli\nacryl plugin scaffold my-plugin\ncd my-plugin && acryl plugin dev";

const publishCode = "pnpm publish --access public";

export const docContent: Record<string, DocEntry> = {
  "getting-started/what-is-a-cordis-plugin": {
    intro: "A Cordis plugin is the minimal unit — the building block, the brick, the \"cell\" — that every Cordis-based system, including ACRYL and ACRYL Blends, is composed out of.",
    body: [
      { paragraphs: [
        "It is a function (or a class extending Service) registered against a Cordis Context. It declares, explicitly, what it provides (services, tools, events) and what it consumes (hard `inject` dependencies or optional `ctx.get()` lookups). It owns a lifecycle — a Fiber — and every resource it acquires is released through that same Fiber when it unloads.",
        "Nothing about a plugin assumes ACRYL. Cordis is a protocol, not a product: the same plugin shape works whether it's loaded into an ACRYL Desktop instance, an ACRYL Blend, or a stock DeepSeek Harness installation with no ACRYL code present at all. That protocol neutrality is why this registry exists as its own site, separate from and linked to acrylblends.github.io.",
      ]},
    ],
    code: { label: "hello.ts + cordis.yml", code: `${helloCode}\n\n${cordisYamlCode}` },
  },
  "getting-started/install-the-cli": {
    intro: "The CLI scaffolds a new plugin from the official template and runs it hot-reloaded, locally, before you ever touch this registry.",
    body: [{ paragraphs: [
      "Scaffolding from a template exists specifically so Cordis compatibility is guaranteed by construction — the generated shape already satisfies the Fiber lifecycle, the `provides`/`consumes` declaration, and the disposal contract, rather than leaving an author to discover the six-part design discipline the hard way.",
    ]}],
    code: { label: "terminal", code: cliInstallCode },
  },
  "getting-started/your-first-plugin": {
    intro: "The smallest real Cordis plugin: a name, and an apply(ctx) that does something with the context it's given.",
    body: [{ paragraphs: [
      "No base class is required. No mandatory configuration schema. No forced directory shape. A plugin can register a listener, a service, a tool, or nothing at all beyond logging — the protocol imposes structure on lifecycle and dependencies, not on what a plugin is for.",
    ]}],
    code: { label: "hello.ts", code: helloCode },
  },

  "core-concepts/fiber-lifecycle": {
    intro: "Every plugin activation is a Fiber, and a Fiber is always in exactly one of six states: PENDING, LOADING, ACTIVE, FAILED, UNLOADING, DISPOSED.",
    body: [{ paragraphs: [
      "PENDING is a valid, ordinary state — a plugin whose `inject` dependency isn't available yet sits PENDING, not broken, until a provider appears. When a provider changes, every dependent Fiber unloads and reactivates cleanly, with no stale references and no duplicate registrations left behind.",
      "This lifecycle is the actual mechanism behind hot reload: replacing a plugin's code means disposing its old Fiber and starting a new one, and that transition is safe exactly because every effect the old Fiber owned was registered through it and gets torn down with it.",
    ], note: "Cordis service isolation scopes dependency resolution. It is not an OS sandbox — isolation controls who can `inject` what, not what code is allowed to execute." }],
  },
  "core-concepts/services-and-inject": {
    intro: "A Service is a named, typed capability other plugins depend on explicitly — never through a concrete provider reference or Loader row order.",
    body: [{ paragraphs: [
      "Declaring `inject = ['greeter']` makes the dependency hard: the consuming plugin stays PENDING until a `greeter` provider exists, and reactivates cleanly if that provider is later replaced. `ctx.get('greeter')` is the optional-dependency counterpart — for a consumer that can degrade gracefully without it.",
    ]}],
    code: { label: "greeter.ts + consumer.ts", code: `${serviceCode}\n\n${injectCode}` },
  },
  "core-concepts/effects-and-disposal": {
    intro: "Every activation-owned resource — timers, watchers, sockets, subprocesses, routes, subscriptions — is acquired inside one owning ctx.effect() and fully released by its disposer.",
    body: [{ paragraphs: [
      "This is not a convention to remember by discipline alone; it's what makes reload, disposal, and repeated mount/unmount actually leak-free. A raw `setInterval` outside an effect survives its plugin's unload and silently keeps running against a Context that no longer exists.",
    ]}],
    code: { label: "effect.ts", code: effectCode },
  },
  "core-concepts/events-and-composition": {
    intro: "A Loader composes many plugins from one declarative YAML file, and can hot-reload any single one of them without restarting the rest.",
    body: [{ paragraphs: [
      "Row `id`, `disabled`, groups, and `isolate` are the composition primitives. An `id` names a specific plugin instance — and per this ecosystem's own convention, should equal the package name by default. `disabled` toggles a row off without deleting it. A group with `isolate: true` scopes service resolution so plugins inside it can't leak dependencies to plugins outside it.",
    ]}],
    code: { label: "cordis.yml", code: `${cordisYamlCode}\n\n${compositionYamlCode}` },
  },
  "core-concepts/function-plugins-vs-service-classes": {
    intro: "Use a function plugin by default. Reach for a Service class only when the plugin exposes a direct, named capability other plugins will inject.",
    body: [{ paragraphs: [
      "A function plugin — `name` plus `apply(ctx)` — is the right default for anything that mostly reacts to events or registers a tool. A `Service` class earns its extra ceremony when other plugins need to call methods on it directly through `ctx.<serviceName>`, as the `greeter` example above does.",
    ]}],
  },

  "building-a-plugin/generate-from-template": {
    intro: "Scaffolding from the official template guarantees Cordis compatibility by construction, not by review.",
    body: [{ paragraphs: [
      "The generated shape already satisfies the Fiber lifecycle contract and bakes in the six-part mini-design discipline as structure, not just documentation an author has to remember to follow.",
    ]}],
    code: { label: "terminal", code: "acryl plugin scaffold cordis-plugin-my-capability" },
  },
  "building-a-plugin/six-part-design-discipline": {
    intro: "Before writing a plugin, write down six things — the same discipline this ecosystem's own repository requires internally, documented here for every author.",
    body: [{ paragraphs: [
      "1. Capability and plugin boundary — what domain owns it and why it needs an independent lifecycle.",
      "2. Provides and consumes — services, tools, events, durable facts, hard `inject` requirements versus optional `ctx.get()` dependencies.",
      "3. Effects and disposal — every activation-owned resource, its disposer, cleanup order, cancellation, quiescence.",
      "4. Configuration and composition — validated runtime schema, stable Loader row id, scopes/isolation, provider replacement behavior.",
      "5. Events and durability — dispatch mode, waterfall `next()` semantics, which replay-critical facts belong in durable session state.",
      "6. Verification — real Loader activation plus PENDING/reactivation, provider replacement, disposal, repeated mount/reload, leak checks.",
    ]}],
  },
  "building-a-plugin/loader-row-naming": {
    intro: "A Loader row's id equals its package name by default. No unrelated shorthand a reader has to decode.",
    body: [{ paragraphs: [
      "This isn't a style preference — it's a rule this ecosystem learned from two real incidents, not hypotheticals. `acryl-development-canvas` shipped for a time under the row id `desktop-development-canvas`. A sibling plugin's row id `dsh-editor` (for the package actually named `acryl-dsh-editor-plugin`) went undiscovered as opaque until it broke a real production boot.",
      "The one legitimate exception is a deliberately shared, multi-provider slot, where the id names a capability rather than a package because more than one interchangeable package can fill it — exactly the pattern `dsh-client-ui-brand-acryl` uses, sharing the `ui-brand-official` slot with the official DSH brand package by design. That exception has to be named as such, explicitly, in the plugin's own mini-design — never a default excuse for an abbreviated id.",
    ]}],
    code: { label: "cordis.patch.yml", code: loaderRowIdExample },
  },
  "building-a-plugin/testing-in-isolation": {
    intro: "Verify real Loader activation, not just unit-level function calls.",
    body: [{ paragraphs: [
      "A plugin should be tested through actual PENDING/reactivation cycles, provider replacement, disposal, and repeated mount/reload — the same checklist item six of the mini-design discipline. A plugin that only passes an isolated unit test can still leak a timer or leave a stale service registration behind on real reload.",
    ]}],
  },

  "compatibility/compatibility-tiers": {
    intro: "A plugin declares one of three compatibility tiers: Both, ACRYL, or DSH stock.",
    body: [{ paragraphs: [
      "\"Both\" means the plugin runs unmodified against stock DeepSeek Harness and against ACRYL, using only ordinary Cordis primitives — `cordis-plugin-market` and `dsh-cordis` are both exactly this. \"ACRYL\" means the plugin assumes ACRYL-specific services or surfaces and will not resolve its dependencies outside an ACRYL instance — every editor and canvas plugin in this registry today is ACRYL-tier, because they inject ACRYL Desktop's own shell services. \"DSH stock\" is reserved for plugins that assume the vanilla DeepSeek Harness surface specifically and intentionally avoid ACRYL-only services.",
    ]}],
  },
  "compatibility/declaring-compatibility": {
    intro: "Declare the tier honestly — a mis-declared \"Both\" plugin fails silently for the exact users it claimed to support.",
    body: [{ paragraphs: [
      "The registry surfaces the tier as a badge on every plugin detail page precisely so a visitor can judge fit before installing, not after a broken boot. If a plugin injects any ACRYL-only service, it cannot honestly declare \"Both\" or \"DSH stock\", regardless of how small that one dependency feels.",
    ]}],
  },
  "compatibility/acryl-package-convention": {
    intro: "A suffix/tag convention that lets a plugin opt into automatic discoverability inside ACRYL's own in-instance market, without requiring every plugin on this public registry to be ACRYL-flavored.",
    body: [{ paragraphs: [
      "Anyone can publish a Cordis plugin here without it being ACRYL-specific at all — that neutrality is what keeps this registry usable by stock DeepSeek Harness communities too, the same way other plugin marketplaces let publishers opt into cross-listing. `dsh-cordis` and `pi-cordis` both carry the `acryl-package` tag today, which is what makes them auto-listed inside `cordis-plugin-market` as well as here.",
    ]}],
  },

  "in-instance-authoring/hot-reload-development": {
    intro: "Build a plugin without publishing it first. Hot reload lets it live and iterate inside a running instance.",
    body: [{ paragraphs: [
      "For real self-evolution, an instance has to be able to build its own plugins without the friction of a full publish cycle on every change. A plugin written this way stays local and hot-reloadable, and only graduates to this registry once it reaches a shape stable enough to be worth sharing.",
    ]}],
  },
  "in-instance-authoring/graduating-to-the-registry": {
    intro: "Publishing is the deliberate step you take once a locally-developed plugin has proven itself.",
    body: [{ paragraphs: [
      "Use `pnpm publish`, not `npm publish` or `npm pack`, for any plugin whose manifest declares workspace-protocol dependencies (`workspace:*`) — only `pnpm publish`/`pnpm pack` rewrite those to real semver ranges before the package leaves your workspace. This is not a hypothetical: it's exactly the failure that blocked this ecosystem's own first real plugin release, for `cordis-plugin-market` itself, before the fix landed.",
    ]}],
    code: { label: "terminal", code: publishCode },
  },
  "in-instance-authoring/local-only-vs-published": {
    intro: "A plugin that never leaves your own instance is not a lesser plugin — it's a legitimate, permanent choice for anything not worth the maintenance surface of a public package.",
    body: [{ paragraphs: [
      "`dsh-community-fabric` is the honest edge case in this registry: it exists as a real repository, describes a real interoperability standard, but is deliberately kept private and not yet a loadable plugin at all, because its schemas and a reviewed reference adapter don't exist yet. Listing it here as \"not yet loadable\" is more useful than pretending it's finished.",
    ]}],
  },

  "composition/how-plugins-become-a-blend": {
    intro: "A Blend is a YAML manifest naming the plugins that compose one working instance — the layer ACRYL Blends owns, not Cordis itself.",
    body: [{ paragraphs: [
      "Cordis defines how any set of plugins cooperates once loaded together. ACRYL Blends is the practical framework on top that turns \"a set of plugins\" into a describable, pullable, publishable product: a manifest, a registry (acrylblends.github.io), and tooling to grow one from a blank starting point. This registry — cordisplugins.github.io — is where the ingredients for that manifest come from.",
    ]}],
  },
  "composition/nesting-and-grouping": {
    intro: "Whether plugins should be nestable into intermediate groupings — between a single plugin and a full Blend — is an open, unresolved question.",
    body: [{ paragraphs: [
      "One direction under consideration borrows from biology: something like a cell/organism distinction, where a group of plugins could compose into a stable intermediate unit before folding into a full Blend. Nothing here is settled protocol; this page exists to record the question honestly rather than present speculation as finished design.",
    ]}],
  },

  "private-and-enterprise/private-registries": {
    intro: "Teams can run their own plugin registry boundary instead of publishing here.",
    body: [{ paragraphs: [
      "This is the same open-core posture as the rest of the ecosystem: the protocol, the CLI, and this public registry stay open and free, while a private registry is the option for a team that wants the identical publish/pull workflow without anything leaving their own boundary.",
    ]}],
  },
  "private-and-enterprise/enterprise-only-plugins": {
    intro: "Not every plugin is meant to be public — some are proprietary capability adapters sold or licensed privately.",
    body: [{ paragraphs: [
      "The open source project is free and stays free. Consulting, and enterprise-only plugins built for a specific business, are the commercial layer on top, built by Webboxes — never a paywall on the protocol or this public registry.",
    ]}],
  },
};

export const ecosystemContent: Record<string, DocEntry> = {
  "how-cordis-powers-acryl": {
    intro: "ACRYL — the coding-agent product at acryl.dev — is not a separate architecture from the plugins listed on this registry. It is a Cordis Loader composition, the same primitive every plugin here targets.",
    body: [
      { heading: "The Host and the Client", paragraphs: [
        "ACRYL Desktop's Electron shell hosts a Cordis Host process and a Cordis Client face. Every visible surface — the agent control plane, the terminal, the editor, the development canvas, the market — is a Cordis plugin loaded into that Host/Client composition through a `cordis.yml` Loader file, not a hardcoded feature list compiled into the app.",
        "That's why `acryl-development-canvas`, `acryl-dsh-editor-plugin`, and `dsh-client-ui-brand-acryl` all exist as independent, separately-versioned packages in this registry rather than as source files inside the ACRYL Desktop repository itself: each is swappable, individually testable, and loadable or unloadable without touching the others.",
      ]},
      { heading: "acryl.dev's own plugins, real and linked", paragraphs: [
        "Every plugin in this registry tagged compatibility \"ACRYL\" or provider \"acryldev\" is a real, currently-loaded part of the acryl.dev product, not a demo. Browse them from the Plugins tab, filtered to publisher acryldev, or follow the direct links from this page's own footer.",
      ]},
    ],
  },
  "how-cordis-powers-acryl-blends": {
    intro: "ACRYL Blends treats every plugin in this registry as an ingredient. A Blend is a manifest naming which ones compose one instance.",
    body: [
      { heading: "The three-layer model", paragraphs: [
        "Cordis plugin : npm :: Blend : Docker image :: Blend registry : Docker Hub. This registry — cordisplugins.github.io — is the atom-level, npm-equivalent layer. acrylblends.github.io is the Blend-level, Docker-Hub-equivalent layer, one level up. Neither absorbs the other: a Blend's detail page on acrylblends links out to every plugin it composes here, and this registry's own plugin pages link back to every Blend that depends on them.",
      ]},
      { heading: "Why the separation matters", paragraphs: [
        "Keeping plugin authoring and Blend composition as two distinct registries — rather than one undifferentiated catalog — is what lets this site stay genuinely protocol-neutral. A plugin author publishing here never has to think about ACRYL Blends at all; a Blend author composing on acrylblends.github.io is simply pulling from the same public plugin commons anyone else can use with stock DeepSeek Harness.",
      ]},
    ],
  },
  "philosophy": {
    intro: "Cordis treats software as small, disposable, replaceable cells — never as a monolith with plugin points bolted on.",
    body: [
      { paragraphs: [
        "The protocol's small surface — Context, Service, inject, Fiber lifecycle, Loader — is deliberate. It is easier to guarantee correctness (no leaked timers, no stale service references, safe hot reload) in a system with few primitives than in one with many. Every feature this ecosystem has built — the editor, the canvas, the brand slot, the market itself — is proof the small surface scales to real, shipped product surfaces rather than staying a toy example.",
        'A Cordis plugin is described elsewhere in this ecosystem as "the minimal unit — the building block, the brick, the cell." That framing is not marketing color: it is meant literally. The system composes upward from plugins to Blends to whole products the same way a biological system composes upward from cells to organs to organisms — small, independently viable units first, complexity as composition rather than as monolith.',
      ]},
      { heading: "Protocol neutrality as a design commitment", paragraphs: [
        "Cordis is the common ground both ACRYL and stock DeepSeek Harness build on to stay compatible — not ACRYL's own private framework wearing a neutral name. This registry's own governance, branding, and content are held to that neutrality deliberately: a stock DSH plugin author should never feel like a second-class citizen here.",
      ]},
    ],
  },
  "governance-and-roadmap": {
    intro: "An honest account of what's built and what isn't — this registry doesn't imply a policy or a feature before it exists.",
    body: [{ paragraphs: [
      "Review and moderation workflow — policy open, not yet decided. Download-count telemetry — not yet live. Dependents graph — modeled in the plugin detail page design, awaiting real registry data. Namespace disputes — resolution policy in design, motivated by a real incident: an early plugin name collided with an unrelated squatted npm stub, which is what originally forced the cordis-plugin-market rename.",
      "The public registry itself stays free and open regardless of how those specific gaps close. Private registries, enterprise plugins, and implementation consulting are the commercial layer that can fund the work without ever gating the community layer behind it.",
    ]}],
  },
};
