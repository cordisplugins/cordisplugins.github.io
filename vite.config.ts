import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { copyFileSync } from "node:fs";
import { resolve } from "node:path";

// GitHub Pages serves this repo at the domain root (a <user>.github.io "user
// site" repo, not a project-pages subpath), so base stays "/".
export default defineConfig({
  base: "/",
  plugins: [
    react(),
    tailwindcss(),
    {
      // GitHub Pages has no server-side rewrite for a client-routed SPA, so
      // any deep link (e.g. /plugins/services) 404s on a hard reload unless
      // a 404.html exists. Serving a copy of index.html as 404.html is the
      // standard SPA-on-Pages workaround: Pages falls back to it, and the
      // app's own router then resolves the real path client-side.
      name: "copy-index-to-404",
      closeBundle() {
        copyFileSync(resolve(__dirname, "dist/index.html"), resolve(__dirname, "dist/404.html"));
      },
    },
  ],
  resolve: { alias: { "@": resolve(__dirname, "src") } },
});
