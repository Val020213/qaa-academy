// Light and dark theme. The choice is saved in localStorage and applied to the
// <html> element in two ways:
//   - data-theme="light" or "dark": our tests read this attribute.
//   - the class "dark": shadcn/ui and Tailwind use it for their dark colours.
// The site starts in light.
//
// A tiny script in index.html applies the saved theme before the page is
// drawn, so a dark-theme reader never sees a white flash.

export type Theme = "light" | "dark"

const STORAGE_KEY = "qaa-academy:theme"

export function currentTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light"
}

/** Applies the theme to <html> and saves it. */
export function setTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme
  document.documentElement.classList.toggle("dark", theme === "dark")
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // No storage available: the theme lasts until the page is reloaded.
  }
}
