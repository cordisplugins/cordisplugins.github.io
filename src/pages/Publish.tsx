import { CheckCircle2 } from "lucide-react";
import { ContentLayout } from "../components/content-layout";
import { usePageMeta } from "../components/layouts";
import { CopyCommand } from "../components/ui";

const nav = [
  { label: "Checklist", to: "/publish" },
  { label: "How listing works", to: "/publish/how-listing-works" },
  { label: "Acryl-package convention", to: "/publish/acryl-package-convention" },
  { label: "Updating", to: "/publish/updating" },
  { label: "Unpublishing", to: "/publish/unpublishing" },
];

export default function Publish() {
  usePageMeta("Publish a Plugin", "Prepare, publish, and list a Cordis plugin.");
  return (
    <ContentLayout label="Publishing / Guide" title="Publish your plugin" description="Move a tested local plugin into the public registry with clear metadata and compatibility." nav={nav}>
      <div className="max-w-3xl">
        <h2 className="font-display text-3xl font-semibold">Before you publish</h2>
        <div className="my-8 grid gap-3 sm:grid-cols-2">{["README documents the capability", "License is declared", "Compatibility tier is explicit", "Version follows semver", "Capability category is tagged", "Effects dispose cleanly"].map((x) => <div key={x} className="flex gap-3 border border-border p-4 text-sm"><CheckCircle2 size={20} className="text-primary" />{x}</div>)}</div>
        <h2 className="mt-12 font-display text-3xl font-semibold">Release with pnpm</h2>
        <p className="my-5 text-muted-foreground">Use pnpm, not npm, so workspace-protocol dependencies (<code>workspace:*</code>) get rewritten to real semver ranges before the package leaves your workspace. This is the exact mistake that blocked this ecosystem's own first plugin release.</p>
        <CopyCommand command="pnpm publish --access public" />
        <div className="mt-10 border-l-2 border-primary bg-surface-2 p-5 text-sm leading-6"><b>Listing policy is still being finalized.</b> This portal shows whether a package is automatically indexed or awaiting review without implying a policy before it exists.</div>
      </div>
    </ContentLayout>
  );
}
