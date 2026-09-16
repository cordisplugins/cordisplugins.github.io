import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { Header, Footer } from "./site-chrome";

export function SiteLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-background text-foreground"><Header/><main>{children}</main><Footer/></div>;
}
export function PageIntro({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description: string; actions?: ReactNode }) {
  return <div className="border-b border-border bg-surface-2"><div className="mx-auto max-w-[1440px] px-6 py-14 lg:px-8 lg:py-20"><p className="mb-5 font-mono text-xs uppercase text-primary">{eyebrow}</p><h1 className="max-w-4xl font-display text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-6xl">{title}</h1><p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">{description}</p>{actions && <div className="mt-8 flex flex-wrap gap-3">{actions}</div>}</div></div>;
}
export function Breadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  return <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">{items.map((x, i) => <span key={x.label} className="flex items-center gap-1.5">{i > 0 && <ArrowRight size={11}/>} {x.to ? <Link to={x.to} className="hover:text-foreground">{x.label}</Link> : <span className="text-foreground">{x.label}</span>}</span>)}</nav>;
}
// Client-side <head> management: GitHub Pages has no per-route server render.
export function usePageMeta(title: string, description: string) {
  useEffect(() => {
    document.title = `${title} — Cordis Plugins`;
    document.querySelector('meta[name="description"]')?.setAttribute("content", description);
  }, [title, description]);
}
