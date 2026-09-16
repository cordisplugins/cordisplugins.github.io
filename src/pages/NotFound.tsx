import { Link } from "react-router-dom";

export default function NotFound() {
  return <div className="mx-auto max-w-[1440px] px-6 py-24 text-center"><h1 className="font-display text-4xl">Package not found</h1><p className="mt-4 text-muted-foreground">The page may have moved, or this part of the registry hasn't been indexed yet.</p><Link to="/plugins" className="btn-primary mt-8 inline-flex">Return to registry</Link></div>;
}
