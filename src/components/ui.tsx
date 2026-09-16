import { Check, Copy, ShieldCheck } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { Compatibility } from "../lib/registry-data";

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="font-mono text-xs font-semibold uppercase tracking-[0.1em] text-primary">{children}</p>;
}
export function SectionHeading({ index, title, description }: { index?: string; title: string; description?: string }) {
  return <div className="mb-8 flex items-start gap-4">{index && <span className="mt-1 font-mono text-xs text-primary">{index}</span>}<div><h2 className="font-display text-2xl font-semibold sm:text-3xl">{title}</h2>{description && <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">{description}</p>}</div></div>;
}
export function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);
  return <div className="flex min-w-0 items-center border border-border bg-code px-4 py-3 text-code-foreground"><code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap font-mono text-xs sm:text-sm">{command}</code><button aria-label="Copy command" className="icon-button ml-3 shrink-0 text-code-foreground" onClick={() => { navigator.clipboard?.writeText(command); setCopied(true); window.setTimeout(() => setCopied(false), 1500); }}>{copied ? <Check size={16}/> : <Copy size={16}/>}</button></div>;
}
export function CodeBlock({ label, code }: { label: string; code: string }) {
  const [copied, setCopied] = useState(false);
  return <div className="overflow-hidden border border-border bg-code text-code-foreground"><div className="flex h-11 items-center justify-between border-b border-border/40 px-4"><span className="font-mono text-xs opacity-70">{label}</span><button aria-label={`Copy ${label}`} className="icon-button text-code-foreground opacity-80 hover:opacity-100" onClick={() => { navigator.clipboard?.writeText(code); setCopied(true); window.setTimeout(() => setCopied(false), 1500); }}>{copied ? <Check size={15}/> : <Copy size={15}/>}</button></div><pre className="overflow-x-auto p-5 text-sm leading-7"><code>{code}</code></pre></div>;
}
export function CompatibilityBadge({ value }: { value: Compatibility }) {
  return <span className={`inline-flex items-center gap-1 border px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] ${value === "Both" ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"}`}><ShieldCheck size={12}/>{value}</span>;
}
export function Status({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "warning" | "success" }) {
  return <span className={`inline-flex rounded-sm border px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] ${tone === "warning" ? "border-warning/30 bg-warning/10 text-warning" : tone === "success" ? "border-success/30 bg-success/10 text-success" : "border-border bg-muted text-muted-foreground"}`}>{children}</span>;
}
