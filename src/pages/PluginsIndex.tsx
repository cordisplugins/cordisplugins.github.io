import { Link } from "react-router-dom";
import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { categories, plugins, type Compatibility } from "../lib/registry-data";
import { PageIntro, usePageMeta } from "../components/layouts";
import { PluginCard } from "../components/registry-ui";

const tiers: (Compatibility | "All")[] = ["All", "Both", "ACRYL", "DSH stock"];

export default function PluginsIndex() {
  usePageMeta("Browse Plugins", "Search the public Cordis plugin registry by capability and compatibility.");
  const [query, setQuery] = useState("");
  const [tier, setTier] = useState<Compatibility | "All">("All");
  const [acrylOnly, setAcrylOnly] = useState(false);
  const results = useMemo(() => plugins.filter((p) => (!query || `${p.name} ${p.summary} ${p.publisher}`.toLowerCase().includes(query.toLowerCase())) && (tier === "All" || p.compatibility === tier) && (!acrylOnly || p.acrylPackage)), [query, tier, acrylOnly]);
  return (
    <>
      <PageIntro eyebrow={`Registry / ${plugins.length} real packages`} title="Browse plugins" description="Search by capability, runtime compatibility, or publisher. Every package here is a real, independently versioned Cordis building block this ecosystem has actually built." />
      <section className="mx-auto max-w-[1440px] px-6 py-12 lg:px-8">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
          <label className="flex h-11 items-center gap-3 border border-input bg-card px-4"><Search size={16} className="text-muted-foreground" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search packages, capabilities, publishers…" className="w-full bg-transparent text-sm outline-none" /></label>
          <div className="flex gap-2">{tiers.map((x) => <button key={x} onClick={() => setTier(x)} className={tier === x ? "btn-primary" : "btn-secondary"}>{x}</button>)}</div>
          <button onClick={() => setAcrylOnly(!acrylOnly)} className={acrylOnly ? "btn-primary" : "btn-secondary"}><SlidersHorizontal size={16} />Acryl-package</button>
        </div>
        <div className="mt-12"><p className="mb-4 font-mono text-xs uppercase text-muted-foreground">Browse by capability</p><div className="grid sm:grid-cols-2 lg:grid-cols-4">{categories.map((c) => <Link key={c.slug} to={`/plugins/${c.slug}`} className="flex items-center justify-between border border-border bg-card px-4 py-4 text-sm hover:border-primary"><span className="flex items-center gap-3"><c.icon size={16} className="text-primary" />{c.name}</span><span className="font-mono text-[10px] text-muted-foreground">{c.count}</span></Link>)}</div></div>
        <div className="mt-14 flex items-end justify-between"><div><p className="font-display text-2xl font-semibold">All packages</p><p className="mt-1 text-sm text-muted-foreground">{results.length} matching registry entries</p></div></div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{results.map((p) => <PluginCard key={p.slug} plugin={p} />)}</div>
        {results.length === 0 && <div className="border border-border py-20 text-center text-muted-foreground">No plugins match those filters.</div>}
      </section>
    </>
  );
}
