import { Routes, Route } from "react-router-dom";
import { SiteLayout } from "./components/layouts";
import Home from "./pages/Home";
import PluginsIndex from "./pages/PluginsIndex";
import PluginsCategory from "./pages/PluginsCategory";
import PluginDetail from "./pages/PluginDetail";
import DocsIndex from "./pages/DocsIndex";
import DocPage from "./pages/DocPage";
import Publish from "./pages/Publish";
import PublishPage from "./pages/PublishPage";
import Ecosystem from "./pages/Ecosystem";
import EcosystemPage from "./pages/EcosystemPage";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <SiteLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/plugins" element={<PluginsIndex />} />
        <Route path="/plugins/p/:pluginSlug" element={<PluginDetail />} />
        <Route path="/plugins/:category" element={<PluginsCategory />} />
        <Route path="/docs" element={<DocsIndex />} />
        <Route path="/docs/:group/:item" element={<DocPage />} />
        <Route path="/docs/:group" element={<DocPage />} />
        <Route path="/publish" element={<Publish />} />
        <Route path="/publish/:page" element={<PublishPage />} />
        <Route path="/ecosystem" element={<Ecosystem />} />
        <Route path="/ecosystem/:page" element={<EcosystemPage />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </SiteLayout>
  );
}
