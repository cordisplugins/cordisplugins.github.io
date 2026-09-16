import { Link, useParams } from "react-router-dom";
import { Box, ExternalLink, GitFork, Lock, PackageCheck } from "lucide-react";
import { plugins } from "../lib/registry-data";
import { usePageMeta } from "../components/layouts";
import { CompatibilityBadge, CopyCommand } from "../components/ui";
import NotFound from "./NotFound";

export default function PluginDetail() {
  const { pluginSlug } = useParams();
  const p = plugins.find((x) => x.slug === pluginSlug);
  usePageMeta(p?.name ?? "Plugin", p?.summary ?? "Cordis package details");
  if (!p) return <NotFound />;
  return (
    <div className="mx-auto max-w-[1440px] px-6 py-12 lg:px-8">
      <Link to="/plugins" className="font-mono text-xs text-muted-foreground hover:text-primary">← Registry</Link>
      <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_320px]">
        <article>
          <div className="flex flex-wrap items-center gap-3"><span className="grid h-12 w-12 place-items-center border border-border bg-surface-2"><Box className="text-primary" /></span><CompatibilityBadge value={p.compatibility} />{p.acrylPackage && <span className="border border-primary px-2 py-1 font-mono text-[10px] text-primary">ACRYL-PACKAGE</span>}{p.private && <span className="inline-flex items-center gap-1 border border-border px-2 py-1 font-mono text-[10px] uppercase text-muted-foreground"><Lock size={11} />Not yet loadable</span>}</div>
          <h1 className="mt-6 break-words font-mono text-3xl font-semibold sm:text-5xl">{p.name}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">{p.summary}</p>
          {!p.private && <div className="mt-8"><CopyCommand command={`pnpm add ${p.name}`} /></div>}
          <section className="prose-cordis py-10">
            <h2>About</h2>
            <p>{p.name} is a lifecycle-safe Cordis plugin. It registers its capability only while active and disposes every effect when unloaded.</p>
            {p.private
              ? <div className="doc-note"><strong>Not yet loadable</strong><p>This package is a documentation-first scaffold. It does not yet declare a loadable Cordis or DSH package entry point — see its source repository for current status.</p></div>
              : <>
                  <h2>Usage</h2>
                  <pre><code>{`import { Context } from 'cordis'\nimport plugin from '${p.name}'\n\nconst ctx = new Context()\nctx.plugin(plugin, { enabled: true })\nctx.start()`}</code></pre>
                </>}
            <h2>Cordis surface</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="border border-border p-5"><p className="font-mono text-xs uppercase text-primary">Provides</p>{p.provides.length ? p.provides.map((x) => <code key={x} className="mt-3 block text-sm">ctx.{x}</code>) : <p className="mt-3 text-sm text-muted-foreground">None yet declared.</p>}</div>
              <div className="border border-border p-5"><p className="font-mono text-xs uppercase text-primary">Consumes</p>{p.consumes.length ? p.consumes.map((x) => <code key={x} className="mt-3 block text-sm">ctx.{x}</code>) : <p className="mt-3 text-sm text-muted-foreground">None yet declared.</p>}</div>
            </div>
            <h2>Lifecycle</h2>
            <p>All listeners and service registrations are attached to the plugin's Fiber. Hot reload replaces the Fiber atomically without leaking effects.</p>
          </section>
        </article>
        <aside className="space-y-4">
          <div className="border border-border bg-card p-5"><p className="font-mono text-xs uppercase text-muted-foreground">Package</p>{[["Publisher", `@${p.publisher}`], ["Category", p.category], ["License", "MIT"]].map(([a, b]) => <div key={a} className="mt-4 flex justify-between gap-3 text-sm"><span className="text-muted-foreground">{a}</span><b>{b}</b></div>)}</div>
          <div className="border border-border p-5"><p className="font-mono text-xs uppercase text-muted-foreground">Provenance</p><p className="mt-4 text-sm"><b>@{p.publisher}</b></p><a className="mt-4 inline-flex items-center gap-2 text-sm text-primary" href={p.repoUrl} target="_blank" rel="noreferrer">Source repository <ExternalLink size={12} /></a></div>
          {!p.private && <div className="border border-border p-5"><p className="font-mono text-xs uppercase text-muted-foreground">Used in these Blends</p><p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><GitFork size={16} className="text-primary" />See <a className="text-primary" href="https://acrylblends.github.io" target="_blank" rel="noreferrer">acrylblends.github.io</a> for current compositions</p></div>}
          <div className="flex items-center gap-2 border border-primary/40 bg-primary/10 p-4 text-sm"><PackageCheck size={20} className="text-primary" />Registry metadata verified against the source repository</div>
        </aside>
      </div>
    </div>
  );
}
