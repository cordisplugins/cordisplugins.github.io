import { Link } from "react-router-dom";
import type { Plugin } from "../lib/registry-data";
import { classificationOf, domainOf, type Catalog } from "../lib/catalog";

export type KindFilter = "all" | "unclassified" | string;

/** The 22 kinds as the main filter, with the Unclassified entry while no release has keywords yet. */
export function KindChips({ catalog, plugins, value, onChange }: { catalog?: Catalog; plugins: Plugin[]; value: KindFilter; onChange: (value: KindFilter) => void }) {
  const unclassified = plugins.filter((p) => p.kind === undefined && p.domain === undefined).length;
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Plugin kind">
      <button type="button" aria-pressed={value === "all"} onClick={() => onChange("all")} className={value === "all" ? "btn-primary" : "btn-secondary"}>All <span className="ml-1 font-mono text-[10px] opacity-70">{plugins.length}</span></button>
      {(catalog?.kinds ?? []).map((kind) => {
        const count = plugins.filter((plugin) => plugin.kind === kind.slug).length;
        return <button key={kind.slug} type="button" aria-pressed={value === kind.slug} onClick={() => onChange(kind.slug)} className={value === kind.slug ? "btn-primary" : "btn-secondary"} title={kind.description}>{kind.name} <span className="ml-1 font-mono text-[10px] opacity-70">{count}</span></button>;
      })}
      {unclassified > 0 && <button type="button" aria-pressed={value === "unclassified"} onClick={() => onChange("unclassified")} className={value === "unclassified" ? "btn-primary" : "btn-secondary"}>Unclassified <span className="ml-1 font-mono text-[10px] opacity-70">{unclassified}</span></button>}
    </div>
  );
}

/** The non-empty v04 domains on the left; a plugin without a domain is counted as unclassified, not hidden. */
export function DomainTree({ catalog, plugins }: { catalog?: Catalog; plugins: Plugin[] }) {
  const groups = new Map<string, { name: string; slug: string; number: number; subs: Map<string, { name: string; slug: string; count: number }> }>();
  for (const plugin of plugins) {
    const at = domainOf(catalog, plugin.domain);
    if (at === undefined) continue;
    const group = groups.get(at.category.id) ?? { name: at.category.name, slug: at.category.slug, number: at.category.number, subs: new Map() };
    const sub = group.subs.get(at.sub.id) ?? { name: at.sub.name, slug: at.sub.slug, count: 0 };
    sub.count += 1;
    group.subs.set(at.sub.id, sub);
    groups.set(at.category.id, group);
  }
  const withoutDomain = plugins.filter((plugin) => plugin.domain === undefined).length;
  const ordered = [...groups.values()].sort((a, b) => a.number - b.number);
  return (
    <aside aria-label="Browse by domain" className="min-w-0">
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Browse by domain</p>
      {ordered.length === 0 ? (
        <p className="mt-4 border border-dashed border-border p-4 text-sm leading-6 text-muted-foreground">No classified plugins yet. The domains appear here as plugins add their keywords.</p>
      ) : (
        <div className="mt-4 space-y-5">
          {ordered.map((group) => (
            <div key={group.slug}>
              <p className="font-mono text-xs font-semibold text-foreground">{group.name} <span className="font-normal text-muted-foreground">{group.subs.size}</span></p>
              <ul className="mt-2 space-y-1.5">
                {[...group.subs.entries()].sort((a, b) => a[1].name.localeCompare(b[1].name)).map(([id, sub]) => (
                  <li key={id}><Link to={`/plugins/${group.slug}/${sub.slug}`} className="flex items-baseline justify-between gap-2 text-sm text-muted-foreground hover:text-primary"><span className="min-w-0">{sub.name}</span><span className="font-mono text-[10px]">{sub.count}</span></Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      {withoutDomain > 0 && <p className="mt-5 border-t border-border pt-4 font-mono text-[11px] text-muted-foreground">Unclassified <span className="text-foreground">{withoutDomain}</span></p>}
    </aside>
  );
}

/** The kind, domain and component on a card or a detail page; Unclassified until the release carries the keywords. */
export function ClassificationBadge({ plugin, catalog }: { plugin: Plugin; catalog?: Catalog }) {
  const classification = classificationOf(plugin, catalog);
  if (!classification.classified) return <span className="mt-2 inline-flex w-fit border border-dashed border-border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">Unclassified</span>;
  return (
    <p className="mt-2 flex flex-wrap gap-x-2 gap-y-1 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
      {classification.kindName && <span className="text-primary">{classification.kindName}</span>}
      {classification.domainName && <span>{classification.domainName}{classification.subName ? ` › ${classification.subName}` : ""}</span>}
      {classification.componentName && <span>{classification.componentName}</span>}
    </p>
  );
}
