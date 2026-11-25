import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { plugins } from "../lib/registry-data";
import { useCatalog } from "../lib/catalog";
import { PageIntro, usePageMeta } from "../components/layouts";
import { byOrigin, OriginChips, PluginCard, type OriginFilter } from "../components/registry-ui";
import NotFound from "./NotFound";

/** /plugins/<domain-slug>/<sub-slug>: the plugins that declare one v04 subcategory as their primary domain. */
export default function PluginsDomain() {
  const { domain: domainSlug, sub: subSlug } = useParams();
  const catalog = useCatalog();
  const live = catalog.state === "live" ? catalog.catalog : undefined;
  const domain = live?.categories.find((category) => category.slug === domainSlug);
  const sub = domain?.subcategories.find((candidate) => candidate.slug === subSlug);
  usePageMeta(sub?.name ?? "Plugin domain", domain && sub ? `Cordis plugins in ${domain.name} › ${sub.name}.` : "Cordis plugin domain.");
  const [origin, setOrigin] = useState<OriginFilter>("all");
  if (catalog.state === "live" && (domain === undefined || sub === undefined)) return <NotFound />;
  const list = byOrigin(plugins.filter((plugin) => plugin.domain === sub?.id), origin);
  return (
    <>
      <PageIntro
        eyebrow={domain ? `Registry / ${domain.id} ${domain.name}` : "Registry / Domain"}
        title={sub ? `${sub.id} ${sub.name}` : "Plugin domain"}
        description={domain && sub ? `Plugins that declare ${domain.name} › ${sub.name} as their primary domain.` : "Reading the shared catalog."}
      />
      <div className="mx-auto max-w-[1440px] px-6 py-14 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link to="/plugins" className="font-mono text-xs text-muted-foreground hover:text-primary">← All plugins</Link>
          <OriginChips value={origin} onChange={setOrigin} />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{list.map((p) => <PluginCard key={p.slug} plugin={p} />)}</div>
        {list.length === 0 && (
          <div className="border border-dashed border-border bg-surface-2 p-12 text-center text-muted-foreground">
            <p>No plugin declares this domain yet. It appears when a release adds its <code>cordis-domain-{sub?.id ?? "NN-SS"}</code> keyword.</p>
            <Link to="/plugins" className="btn-primary mt-6 inline-flex">Browse all plugins</Link>
          </div>
        )}
      </div>
    </>
  );
}
