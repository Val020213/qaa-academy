import { allLessons, renderMarkdown, type Lesson } from "../content.ts"
import { currentLocale, t } from "../i18n.ts"
import { modules } from "../modules.ts"
import { isCompleted, toggleCompleted } from "../progress.ts"

export function renderLesson(lesson: Lesson): string {
  const courseModule = modules.find((item) => item.id === lesson.moduleId)
  const lessons = allLessons()
  const index = lessons.findIndex((item) => item.path === lesson.path)
  const previous = lessons[index - 1]
  const next = lessons[index + 1]
  const done = isCompleted(lesson.path)

  return `
    <article class="page lesson">
      <p class="card-eyebrow" data-testid="lesson-module">
        ${courseModule?.title[currentLocale()] ?? ""}${lesson.duration ? ` · ${lesson.duration}` : ""}
      </p>
      <h1 data-testid="lesson-title">${lesson.title}</h1>
      ${lesson.summary ? `<p class="lead">${lesson.summary}</p>` : ""}

      <div class="prose" data-testid="lesson-content">${renderMarkdown(lesson.body)}</div>

      <footer class="lesson-footer">
        <button type="button" class="button ${done ? "button-done" : ""}"
                aria-pressed="${done}" data-lesson="${lesson.path}"
                data-testid="lesson-complete-toggle">
          ${done ? t("lesson.completed") : t("lesson.complete")}
        </button>
        <nav class="lesson-nav">
          ${previous ? `<a href="#${previous.path}" data-testid="lesson-previous">← ${previous.title}</a>` : "<span></span>"}
          ${next ? `<a href="#${next.path}" data-testid="lesson-next">${next.title} →</a>` : ""}
        </nav>
      </footer>
    </article>`
}

// One listener for every "Mark as completed" button: the click travels up
// the DOM to `document`, and here we check where it came from.
document.addEventListener("click", (event) => {
  const target = event.target as HTMLElement
  const button = target.closest<HTMLButtonElement>(
    '[data-testid="lesson-complete-toggle"]'
  )
  const lessonPath = button?.dataset.lesson
  if (!lessonPath) return

  toggleCompleted(lessonPath)
  const scroll = window.scrollY
  window.dispatchEvent(new Event("progress-changed"))
  window.scrollTo(0, scroll)
})
