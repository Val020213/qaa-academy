import { allLessons, lessonHeadings, renderMarkdown, type Lesson } from "../content.ts"
import { currentLocale, t } from "../i18n.ts"
import { icon } from "../icons.ts"
import { modules } from "../modules.ts"
import { isCompleted, toggleCompleted } from "../progress.ts"

export function renderLesson(lesson: Lesson): string {
  const courseModule = modules.find((item) => item.id === lesson.moduleId)
  const lessons = allLessons()
  const index = lessons.findIndex((item) => item.path === lesson.path)
  const previous = lessons[index - 1]
  const next = lessons[index + 1]
  const done = isCompleted(lesson.path)

  const headings = lessonHeadings(lesson.body)
    .map(
      (heading) =>
        `<li><button type="button" data-section="${heading.id}" data-testid="lesson-toc-link">${heading.text}</button></li>`
    )
    .join("")

  return `
    <div class="lesson-layout">
    <article class="page lesson">
      <p class="card-eyebrow" data-testid="lesson-module">
        ${courseModule?.title[currentLocale()] ?? ""}${lesson.duration ? `<span class="eyebrow-meta">${icon("clock", 14)}${lesson.duration}</span>` : ""}
      </p>
      <h1 data-testid="lesson-title">${lesson.title}</h1>
      ${lesson.summary ? `<p class="lead">${lesson.summary}</p>` : ""}

      <div class="prose" data-testid="lesson-content">${renderMarkdown(lesson.body)}</div>

      <footer class="lesson-footer">
        <button type="button" class="button ${done ? "button-done" : ""}"
                aria-pressed="${done}" data-lesson="${lesson.path}"
                data-testid="lesson-complete-toggle">
          ${icon("check")}${done ? t("lesson.completed") : t("lesson.complete")}
        </button>
        <nav class="lesson-nav">
          ${previous ? `<a href="#${previous.path}" data-testid="lesson-previous">${icon("arrow-left")}<span>${previous.title}</span></a>` : "<span></span>"}
          ${next ? `<a href="#${next.path}" data-testid="lesson-next"><span>${next.title}</span>${icon("arrow-right")}</a>` : ""}
        </nav>
      </footer>
    </article>
    <aside class="toc" data-testid="lesson-toc">
      <p class="toc-title">${icon("list", 14)}${t("lesson.onThisPage")}</p>
      <ul>${headings}</ul>
    </aside>
    </div>`
}

/**
 * Makes the "On this page" list work: a click scrolls to the section, and the
 * section you are reading is marked while you scroll.
 */
export function mountLessonToc(root: HTMLElement): void {
  const links = [...root.querySelectorAll<HTMLButtonElement>("[data-section]")]
  const sections = links.map((link) => document.getElementById(link.dataset.section ?? ""))

  // A section near the end of the page cannot reach the top of the screen,
  // so after a click we keep that section marked until you scroll by hand.
  let clicked: number | undefined

  for (const [index, link] of links.entries()) {
    link.addEventListener("click", () => {
      clicked = index
      sections[index]?.scrollIntoView({ behavior: "smooth", block: "start" })
      markCurrent()
    })
  }

  const markCurrent = () => {
    // The current section is the last heading that has passed the top of the screen.
    let current = 0
    for (const [index, section] of sections.entries()) {
      if (section && section.getBoundingClientRect().top <= 120) current = index
    }
    if (clicked !== undefined) current = clicked
    for (const [index, link] of links.entries()) {
      link.classList.toggle("active", index === current)
      if (index === current) link.setAttribute("aria-current", "true")
      else link.removeAttribute("aria-current")
    }
  }

  const scrolledByHand = () => {
    clicked = undefined
  }

  // Only one set of listeners at a time: remove the ones from the previous lesson.
  stopWatchingScroll?.()
  window.addEventListener("scroll", markCurrent, { passive: true })
  window.addEventListener("wheel", scrolledByHand, { passive: true })
  window.addEventListener("touchmove", scrolledByHand, { passive: true })
  window.addEventListener("keydown", scrolledByHand)
  stopWatchingScroll = () => {
    window.removeEventListener("scroll", markCurrent)
    window.removeEventListener("wheel", scrolledByHand)
    window.removeEventListener("touchmove", scrolledByHand)
    window.removeEventListener("keydown", scrolledByHand)
  }
  markCurrent()
}

let stopWatchingScroll: (() => void) | undefined

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
