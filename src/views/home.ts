import { allLessons, lessonsOf } from "../content.ts"
import { currentLocale, t } from "../i18n.ts"
import { REPO_URL } from "../site.ts"
import { modules } from "../modules.ts"
import { completedCount, isCompleted } from "../progress.ts"

export function renderHome(): string {
  const locale = currentLocale()
  const lessons = allLessons()
  const allPaths = lessons.map((lesson) => lesson.path)
  const done = completedCount(allPaths)
  const next = lessons.find((lesson) => !isCompleted(lesson.path))

  const cards = modules
    .map((courseModule, index) => {
      const written = lessonsOf(courseModule.id)
      const total = written.length + courseModule.planned.length
      const first = written[0]
      const status =
        written.length === 0
          ? t("home.comingSoon")
          : t("home.moduleProgress", {
              done: completedCount(written.map((lesson) => lesson.path)),
              total,
            })

      return `
        <article class="card" data-testid="home-module-card">
          <p class="card-eyebrow">${t("home.module", { number: index })}</p>
          <h2>${courseModule.title[locale]}</h2>
          <p>${courseModule.description[locale]}</p>
          <p class="card-footer">
            <span data-testid="home-module-status">${status}</span>
            ${first ? `<a href="#${first.path}">${t("home.open")}</a>` : ""}
          </p>
        </article>`
    })
    .join("")

  return `
    <section class="page">
      <h1 data-testid="home-title">${t("home.title")}</h1>
      <p class="lead">
        ${t("home.lead")}
      </p>
      <p class="progress" data-testid="home-progress">
        ${t("home.progress", { done, total: allPaths.length })}
        ${next ? `· <a href="#${next.path}" data-testid="home-continue">${t("home.continue", { title: next.title })}</a>` : ""}
      </p>
      <div class="cards">${cards}</div>
      <p class="home-github">
        <a href="${REPO_URL}" target="_blank" rel="noreferrer" data-testid="home-github">${t("home.github")} →</a>
      </p>
    </section>`
}
