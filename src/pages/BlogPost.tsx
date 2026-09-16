import { useParams } from "react-router-dom";
import { Breadcrumbs, usePageMeta } from "../components/layouts";
import { Status } from "../components/ui";
import { posts } from "../lib/blog";
import { plugins } from "../lib/registry-data";
import NotFound from "./NotFound";

export default function BlogPost() {
  const { slug } = useParams();
  const p = posts.find((x) => x.slug === slug);
  usePageMeta(p?.title ?? "Article", p?.excerpt ?? "Cordis Plugins article");
  if (!p) return <NotFound />;
  return (
    <article className="mx-auto max-w-3xl px-6 py-14 lg:px-8">
      <Breadcrumbs items={[{ label: "Blog", to: "/blog" }, { label: p.title }]} />
      <div className="mt-10 flex items-center gap-3"><Status>{p.tag}</Status><span className="font-mono text-[10px] text-muted-foreground">{p.date}</span></div>
      <h1 className="mt-6 font-display text-4xl font-semibold leading-tight md:text-6xl">{p.title}</h1>
      <p className="mt-6 text-xl leading-8 text-muted-foreground">{p.excerpt}</p>
      <div className="prose-cordis">
        {p.slug === "eleven-real-plugins" && <>
          <p>This registry launches with {plugins.length} real Cordis plugins already indexed: three living inside the acryldev/acryl monorepo, and the rest already transferred to their own repositories under github.com/cordisplugins.</p>
          <h2>What's here on day one</h2>
          <ul>{plugins.map((pl) => <li key={pl.slug}><code>{pl.name}</code> — {pl.summary}</li>)}</ul>
        </>}
        {p.slug === "why-a-separate-registry" && <>
          <p>Cordis plugin : npm :: Blend : Docker image :: Blend registry : Docker Hub. Merging the atom-level and Blend-level catalogs into one undifferentiated site would blur that distinction the first time someone had to decide whether a listing was "a plugin" or "a product."</p>
          <p>Keeping them separate also keeps this site's neutrality legible: a plugin author publishing here never has to think about ACRYL Blends at all.</p>
        </>}
        {p.slug === "the-row-id-rule" && <>
          <p><code>acryl-development-canvas</code> shipped for a time under the row id <code>desktop-development-canvas</code>. A sibling plugin's row id <code>dsh-editor</code> — for the package actually named <code>acryl-dsh-editor-plugin</code> — went undiscovered as opaque until it broke a real production boot.</p>
          <p>Both incidents are why this registry's own documentation states the rule plainly: a Loader row's id equals its package name by default, no exceptions without an explicit, named reason in the plugin's own mini-design.</p>
        </>}
      </div>
    </article>
  );
}
