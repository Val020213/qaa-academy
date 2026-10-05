// Entry point. Decides which view to show, based on the part of the URL that
// comes after `#` (for example `#/lesson/01-programming/05-functions`).

import "@fontsource-variable/geist"
import "@fontsource-variable/geist-mono"
import "./styles.css"
import { findLesson } from "./content.ts"
import { currentLocale, setLocale, t } from "./i18n.ts"
import { githubIcon, icon } from "./icons.ts"
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
      <a class="icon-button" href="${REPO_URL}" target="_blank" rel="noreferrer" data-testid="topbar-github">${githubIcon}</a>
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
  localeToggle.innerHTML = `${icon("languages")}<span>${currentLocale() === "en" ? "ES" : "EN"}</span>`
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
