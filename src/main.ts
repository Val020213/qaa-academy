// Entry point. Decides which view to show, based on the part of the URL that
// comes after `#` (for example `#/lesson/01-programming/05-functions`).

import "@fontsource-variable/geist"
import "@fontsource-variable/geist-mono"
import "./styles.css"
import { findLesson } from "./content.ts"
import { currentLocale, setLocale, t } from "./i18n.ts"
import { REPO_URL } from "./site.ts"
import { renderHome } from "./views/home.ts"
import { mountLessonToc, renderLesson } from "./views/lesson.ts"
import { mountPlayground, renderPlayground } from "./views/playground.ts"
import { paintThemeToggle, toggleTheme } from "./theme.ts"
import { renderSidebar } from "./views/sidebar.ts"

const app = document.querySelector<HTMLDivElement>("#app")
if (!app) throw new Error('The <div id="app"> element is missing in index.html')

app.innerHTML = `
  <header class="topbar" data-testid="topbar">
    <a class="brand" href="#/" data-testid="topbar-home">QAA Academy</a>
    <nav>
      <a href="#/" data-testid="topbar-course"></a>
      <a href="#/practice" data-testid="topbar-playground"></a>
      <a class="icon-button" href="${REPO_URL}" target="_blank" rel="noreferrer" data-testid="topbar-github"><svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M8 0a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.38v-1.33c-2.23.48-2.7-1.07-2.7-1.07-.36-.93-.89-1.17-.89-1.17-.73-.5.05-.49.05-.49.8.06 1.23.83 1.23.83.72 1.22 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.77-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.19c0 .21.15.46.55.38A8 8 0 0 0 8 0Z"/></svg></a>
      <button type="button" class="icon-button locale-button" data-testid="locale-toggle"></button>
      <button type="button" class="icon-button" data-testid="theme-toggle"></button>
    </nav>
  </header>
  <div class="layout">
    <aside class="sidebar" data-testid="sidebar"></aside>
    <main class="main" data-testid="main"></main>
  </div>
`

const sidebar = app.querySelector<HTMLElement>(".sidebar")!
const main = app.querySelector<HTMLElement>(".main")!

const themeToggle = app.querySelector<HTMLButtonElement>('[data-testid="theme-toggle"]')!
paintThemeToggle(themeToggle)
themeToggle.addEventListener("click", () => {
  toggleTheme()
  paintThemeToggle(themeToggle)
})

// The language button shows the language you will get when you click it.
const localeToggle = app.querySelector<HTMLButtonElement>('[data-testid="locale-toggle"]')!
localeToggle.addEventListener("click", () => {
  setLocale(currentLocale() === "en" ? "es" : "en")
  render()
})

/** Texts of the top bar. They are drawn again when the language changes. */
function paintTopbar(): void {
  app!.querySelector('[data-testid="topbar-course"]')!.textContent = t("nav.course")
  app!.querySelector('[data-testid="topbar-playground"]')!.textContent = t("nav.practice")
  const github = app!.querySelector<HTMLAnchorElement>('[data-testid="topbar-github"]')!
  github.setAttribute("aria-label", t("nav.github"))
  github.title = t("nav.github")
  localeToggle.textContent = currentLocale() === "en" ? "ES" : "EN"
  localeToggle.setAttribute("aria-label", t("locale.switch"))
  localeToggle.title = t("locale.switch")
  paintThemeToggle(themeToggle)
}

function currentPath(): string {
  return decodeURI(location.hash.replace(/^#/, "")) || "/"
}

function render(): void {
  const path = currentPath()
  const lesson = findLesson(path)

  if (path === "/") {
    main.innerHTML = renderHome()
  } else if (path === "/practice") {
    main.innerHTML = renderPlayground()
    mountPlayground(main)
  } else if (lesson) {
    main.innerHTML = renderLesson(lesson)
    mountLessonToc(main)
  } else {
    main.innerHTML = `
      <section class="page" data-testid="not-found">
        <h1>${t("notFound.title")}</h1>
        <p>${t("notFound.text", { path: `<code>${path.replace(/</g, "&lt;")}</code>` })}
        <a href="#/">${t("notFound.back")}</a>.</p>
      </section>`
  }

  paintTopbar()
  sidebar.innerHTML = renderSidebar(path)
  for (const link of app!.querySelectorAll<HTMLAnchorElement>(".topbar nav a:not(.icon-button)")) {
    const practice = link.getAttribute("href") === "#/practice"
    link.classList.toggle("active", practice === (path === "/practice"))
  }
  document.title = lesson ? `${lesson.title} · QAA Academy` : "QAA Academy"
  window.scrollTo(0, 0)
}

// The "Mark as completed" button sends this event so the side menu and the
// view are drawn again.
window.addEventListener("progress-changed", render)
window.addEventListener("hashchange", render)
render()
