import { Link, useLocation } from "react-router-dom";
import { ExternalLink, Github, Menu, Search, X } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "./theme-toggle";

const nav = [["Home", "/"], ["Browse Plugins", "/plugins"], ["Docs", "/docs"], ["Publish", "/publish"], ["Ecosystem", "/ecosystem"], ["Blog", "/blog"]] as const;

export function CordisBrand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <img src="/logo/mark.png" alt="Cordis" className="h-9 w-9 object-contain" />
      {!compact && (
        <div className="leading-none">
          <span className="block font-display text-[15px] font-bold uppercase text-foreground">Cordis</span>
          <span className="mt-1 block font-mono text-[9px] uppercase text-muted-foreground">Plugin Registry</span>
        </div>
      )}
    </div>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = useLocation().pathname;
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link to="/" aria-label="Cordis Plugins home" className="shrink-0"><CordisBrand /></Link>
        <nav className="hidden h-full items-center gap-1 lg:flex">
          {nav.map(([label, to]) => <Link key={to} to={to} className={`nav-link ${pathname === to || (to !== "/" && pathname.startsWith(to)) ? "nav-link-active" : ""}`}>{label}</Link>)}
        </nav>
        <div className="ml-auto hidden items-center gap-2 sm:flex">
          <Link to="/plugins" aria-label="Search plugins" className="icon-button"><Search size={18}/></Link>
          <ThemeToggle/>
          <a href="https://github.com/cordisplugins" target="_blank" rel="noreferrer" aria-label="Cordis on GitHub" className="icon-button"><Github size={18}/></a>
          <Link to="/publish" className="btn-primary">Publish a plugin</Link>
        </div>
        <button className="icon-button ml-auto lg:hidden" onClick={() => setOpen(!open)} aria-label="Toggle navigation">{open ? <X/> : <Menu/>}</button>
      </div>
      {open && <nav className="grid border-t border-border bg-background px-4 py-3 lg:hidden">{nav.map(([label, to]) => <Link key={to} to={to} onClick={() => setOpen(false)} className="border-b border-border/60 py-3 text-sm">{label}</Link>)}</nav>}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface-2">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-6 py-14 md:grid-cols-[1.5fr_repeat(3,1fr)] lg:px-8">
        <div><CordisBrand /><p className="mt-5 max-w-sm text-sm leading-6 text-muted-foreground">Open community infrastructure for discovering the smallest building blocks of Cordis-compatible systems.</p></div>
        <FooterGroup title="Registry" links={[["Browse plugins", "/plugins"], ["Publish", "/publish"], ["Blog", "/blog"]]} />
        <FooterGroup title="Learn" links={[["Documentation", "/docs"], ["Ecosystem", "/ecosystem"], ["Compatibility", "/docs/compatibility/compatibility-tiers"]]} />
        <div>
          <p className="mb-4 font-mono text-xs uppercase text-muted-foreground">Community</p>
          {[["acryl.dev — the product", "https://acryl.dev"], ["ACRYL Blends — the Blend registry", "https://acrylblends.github.io"], ["acryldev/acryl — source", "https://github.com/acryldev/acryl"], ["cordisplugins (org)", "https://github.com/cordisplugins"], ["DeepSeek Harness Cordis tutorial", "https://deepseek-harness.github.io/deepseek-harness/en/develop/cordis-tutorial/"]].map(([label, href]) => <a key={label} href={href} target="_blank" rel="noreferrer" className="mb-3 flex items-center gap-1.5 text-sm text-foreground hover:text-primary">{label}<ExternalLink size={12} /></a>)}
        </div>
      </div>
      <div className="border-t border-border px-6 py-5"><div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 font-mono text-[10px] uppercase text-muted-foreground"><span>Community registry · Open infrastructure</span><span>Protocol first. Composition ready.</span></div></div>
    </footer>
  );
}
function FooterGroup({ title, links }: { title: string; links: [string, string][] }) {
  return <div><p className="mb-4 font-mono text-xs uppercase text-muted-foreground">{title}</p>{links.map(([label, to]) => <Link key={to} to={to} className="mb-3 block text-sm hover:text-primary">{label}</Link>)}</div>;
}
