import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "cordisplugins-theme";

/** Whatever index.html's inline anti-flash script already applied to <html>, read back as the initial state. */
function initialIsDark(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

/** Light/dark switch. State lives on <html>'s "dark" class (styles.css keys every color off it) and persists to localStorage; index.html's inline script applies the stored choice before paint so there is no flash on load or navigation. */
export function ThemeToggle() {
  const [dark, setDark] = useState(initialIsDark);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    try {
      localStorage.setItem(STORAGE_KEY, dark ? "dark" : "light");
    } catch {
      // Private browsing or storage disabled: the toggle still works for this load, it just won't persist.
    }
  }, [dark]);

  return (
    <button
      onClick={() => setDark(current => !current)}
      className="icon-button"
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      title={dark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
