import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return <button
    className="theme-toggle"
    type="button"
    onClick={onToggle}
    aria-label={`Switch to ${dark ? "light" : "dark"} theme`}
    aria-pressed={dark}
    title={`Switch to ${dark ? "light" : "dark"} theme`}
  >
    {dark ? <Sun size={16} aria-hidden="true"/> : <Moon size={16} aria-hidden="true"/>}
    <span>{dark ? "Light" : "Dark"}</span>
  </button>;
}
