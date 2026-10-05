// Light and dark theme. The choice is saved in localStorage and applied as
// `data-theme="light"` or `data-theme="dark"` on the <html> element; the CSS
// in styles.css reads that attribute. The site starts in light.
//
// A tiny script in index.html applies the saved theme before the page is
// drawn, so a dark-theme reader never sees a white flash.

import { t } from "./i18n.ts"
import { icon } from "./icons.ts"

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


/** Draws the button for the current theme: it shows what a click will give you. */
export function paintThemeToggle(button: HTMLButtonElement): void {
  const dark = currentTheme() === "dark"
  button.innerHTML = dark ? icon("sun") : icon("moon")
  const label = dark ? t("theme.toLight") : t("theme.toDark")
  button.setAttribute("aria-label", label)
  button.title = label
}
