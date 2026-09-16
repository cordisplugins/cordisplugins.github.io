import { useParams } from "react-router-dom";
import { ContentLayout, Article } from "../components/content-layout";
import { usePageMeta } from "../components/layouts";
import { docContent, type DocEntry } from "../lib/doc-content";

const nav = [
  { label: "Checklist", to: "/publish" },
  { label: "How listing works", to: "/publish/how-listing-works" },
  { label: "Acryl-package convention", to: "/publish/acryl-package-convention" },
  { label: "Updating", to: "/publish/updating" },
  { label: "Unpublishing", to: "/publish/unpublishing" },
];

const publishContent: Record<string, DocEntry> = {
  "how-listing-works": {
    intro: "Publishing to npm (or your own registry) and appearing on this site are two separate steps, deliberately.",
    body: [{ paragraphs: [
      "A `pnpm publish` puts your package on npm. Being listed here additionally requires the package to carry accurate Cordis metadata — category, compatibility tier, provides/consumes. The review and moderation workflow for that listing step is still open policy, not yet decided; this page will be updated the moment it is, rather than implying a process that doesn't exist yet.",
    ]}],
  },
  "acryl-package-convention": docContent["compatibility/acryl-package-convention"]!,
  "updating": {
    intro: "Bump the version, publish again with pnpm, and the registry entry updates to the new metadata automatically.",
    body: [{ paragraphs: ["There is no separate \"update listing\" step — the published package's own manifest is the source of truth this registry reads from."] }],
  },
  "unpublishing": {
    intro: "Unpublishing follows npm's own unpublish rules and constraints; this registry reflects what npm reports.",
    body: [{ paragraphs: ["If your package depends on other published plugins, consider deprecating instead of unpublishing outright, so consumers get a clear signal rather than a broken install."] }],
  },
};

export default function PublishPage() {
  const { page } = useParams();
  const raw = page ?? "how-listing-works";
  const title = raw.replaceAll("-", " ").replace(/\b\w/g, (c) => c.toUpperCase());
  usePageMeta(title, "Publishing a Cordis plugin.");
  return (
    <ContentLayout label="Publishing / Guide" title="Publish your plugin" description="Move a tested local plugin into the public registry with clear metadata and compatibility." nav={nav}>
      <Article group="Publishing" title={title} entry={publishContent[raw]} />
    </ContentLayout>
  );
}
