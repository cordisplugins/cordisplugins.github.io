import { Link } from "react-router-dom";
import { CircleDot, Hexagon, Layers3, Package, type LucideIcon } from "lucide-react";
import { PageIntro, usePageMeta } from "../components/layouts";
import { SectionHeading } from "../components/ui";
import { plugins } from "../lib/registry-data";

const layers: { icon: LucideIcon; title: string; description: string }[] = [
  { icon: Package, title: "Cordis plugin", description: "A minimal service, tool, or interface contribution — this registry." },
  { icon: Layers3, title: "ACRYL Blend", description: "A composed, runnable environment made from plugins." },
  { icon: Hexagon, title: "Blend registry", description: "acrylblends.github.io — discovery for complete product-level compositions." },
];

export default function Ecosystem() {
  usePageMeta("Ecosystem", "See how Cordis plugins connect to ACRYL and ACRYL Blends, and to DeepSeek Harness.");
  const acrylCount = plugins.filter((p) => p.publisher === "acryldev").length;
  return (
    <>
      <PageIntro eyebrow="Ecosystem / Map" title="Common ground for composable AI systems" description="Cordis is the protocol layer shared by ACRYL and compatible DeepSeek Harness environments. The registry stays neutral, open, and useful to both." />
      <div className="mx-auto max-w-[1440px] px-6 py-16 lg:px-8">
        <SectionHeading index="01" title="The three layers" />
        <div className="grid border border-border md:grid-cols-3">{layers.map(({ icon: Icon, title, description }) => <div key={title} className="border-b border-border p-7 last:border-0 md:border-b-0 md:border-r md:last:border-r-0"><Icon size={28} className="text-primary" /><h2 className="mt-10 font-display text-2xl font-semibold">{title}</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p></div>)}</div>

        <div className="mt-20 grid gap-12 lg:grid-cols-2">
          <section>
            <SectionHeading index="02" title="How Cordis powers ACRYL and ACRYL Blends" description={`${acrylCount} of the plugins in this registry are real, currently-loaded parts of the acryl.dev product.`} />
            <div className="grid gap-3">
              <Link to="/ecosystem/how-cordis-powers-acryl" className="border border-border p-5 hover:border-primary"><h3 className="font-mono font-semibold">acryl.dev</h3><p className="mt-2 text-sm text-muted-foreground">How the coding-agent product itself is just a Cordis Loader composition.</p></Link>
              <Link to="/ecosystem/how-cordis-powers-acryl-blends" className="border border-border p-5 hover:border-primary"><h3 className="font-mono font-semibold">ACRYL Blends</h3><p className="mt-2 text-sm text-muted-foreground">How every plugin here is an ingredient a Blend manifest can name.</p></Link>
              <Link to="/ecosystem/philosophy" className="border border-border p-5 hover:border-primary"><h3 className="font-mono font-semibold">Philosophy</h3><p className="mt-2 text-sm text-muted-foreground">Why Cordis treats software as small, disposable, replaceable cells.</p></Link>
            </div>
          </section>
          <section>
            <SectionHeading index="03" title="Governance & roadmap" />
            <div className="space-y-4">{["Review and moderation workflow — policy open", "Download-count telemetry — not yet live", "Dependents graph — modeled, awaiting registry data", "Namespace disputes — resolution policy in design"].map((x) => <p key={x} className="flex gap-3 border-b border-border pb-4 text-sm"><CircleDot size={16} className="mt-0.5 shrink-0 text-primary" />{x}</p>)}</div>
            <Link to="/ecosystem/governance-and-roadmap" className="mt-5 inline-block text-sm font-semibold text-primary">Full governance and roadmap page →</Link>
            <p className="mt-7 text-sm leading-6 text-muted-foreground">The public registry remains free and open. Private registries, enterprise plugins, and implementation consulting can support teams without restricting the community layer.</p>
          </section>
        </div>
      </div>
    </>
  );
}
