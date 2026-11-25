import { useState } from "react";
import { Link } from "react-router-dom";
import type { Plugin } from "../lib/registry-data";
import { classificationOf, domainOf, type Catalog } from "../lib/catalog";

export type KindFilter = "all" | "unclassified" | string;

/** The kinds that have a plugin as the main filter (an empty shelf is not shown, the selected one always is), with Unclassified while some plugin has no kind or domain. One scrolling row on a phone, wrapped on a desktop. */
export function KindChips({ catalog, plugins, value, onChange }: { catalog?: Catalog; plugins: Plugin[]; value: KindFilter; onChange: (value: KindFilter) => void }) {
  const unclassified = plugins.filter((p) => p.kind === undefined && p.domain === undefined).length;
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-wrap lg:overflow-visible lg:pb-0" role="group" aria-label="Plugin kind">
      <button type="button" aria-pressed={value === "all"} onClick={() => onChange("all")} className={`shrink-0 whitespace-nowrap ${value === "all" ? "btn-primary" : "btn-secondary"}`}>All <span className="ml-1 font-mono text-[10px] opacity-70">{plugins.length}</span></button>
      {(catalog?.kinds ?? []).map((kind) => {
        const count = plugins.filter((plugin) => plugin.kind === kind.slug).length;
        if (count === 0 && value !== kind.slug) return null;
        return <button key={kind.slug} type="button" aria-pressed={value === kind.slug} onClick={() => onChange(kind.slug)} className={`shrink-0 whitespace-nowrap ${value === kind.slug ? "btn-primary" : "btn-secondary"}`} title={kind.description}>{kind.name} <span className="ml-1 font-mono text-[10px] opacity-70">{count}</span></button>;
      })}
      {unclassified > 0 && <button type="button" aria-pressed={value === "unclassified"} onClick={() => onChange("unclassified")} className={`shrink-0 whitespace-nowrap ${value === "unclassified" ? "btn-primary" : "btn-secondary"}`}>Unclassified <span className="ml-1 font-mono text-[10px] opacity-70">{unclassified}</span></button>}
    </div>
  );
}

/** The grey of an empty category or subcategory: still listed and clickable, a little quieter. */
export const EMPTY_ROW = "opacity-55 hover:opacity-100";

/** Plugin counts per category id and per subcategory id, from the plugins' primary domain. */
export function domainCounts(plugins: Plugin[]): { byCategory: Map<string, number>; bySub: Map<string, number> } {
  const byCategory = new Map<string, number>();
  const bySub = new Map<string, number>();
  for (const plugin of plugins) {
    if (plugin.domain === undefined) continue;
    bySub.set(plugin.domain, (bySub.get(plugin.domain) ?? 0) + 1);
    const category = plugin.domain.split("-")[0];
    byCategory.set(category, (byCategory.get(category) ?? 0) + 1);
  }
  return { byCategory, bySub };
}

/** All 100 categories and their subcategories with their codes (01, 01-01) as on acrylblends.github.io/blends; the empty ones are greyed a little, never hidden. A plugin without a domain is counted as unclassified. */
export function DomainTree({ catalog, plugins }: { catalog?: Catalog; plugins: Plugin[] }) {
  // Open on a desktop where it sits beside the list; folded on a phone, where 100 categories would push the list off the screen.
  const [open, setOpen] = useState(() => typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches);
  const { byCategory, bySub } = domainCounts(plugins);
  const withoutDomain = plugins.filter((plugin) => plugin.domain === undefined).length;
  const categories = catalog?.categories ?? [];
  return (
    <aside aria-label="Browse by domain" className="min-w-0">
      <details open={open} onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Browse by domain{categories.length > 0 ? ` (${categories.length})` : ""}</summary>
      {categories.length === 0 ? (
        <p className="mt-4 border border-dashed border-border p-4 text-sm leading-6 text-muted-foreground">Reading the domains.</p>
      ) : (
        <div className="mt-4 max-h-[60vh] overflow-y-auto overscroll-contain pr-1 lg:max-h-[75vh]" data-test="domain-tree">
          {categories.map((category) => {
            const count = byCategory.get(category.id) ?? 0;
            return (
              <details key={category.id} open={count > 0} className={`border-b border-border/60 py-1.5 ${count === 0 ? EMPTY_ROW : ""}`} data-empty={count === 0 ? "true" : undefined}>
                <summary className="flex cursor-pointer items-baseline gap-2 font-mono text-xs font-semibold text-foreground"><span className="w-6 shrink-0 text-[10px] font-normal text-muted-foreground">{category.id}</span><span className="min-w-0 flex-1">{category.name}</span>{count > 0 && <span className="font-normal text-muted-foreground">{count}</span>}</summary>
                <ul className="mb-2 ml-8 mt-2 space-y-1.5">
                  <li><Link to={`/plugins/${category.slug}`} className="text-xs text-primary hover:underline">All of {category.name}</Link></li>
                  {category.subcategories.map((sub) => {
                    const subCount = bySub.get(sub.id) ?? 0;
                    return <li key={sub.id} className={subCount === 0 ? EMPTY_ROW : ""} data-empty={subCount === 0 ? "true" : undefined}><Link to={`/plugins/${category.slug}/${sub.slug}`} className="flex items-baseline justify-between gap-2 text-sm text-muted-foreground hover:text-primary"><span className="flex min-w-0 gap-2"><span className="w-10 shrink-0 font-mono text-[10px]">{sub.id}</span><span className="min-w-0">{sub.name}</span></span>{subCount > 0 && <span className="font-mono text-[10px]">{subCount}</span>}</Link></li>;
                  })}
                </ul>
              </details>
            );
          })}
        </div>
      )}
      {withoutDomain > 0 && <p className="mt-5 border-t border-border pt-4 font-mono text-[11px] text-muted-foreground">Unclassified <span className="text-foreground">{withoutDomain}</span></p>}
      </details>
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
