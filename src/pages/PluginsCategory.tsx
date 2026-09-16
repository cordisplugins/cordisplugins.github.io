import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { categories, plugins } from "../lib/registry-data";
import { PageIntro, usePageMeta } from "../components/layouts";
import { PluginCard } from "../components/registry-ui";

export default function PluginsCategory() {
  const { category } = useParams();
  const current = categories.find((c) => c.slug === category);
  usePageMeta(current?.name ?? "Plugin category", `Browse Cordis plugins in ${current?.name ?? "this category"}.`);
  const list = plugins.filter((p) => p.category === category);
  return (
    <>
      <PageIntro eyebrow="Registry / Capability" title={current?.name ?? "Plugin category"} description={current?.description ?? "Cordis plugins grouped by extension point."} />
      <div className="mx-auto max-w-[1440px] px-6 py-14 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{list.map((p) => <PluginCard key={p.slug} plugin={p} />)}</div>
        {list.length === 0 && <div className="border border-dashed border-border bg-surface-2 p-12 text-center text-muted-foreground"><p>No plugins here yet — this is a real, addressable category waiting for its first package.</p><Link to="/publish" className="btn-primary mt-6 inline-flex">Be the first to publish one</Link></div>}
      </div>
    </>
  );
}
