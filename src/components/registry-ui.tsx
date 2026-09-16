import { Link } from "react-router-dom";
import { Lock, Package } from "lucide-react";
import type { Plugin } from "../lib/registry-data";
import { CompatibilityBadge } from "./ui";

export function PluginCard({ plugin }: { plugin: Plugin }) {
  return (
    <Link to={`/plugins/p/${plugin.slug}`} className="group flex min-h-64 flex-col border border-border bg-card p-5 transition-colors hover:border-primary/70 hover:bg-surface-2">
      <div className="mb-8 flex items-start justify-between gap-4">
        <span className="grid h-10 w-10 place-items-center border border-border bg-background text-primary"><Package size={20} /></span>
        <div className="flex flex-col items-end gap-1.5"><CompatibilityBadge value={plugin.compatibility} />{plugin.private && <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase text-muted-foreground"><Lock size={10}/>Not yet loadable</span>}</div>
      </div>
      <h2 className="font-mono text-base font-semibold text-foreground group-hover:text-primary">{plugin.name}</h2>
      <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">{plugin.summary}</p>
      <div className="mt-6 flex items-center justify-between border-t border-border pt-4 font-mono text-[11px] text-muted-foreground"><span>@{plugin.publisher}</span>{plugin.acrylPackage && <span className="text-primary">acryl-package</span>}</div>
    </Link>
  );
}
