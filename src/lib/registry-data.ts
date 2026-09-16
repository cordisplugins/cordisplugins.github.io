import { Blocks, Bot, Box, Braces, Cable, Database, Palette, PanelsTopLeft, type LucideIcon } from "lucide-react";

export const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export type Compatibility = "Both" | "ACRYL" | "DSH stock";

export type Plugin = {
  slug: string;
  name: string;
  summary: string;
  category: string;
  compatibility: Compatibility;
  publisher: string;
  repoUrl: string;
  private?: boolean;
  acrylPackage?: boolean;
  provides: string[];
  consumes: string[];
};

export type Category = {
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
  count: number;
};

// The Cordis-capability categories from the registry design doc — what kind
// of extension point a plugin fills, not what product category it belongs
// to. This is deliberately distinct from acrylblends' own 100-category
// product taxonomy: a Blend is browsed by what it IS, a plugin by what it
// PROVIDES.
export const categories: Category[] = [
  { slug: "services", name: "Services", description: "Reusable capabilities exposed through context and dependency injection.", icon: Blocks, count: 0 },
  { slug: "tools", name: "Tools", description: "Actions and skills for agents and operators.", icon: Braces, count: 0 },
  { slug: "ui-client", name: "UI / Client", description: "Panels, commands, tabs and client contributions.", icon: PanelsTopLeft, count: 0 },
  { slug: "providers", name: "Providers", description: "Models, storage and external service adapters.", icon: Database, count: 0 },
  { slug: "editors-canvas", name: "Editors / Canvas", description: "Visual workspaces and creation surfaces.", icon: Box, count: 0 },
  { slug: "brand-theming", name: "Brand / Theming", description: "Tokens, themes and swappable presentation slots.", icon: Palette, count: 0 },
  { slug: "market-registry", name: "Market / Registry", description: "Discovery, installation and package metadata.", icon: Bot, count: 0 },
  { slug: "community-interop", name: "Community / Interop", description: "Bridges across Cordis-compatible systems.", icon: Cable, count: 0 },
];

// Every real, currently-published Cordis plugin this ecosystem has actually
// built so far — not placeholder registry data. Three live inside the
// acryldev/acryl monorepo (repoUrl points at plugins/<name> there); the rest
// are their own repos already transferred to github.com/cordisplugins.
export const plugins: Plugin[] = [
  {
    slug: "cordis-plugin-market",
    name: "cordis-plugin-market",
    summary: "Browse, inspect, and install plugins from inside a running Cordis instance — the in-instance counterpart to this public registry.",
    category: "market-registry",
    compatibility: "Both",
    publisher: "acryldev",
    repoUrl: "https://github.com/acryldev/acryl/tree/main/plugins/cordis-plugin-market",
    acrylPackage: true,
    provides: ["market", "registry.catalog"],
    consumes: ["profile", "desktop.service"],
  },
  {
    slug: "dsh-client-ui-brand-acryl",
    name: "dsh-client-ui-brand-acryl",
    summary: "ACRYL's own occupant of the DSH Web client's sidebar and conversation-hero brand slot — the swappable counterpart to the official DSH brand package.",
    category: "brand-theming",
    compatibility: "ACRYL",
    publisher: "acryldev",
    repoUrl: "https://github.com/acryldev/acryl/tree/main/plugins/dsh-client-ui-brand-acryl",
    acrylPackage: true,
    provides: ["ui-brand-official"],
    consumes: ["theme.tokens"],
  },
  {
    slug: "dsh-community-fabric",
    name: "dsh-community-fabric",
    summary: "Documentation-first home for a community DSH plugin interoperability standard. Deliberately not yet a loadable plugin.",
    category: "community-interop",
    compatibility: "Both",
    publisher: "acryldev",
    repoUrl: "https://github.com/acryldev/acryl/tree/main/plugins/dsh-community-fabric",
    private: true,
    provides: [],
    consumes: [],
  },
  {
    slug: "acryl-development-canvas",
    name: "acryl-development-canvas",
    summary: "Adds a Canvas to ACRYL Desktop: multiple PTYs, quick-launch of coding agents, and a built-in browser.",
    category: "editors-canvas",
    compatibility: "ACRYL",
    publisher: "acryldev",
    repoUrl: "https://github.com/cordisplugins/acryl-development-canvas",
    provides: ["ui.canvas", "canvas.store"],
    consumes: ["desktop.shell", "commands"],
  },
  {
    slug: "acryl-development-canvas-web",
    name: "acryl-development-canvas-web",
    summary: "The Web-surface counterpart of acryl-development-canvas, for browser-hosted ACRYL instances.",
    category: "editors-canvas",
    compatibility: "ACRYL",
    publisher: "acryldev",
    repoUrl: "https://github.com/cordisplugins/acryl-development-canvas-web",
    provides: ["ui.canvas"],
    consumes: ["web.shell"],
  },
  {
    slug: "acryl-dsh-editor-plugin",
    name: "acryl-dsh-editor-plugin",
    summary: "Adds a VSCode-like, Monaco-based code editor to an ACRYL Desktop instance.",
    category: "editors-canvas",
    compatibility: "ACRYL",
    publisher: "acryldev",
    repoUrl: "https://github.com/cordisplugins/acryl-dsh-editor-plugin",
    provides: ["ui.editor"],
    consumes: ["desktop.shell", "filesystem"],
  },
  {
    slug: "acryl-dsh-editor-plugin-web",
    name: "acryl-dsh-editor-plugin-web",
    summary: "The Web-surface counterpart of acryl-dsh-editor-plugin.",
    category: "editors-canvas",
    compatibility: "ACRYL",
    publisher: "acryldev",
    repoUrl: "https://github.com/cordisplugins/acryl-dsh-editor-plugin-web",
    provides: ["ui.editor"],
    consumes: ["web.shell"],
  },
  {
    slug: "acryl-dsh-editor-plugin-cli",
    name: "acryl-dsh-editor-plugin-cli",
    summary: "The terminal-surface counterpart of acryl-dsh-editor-plugin, for ACRYL CLI instances.",
    category: "editors-canvas",
    compatibility: "ACRYL",
    publisher: "acryldev",
    repoUrl: "https://github.com/cordisplugins/acryl-dsh-editor-plugin-cli",
    provides: ["ui.editor"],
    consumes: ["tui.shell"],
  },
  {
    slug: "cordis-plugin-graph",
    name: "cordis-plugin-graph",
    summary: "A zoomable relation graph of every loaded plugin — dependencies, resolved providers, and Loader-tree nesting — as a Settings tab next to Plugin List.",
    category: "ui-client",
    compatibility: "Both",
    publisher: "acryldev",
    repoUrl: "https://github.com/cordisplugins/cordis-plugin-graph",
    provides: ["ui.settings-tab"],
    consumes: ["loader.introspection"],
  },
  {
    slug: "dsh-cordis",
    name: "dsh-cordis",
    summary: "The core Cordis integration for DeepSeek Harness — the foundational plugin every other DSH-hosted Cordis plugin ultimately builds on.",
    category: "services",
    compatibility: "DSH stock",
    publisher: "acryldev",
    repoUrl: "https://github.com/cordisplugins/dsh-cordis",
    acrylPackage: true,
    provides: ["cordis.context"],
    consumes: [],
  },
  {
    slug: "pi-cordis",
    name: "pi-cordis",
    summary: "A Cordis integration for the Pi-based coding-agent runtime, extending Cordis composition beyond the DSH surface.",
    category: "services",
    compatibility: "Both",
    publisher: "acryldev",
    repoUrl: "https://github.com/cordisplugins/pi-cordis",
    acrylPackage: true,
    provides: ["cordis.context"],
    consumes: ["agent-engine"],
  },
];

for (const c of categories) c.count = plugins.filter((p) => p.category === c.slug).length;

export const docsGroups = [
  { slug: "getting-started", title: "Getting Started", items: ["What is a Cordis plugin", "Install the CLI", "Your first plugin"] },
  { slug: "core-concepts", title: "Core Concepts", items: ["Fiber lifecycle", "Services and inject", "Effects and disposal", "Events and composition", "Function plugins vs. Service classes"] },
  { slug: "building-a-plugin", title: "Building a Plugin", items: ["Generate from template", "Six-part design discipline", "Loader row naming", "Testing in isolation"] },
  { slug: "compatibility", title: "Compatibility", items: ["Compatibility tiers", "Declaring compatibility", "Acryl-package convention"] },
  { slug: "in-instance-authoring", title: "In-Instance Authoring", items: ["Hot-reload development", "Graduating to the registry", "Local-only vs. published"] },
  { slug: "composition", title: "Composition", items: ["How plugins become a Blend", "Nesting and grouping"] },
  { slug: "private-and-enterprise", title: "Private and Enterprise", items: ["Private registries", "Enterprise-only plugins"] },
  { slug: "resources", title: "Resources", items: ["CLI reference", "Examples", "FAQ", "Troubleshooting"] },
];
