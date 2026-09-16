import { useParams } from "react-router-dom";
import { ContentLayout, Article } from "../components/content-layout";
import { usePageMeta } from "../components/layouts";
import { docContent } from "../lib/doc-content";
import { docsGroups, slugify } from "../lib/registry-data";

export default function DocPage() {
  const { group: groupSlug, item } = useParams<{ group: string; item?: string }>();
  const group = docsGroups.find((g) => g.slug === groupSlug) ?? docsGroups[0]!;
  const title = group.items.find((i) => slugify(i) === item) ?? group.title;
  usePageMeta(title, `Cordis Plugins documentation: ${title}.`);
  const nav = docsGroups.flatMap((g) => g.items.map((x) => ({ label: x, to: `/docs/${g.slug}/${slugify(x)}` })));
  return (
    <ContentLayout label="Documentation" title={group.title} description="Practical guidance for authors building on the Cordis protocol." nav={nav}>
      <Article group={group.title} title={title} entry={item ? docContent[`${group.slug}/${item}`] : undefined} exploratory={group.slug === "composition" && item === "nesting-and-grouping"} />
    </ContentLayout>
  );
}
