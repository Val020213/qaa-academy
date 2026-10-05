// Light and dark theme. The choice is saved in localStorage and applied as
// `data-theme="light"` or `data-theme="dark"` on the <html> element; the CSS
// in styles.css reads that attribute. The site starts in light.
//
// A tiny script in index.html applies the saved theme before the page is
// drawn, so a dark-theme reader never sees a white flash.

import { t } from "./i18n.ts"

export type Theme = "light" | "dark"

const STORAGE_KEY = "qaa-academy:theme"

export function currentTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light"
}

/** Switches to the other theme, saves it and returns the new value. */
export function toggleTheme(): Theme {
  const next: Theme = currentTheme() === "dark" ? "light" : "dark"
  document.documentElement.dataset.theme = next
  try {
    localStorage.setItem(STORAGE_KEY, next)
  } catch {
    // No storage available: the theme lasts until the page is reloaded.
  }
  return next
}

const SUN = `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><circle cx="8" cy="8" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`
const MOON = `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M13.5 9.6A5.75 5.75 0 0 1 6.4 2.5a5.75 5.75 0 1 0 7.1 7.1Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`

/** Draws the button for the current theme: it shows what a click will give you. */
export function paintThemeToggle(button: HTMLButtonElement): void {
  const dark = currentTheme() === "dark"
  button.innerHTML = dark ? SUN : MOON
  const label = dark ? t("theme.toLight") : t("theme.toDark")
  button.setAttribute("aria-label", label)
  button.title = label
}
