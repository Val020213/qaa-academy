import { lessonsOf } from "../content.ts"
import { currentLocale } from "../i18n.ts"
import { icon } from "../icons.ts"
import { modules } from "../modules.ts"
import { isCompleted } from "../progress.ts"

export function renderSidebar(currentPath: string): string {
  const locale = currentLocale()
  return modules
    .map((courseModule, index) => {
      const written = lessonsOf(courseModule.id)
        .map((lesson) => {
          const active = lesson.path === currentPath
          const done = isCompleted(lesson.path)
          return `
            <li>
              <a href="#${lesson.path}"
                 class="${active ? "active" : ""} ${done ? "done" : ""}"
                 ${active ? 'aria-current="page"' : ""}
                 data-testid="sidebar-lesson-link"><span>${lesson.title}</span>${done ? icon("check", 14) : ""}</a>
            </li>`
        })
        .join("")

      const planned = courseModule.planned
        .map(
          (title) =>
            `<li><span class="planned" data-testid="sidebar-lesson-planned">${title}</span></li>`
        )
        .join("")

      return `
        <section class="sidebar-module" data-testid="sidebar-module">
          <h2><span class="module-number">${index}</span>${courseModule.title[locale]}</h2>
          <ul>${written}${planned}</ul>
        </section>`
    })
    .join("")
}
