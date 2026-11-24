import { Link } from "react-router-dom";
import { Lock, Package } from "lucide-react";
import type { Origin, Plugin } from "../lib/registry-data";
import { useCatalog } from "../lib/catalog";
import { ClassificationBadge } from "./catalog-ui";
import { CompatibilityBadge } from "./ui";

export function PluginCard({ plugin }: { plugin: Plugin }) {
  const catalog = useCatalog();
  return (
    <Link to={`/plugins/p/${plugin.slug}`} className="group flex min-h-64 flex-col border border-border bg-card p-5 transition-colors hover:border-primary/70 hover:bg-surface-2">
      <div className="mb-8 flex items-start justify-between gap-4">
        <span className="grid h-10 w-10 place-items-center border border-border bg-background text-primary"><Package size={20} /></span>
        <div className="flex flex-col items-end gap-1.5"><OriginBadge origin={plugin.origin} /><CompatibilityBadge value={plugin.compatibility} />{plugin.private && <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase text-muted-foreground"><Lock size={10}/>Not yet loadable</span>}</div>
      </div>
      <h2 className="font-mono text-base font-semibold text-foreground group-hover:text-primary">{plugin.name}</h2>
      {plugin.placement && <p className="mt-2 font-mono text-[11px] text-muted-foreground">{[plugin.placement.category, plugin.placement.subcategory].filter(Boolean).join(" › ")}</p>}
      <ClassificationBadge plugin={plugin} catalog={catalog.state === "live" ? catalog.catalog : undefined} />
      <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">{plugin.summary}</p>
      <div className="mt-6 flex items-center justify-between border-t border-border pt-4 font-mono text-[11px] text-muted-foreground"><span>@{plugin.publisher}{plugin.version && <span className="ml-2 text-foreground">v{plugin.version}</span>}</span>{plugin.acrylPackage && <span className="text-primary">acryl-package</span>}</div>
    </Link>
  );
}

// The sync decides origin from the repo owner's numeric GitHub id (official-owners.json); nothing the author writes changes it.
export function OriginBadge({ origin }: { origin: Origin }) {
  return <span className={`inline-flex items-center border px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] ${origin === "official" ? "border-primary/60 text-primary" : "border-border bg-muted text-muted-foreground"}`}>{origin === "official" ? "Official" : "Community"}</span>;
}

export type OriginFilter = Origin | "all";
const originChoices: [OriginFilter, string][] = [["all", "All"], ["official", "Official"], ["community", "Community"]];

export function OriginChips({ value, onChange }: { value: OriginFilter; onChange: (value: OriginFilter) => void }) {
  return <div className="flex gap-2" role="group" aria-label="Who made it">{originChoices.map(([id, label]) => <button key={id} aria-pressed={value === id} onClick={() => onChange(id)} className={value === id ? "btn-primary" : "btn-secondary"}>{label}</button>)}</div>;
}

/** The plugins the filter keeps, official first, then newest. */
export function byOrigin(list: Plugin[], filter: OriginFilter): Plugin[] {
  return list
    .filter((p) => filter === "all" || p.origin === filter)
    .sort((a, b) => Number(b.origin === "official") - Number(a.origin === "official") || (b.published ?? "").localeCompare(a.published ?? ""));
}
