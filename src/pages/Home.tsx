import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Hexagon, Layers3, Package, Terminal, type LucideIcon } from "lucide-react";
import { usePageMeta } from "../components/layouts";
import { SectionHeading } from "../components/ui";
import { PluginCard } from "../components/registry-ui";
import { categories, plugins } from "../lib/registry-data";

export default function Home() {
  usePageMeta("Cordis Plugins — The Plugin Registry", "Discover, build, and publish Cordis plugins for ACRYL and DeepSeek Harness.");
  const featured = plugins.filter((p) => !p.private).slice(0, 4);
  const publishers = new Set(plugins.map((p) => p.publisher)).size;
  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-surface-2">
        <div className="mx-auto grid min-h-[650px] max-w-[1440px] items-center px-6 py-20 lg:grid-cols-[1.2fr_.8fr] lg:px-8">
          <div className="relative z-10">
            <div className="mb-7 inline-flex items-center gap-2 border border-border bg-background px-3 py-1.5 font-mono text-[11px] uppercase text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-primary" />Public registry · Protocol neutral</div>
            <h1 className="max-w-4xl font-display text-5xl font-semibold leading-[.98] sm:text-6xl lg:text-7xl">The building blocks of <span className="text-primary">Cordis.</span></h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground">Discover small, composable plugins that become tools, services, interfaces — and complete ACRYL Blends.</p>
            <div className="mt-9 flex flex-wrap gap-3"><Link to="/plugins" className="btn-primary">Browse plugins <ArrowRight size={16}/></Link><Link to="/publish" className="btn-secondary">Publish yours</Link></div>
            <div className="mt-12 flex flex-wrap gap-8 border-t border-border pt-6 font-mono text-xs text-muted-foreground"><span><b className="text-foreground">{plugins.length}</b> real plugins listed</span><span><b className="text-foreground">{publishers}</b> publisher</span><span><b className="text-foreground">2</b> runtimes: ACRYL &amp; DSH stock</span></div>
          </div>
          <div className="relative mt-16 hidden place-items-center lg:grid"><img src="/logo/wordmark.png" alt="Cordis" className="h-80 w-80 object-contain" /></div>
        </div>
      </section>

      <section className="border-b border-border py-20"><div className="mx-auto max-w-[1440px] px-6 lg:px-8"><SectionHeading index="01" title="One protocol. Three layers." description="Plugins stay small. Blends compose them into complete systems. The public registry makes every layer discoverable." /><div className="grid border border-border md:grid-cols-3">{([{ n: "01", t: "Plugin", d: "The atom — you are here", icon: Package, active: true }, { n: "02", t: "Blend", d: "The composition (acrylblends.github.io)", icon: Layers3, active: false }, { n: "03", t: "Registry", d: "The ecosystem", icon: Hexagon, active: false }] as { n: string; t: string; d: string; icon: LucideIcon; active: boolean }[]).map(({ n, t, d, icon: Icon, active }) => <div key={n} className={`relative min-h-64 border-b border-border p-7 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0 ${active ? "bg-primary text-primary-foreground" : "bg-card"}`}><span className="font-mono text-xs opacity-70">{n}</span><Icon size={32} className="mt-12" /><h3 className="mt-5 font-display text-2xl font-semibold">{t}</h3><p className="mt-2 text-sm opacity-70">{d}</p>{active && <span className="absolute right-5 top-5 font-mono text-[9px] uppercase">You are here</span>}</div>)}</div></div></section>

      <section className="border-b border-border bg-surface-2 py-20"><div className="mx-auto grid max-w-[1440px] gap-12 px-6 lg:grid-cols-2 lg:px-8"><div><SectionHeading index="02" title="A plugin is just enough." description="A focused capability, explicit dependencies, and a lifecycle that cleans up after itself." /><ul className="mt-8 space-y-4 text-sm text-muted-foreground">{["Registers against a Cordis context", "Declares what it provides and consumes", "Owns every effect through its Fiber lifecycle"].map((x) => <li key={x} className="flex gap-3"><CheckCircle2 size={20} className="text-primary" />{x}</li>)}</ul></div><pre className="overflow-x-auto border border-border bg-code p-6 font-mono text-sm leading-7 text-code-foreground"><code>{`// hello.ts\nimport { Context } from 'cordis'\n\nexport const name = 'hello'\n\nexport function apply(ctx: Context) {\n  ctx.on('ready', () => {\n    ctx.logger.info('hello, world')\n  })\n}\n\n# cordis.yml\nplugins:\n  hello: {}`}</code></pre></div></section>

      <section className="border-b border-border py-20"><div className="mx-auto max-w-[1440px] px-6 lg:px-8"><SectionHeading index="03" title="Browse by capability" description="Find the extension point you need — not a product category." /><div className="grid sm:grid-cols-2 lg:grid-cols-4">{categories.map((c) => <Link key={c.slug} to={`/plugins/${c.slug}`} className="group min-h-52 border border-border p-6 hover:bg-surface-2"><c.icon size={24} className="text-primary" /><h3 className="mt-10 font-display text-xl font-semibold">{c.name}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{c.description}</p><span className="mt-5 block font-mono text-[10px] uppercase text-muted-foreground">{c.count} {c.count === 1 ? "package" : "packages"} →</span></Link>)}</div></div></section>

      <section className="border-b border-border bg-surface-2 py-20"><div className="mx-auto max-w-[1440px] px-6 lg:px-8"><SectionHeading index="04" title="Featured from the registry" description="Every entry below is a real, currently-published Cordis plugin — not sample data." /><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{featured.map((p) => <PluginCard key={p.slug} plugin={p} />)}</div></div></section>

      <section className="border-b border-border bg-ink text-ink-foreground py-20"><div className="mx-auto grid max-w-[1440px] items-center gap-12 px-6 lg:grid-cols-[.9fr_1.1fr] lg:px-8"><img src="/logo/concept-labeled.png" alt="Cordis composability concept" className="mx-auto h-72 w-72 object-contain lg:h-96 lg:w-96" /><div><p className="font-mono text-xs uppercase tracking-[0.1em] text-primary">Philosophy</p><h2 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">Small, disposable, replaceable cells — never a monolith with plugin points bolted on.</h2><p className="mt-5 max-w-xl leading-7 text-ink-muted">The protocol's small surface — Context, Service, inject, Fiber lifecycle, Loader — is deliberate. It is easier to guarantee correctness in a system with few primitives than in one with many.</p><Link to="/ecosystem/philosophy" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-primary">Read the full philosophy <ArrowRight size={15} /></Link></div></div></section>

      <section className="py-20"><div className="mx-auto max-w-[1440px] px-6 lg:px-8"><SectionHeading index="05" title="From idea to registry" /><div className="grid border border-border md:grid-cols-3">{[["01", "Scaffold", "Start from the official plugin template."], ["02", "Develop", "Hot-reload inside your own instance."], ["03", "Publish", "Release with pnpm and list it here."]].map(([n, t, d]) => <div key={n} className="border-b border-border p-7 last:border-0 md:border-b-0 md:border-r md:last:border-r-0"><Terminal size={20} className="text-primary" /><p className="mt-10 font-mono text-xs text-primary">{n}</p><h3 className="mt-3 font-display text-2xl font-semibold">{t}</h3><p className="mt-3 text-sm text-muted-foreground">{d}</p></div>)}</div></div></section>
    </>
  );
}
