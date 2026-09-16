import { Link, useParams } from "react-router-dom";
import { PageIntro, usePageMeta } from "../components/layouts";
import { Breadcrumbs } from "../components/layouts";
import { CodeBlock, Status } from "../components/ui";
import { ecosystemContent } from "../lib/doc-content";
import { plugins } from "../lib/registry-data";

export default function EcosystemPage() {
  const { page } = useParams();
  const raw = page ?? "philosophy";
  const entry = ecosystemContent[raw];
  const title = raw.replaceAll("-", " ").replace(/\b\w/g, (c) => c.toUpperCase());
  usePageMeta(title, entry?.intro ?? "How the Cordis Plugins ecosystem fits together.");
  const acrylPlugins = plugins.filter((p) => p.publisher === "acryldev" && p.compatibility !== "DSH stock");
  return (
    <>
      <PageIntro eyebrow="Ecosystem" title={title} description={entry?.intro ?? ""} />
      <div className="mx-auto max-w-[1000px] px-6 py-14 lg:px-8">
        <Breadcrumbs items={[{ label: "Ecosystem", to: "/ecosystem" }, { label: title }]} />
        <div className="prose-cordis mt-10 max-w-none">
          {entry?.body.map((section, i) => (
            <div key={i}>
              {section.heading && <h2>{section.heading}</h2>}
              {section.paragraphs.map((p, j) => <p key={j}>{p}</p>)}
              {section.note && <div className="doc-note"><strong>Note</strong><p>{section.note}</p></div>}
            </div>
          ))}
        </div>
        {raw === "how-cordis-powers-acryl" && (
          <div className="mt-12">
            <Status>Real ACRYL plugins in this registry</Status>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">{acrylPlugins.map((p) => <Link key={p.slug} to={`/plugins/p/${p.slug}`} className="border border-border p-4 hover:border-primary"><p className="font-mono text-sm font-semibold">{p.name}</p><p className="mt-1 text-xs text-muted-foreground">{p.summary}</p></Link>)}</div>
          </div>
        )}
        {raw === "how-cordis-powers-acryl-blends" && (
          <div className="mt-12">
            <CodeBlock label="blend.yml" code={`name: agent-workshop\nversion: 0.1.0\nruntime: cordis\nplugins:\n  - cordis\n  - cordis-plugin-market\n  - acryl-development-canvas`} />
            <a href="https://acrylblends.github.io" target="_blank" rel="noreferrer" className="btn-primary mt-6 inline-flex">Browse Blends on acrylblends.github.io</a>
          </div>
        )}
      </div>
    </>
  );
}
