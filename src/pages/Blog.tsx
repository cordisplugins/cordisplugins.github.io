import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { PageIntro, usePageMeta } from "../components/layouts";
import { Status } from "../components/ui";
import { posts } from "../lib/blog";

export default function Blog() {
  usePageMeta("Blog", "Release notes, engineering notes and thinking from the Cordis plugin registry.");
  return (
    <>
      <PageIntro eyebrow="Notes from the registry" title="What we are learning as the registry grows." description="Release notes, engineering write-ups, and clear accounts of what is — and is not — ready." />
      <section className="mx-auto max-w-[1100px] px-6 py-14 lg:px-8">
        <div className="border-t border-border">{posts.map((p) => <Link key={p.slug} to={`/blog/${p.slug}`} className="group grid gap-4 border-b border-border py-8 md:grid-cols-[160px_1fr_auto]"><div><Status>{p.tag}</Status><p className="mt-3 font-mono text-[10px] text-muted-foreground">{p.date}</p></div><div><h2 className="text-2xl font-semibold group-hover:text-primary">{p.title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{p.excerpt}</p></div><ArrowRight className="self-center transition-transform group-hover:translate-x-1" size={20} /></Link>)}</div>
      </section>
    </>
  );
}
