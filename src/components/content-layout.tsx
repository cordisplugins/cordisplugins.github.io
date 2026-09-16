import { Link } from "react-router-dom";
import { ArrowRight, CircleDot } from "lucide-react";
import type { ReactNode } from "react";
import type { DocEntry } from "../lib/doc-content";
import { CodeBlock, Status } from "./ui";
import { Breadcrumbs } from "./layouts";

export function ContentLayout({ label, title, description, nav, children }: { label: string; title: string; description: string; nav: { label: string; to: string }[]; children: ReactNode }) {
  return (
    <>
      <div className="border-b border-border bg-surface-2"><div className="mx-auto max-w-[1440px] px-6 py-14 lg:px-8"><p className="font-mono text-xs uppercase text-primary">{label}</p><h1 className="mt-5 max-w-4xl font-display text-4xl font-semibold sm:text-6xl">{title}</h1><p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">{description}</p></div></div>
      <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[250px_1fr]">
        <aside className="border-b border-border p-6 lg:border-b-0 lg:border-r lg:p-8"><p className="mb-4 font-mono text-[10px] uppercase text-muted-foreground">In this section</p><nav className="grid gap-1">{nav.map((item) => <Link key={item.to} to={item.to} className="flex items-center justify-between border-l border-border px-3 py-2 text-sm text-muted-foreground hover:border-primary hover:text-foreground">{item.label}<ArrowRight size={12}/></Link>)}</nav></aside>
        <article className="min-w-0 px-6 py-12 lg:px-14 lg:py-16">{children}</article>
      </div>
    </>
  );
}

export function Article({ group, title, entry, exploratory = false }: { group: string; title: string; entry?: DocEntry; exploratory?: boolean }) {
  return (
    <article className="max-w-3xl">
      <Breadcrumbs items={[{ label: "Docs", to: "/docs" }, { label: group }, { label: title }]} />
      {exploratory && <div className="mt-8"><Status tone="warning">Exploratory · not stable</Status></div>}
      <h1 className="mt-6 font-display text-4xl font-semibold leading-tight md:text-6xl">{title}</h1>
      {entry
        ? <>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">{entry.intro}</p>
            <div className="prose-cordis">{entry.body.map((section, i) => <div key={i}>{section.heading && <h2>{section.heading}</h2>}{section.paragraphs.map((p, j) => <p key={j}>{p}</p>)}{section.note && <div className="doc-note"><strong>Note</strong><p>{section.note}</p></div>}</div>)}</div>
            {entry.code && <div className="mt-8"><CodeBlock label={entry.code.label} code={entry.code.code} /></div>}
          </>
        : <div className="prose-cordis"><h2>Overview</h2><p>Cordis keeps capabilities explicit and composable. Each plugin is loaded into its own Fiber, owns its effects, and can be replaced safely during development.</p><div className="doc-note"><strong>Status</strong><p>This page's detailed content is still being written.</p></div><h3>Core pattern</h3><pre><code>{`export default function apply(ctx: Context) {\n  const service = ctx.inject(['database'])\n  ctx.effect(() => service.start())\n}`}</code></pre><h3>Next steps</h3>{["Define one clear capability boundary", "Declare required and optional dependencies", "Verify startup, disposal, and hot reload"].map((x) => <p key={x} className="flex items-center gap-3"><CircleDot size={16} className="text-primary" />{x}</p>)}</div>}
      <div className="mt-14 flex justify-end border-t border-border pt-6"><Link to="/docs" className="group flex items-center gap-3 text-sm font-semibold">Back to documentation <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" /></Link></div>
    </article>
  );
}
