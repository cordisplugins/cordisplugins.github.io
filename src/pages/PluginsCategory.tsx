import { useState } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { categories, plugins } from "../lib/registry-data";
import { useCatalog } from "../lib/catalog";
import { domainCounts, EMPTY_ROW } from "../components/catalog-ui";
import NotFound from "./NotFound";
import { PageIntro, usePageMeta } from "../components/layouts";
import { byOrigin, OriginChips, PluginCard, type OriginFilter } from "../components/registry-ui";

function CapabilityCategory() {
  const { category } = useParams();
  const current = categories.find((c) => c.slug === category);
  usePageMeta(current?.name ?? "Plugin category", `Browse Cordis plugins in ${current?.name ?? "this category"}.`);
  const [origin, setOrigin] = useState<OriginFilter>("all");
  const list = byOrigin(plugins.filter((p) => p.category === category), origin);
  return (
    <>
      <PageIntro eyebrow="Registry / Capability" title={current?.name ?? "Plugin category"} description={current?.description ?? "Cordis plugins grouped by extension point."} />
      <div className="mx-auto max-w-[1440px] px-6 py-14 lg:px-8">
        <div className="mb-6"><OriginChips value={origin} onChange={setOrigin} /></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{list.map((p) => <PluginCard key={p.slug} plugin={p} />)}</div>
        {list.length === 0 && <div className="border border-dashed border-border bg-surface-2 p-12 text-center text-muted-foreground"><p>No plugins here yet — this is a real, addressable category waiting for its first package.</p><Link to="/publish" className="btn-primary mt-6 inline-flex">Be the first to publish one</Link></div>}
      </div>
    </>
  );
}

/** /plugins/<slug>: a capability category (extension point), or else one of the 100 domains of the shared catalog with its subcategories and codes. */
export default function PluginsCategory() {
  const { category } = useParams();
  if (categories.some((c) => c.slug === category)) return <CapabilityCategory />;
  return <DomainPage slug={category} />;
}

function DomainPage({ slug }: { slug?: string }) {
  const catalog = useCatalog();
  const live = catalog.state === "live" ? catalog.catalog : undefined;
  const domain = live?.categories.find((c) => c.slug === slug);
  usePageMeta(domain?.name ?? "Plugin domain", domain ? `Cordis plugins in ${domain.id} ${domain.name}.` : "Cordis plugin domain.");
  const [origin, setOrigin] = useState<OriginFilter>("all");
  if (catalog.state === "live" && domain === undefined) return <NotFound />;
  const { bySub } = domainCounts(plugins);
  const ids = new Set(domain?.subcategories.map((s) => s.id));
  const list = byOrigin(plugins.filter((p) => p.domain !== undefined && ids.has(p.domain)), origin);
  return (
    <>
      <PageIntro eyebrow="Registry / Domain" title={domain ? `${domain.id} ${domain.name}` : "Plugin domain"} description={domain?.description ?? "Reading the shared catalog."} />
      <div className="mx-auto max-w-[1440px] px-6 py-14 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link to="/plugins" className="font-mono text-xs text-muted-foreground hover:text-primary">← All plugins</Link>
          <OriginChips value={origin} onChange={setOrigin} />
        </div>
        {domain && <ul className="mb-10 grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">{domain.subcategories.map((sub) => { const n = bySub.get(sub.id) ?? 0; return <li key={sub.id} className={n === 0 ? EMPTY_ROW : ""}><Link to={`/plugins/${domain.slug}/${sub.slug}`} className="flex items-baseline justify-between gap-3 border-b border-border/60 py-2 text-sm hover:text-primary"><span className="flex min-w-0 gap-3"><span className="w-12 shrink-0 font-mono text-[10px] text-muted-foreground">{sub.id}</span><span className="min-w-0">{sub.name}</span></span>{n > 0 && <span className="font-mono text-[10px] text-muted-foreground">{n}</span>}</Link></li>; })}</ul>}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{list.map((p) => <PluginCard key={p.slug} plugin={p} />)}</div>
        {list.length === 0 && <div className="border border-dashed border-border bg-surface-2 p-12 text-center text-muted-foreground"><p>No plugin declares a subcategory of this domain yet. It appears when a release adds a <code>cordis-domain-{domain?.id ?? "NN"}-SS</code> keyword.</p><Link to="/plugins" className="btn-primary mt-6 inline-flex">Browse all plugins</Link></div>}
      </div>
    </>
  );
}
