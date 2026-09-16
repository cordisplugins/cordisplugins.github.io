import { Link } from "react-router-dom";
import { BookOpen, ChevronRight } from "lucide-react";
import { docsGroups, slugify } from "../lib/registry-data";
import { PageIntro, usePageMeta } from "../components/layouts";

export default function DocsIndex() {
  usePageMeta("Documentation", "Build, test, and publish lifecycle-safe Cordis plugins.");
  return (
    <>
      <PageIntro eyebrow="Documentation / v1" title="Build small. Compose freely." description="The authoring guide for creating lifecycle-safe plugins that work across the Cordis ecosystem — deliberately narrower than the ACRYL Blends docs, which own composing many plugins into one Blend." />
      <div className="mx-auto grid max-w-[1440px] gap-4 px-6 py-14 md:grid-cols-2 lg:px-8">
        {docsGroups.map((g, i) => (
          <section key={g.slug} className="border border-border bg-card p-6">
            <div className="flex items-center gap-3"><BookOpen size={20} className="text-primary" /><span className="font-mono text-[10px] text-muted-foreground">0{i + 1}</span></div>
            <h2 className="mt-6 font-display text-2xl font-semibold">{g.title}</h2>
            <div className="mt-5 grid">{g.items.map((item) => <Link key={item} to={`/docs/${g.slug}/${slugify(item)}`} className="flex items-center justify-between border-t border-border py-3 text-sm hover:text-primary">{item}<ChevronRight size={16} /></Link>)}</div>
          </section>
        ))}
      </div>
    </>
  );
}
