// Loads the lessons (Markdown files in `content/`) and turns them into HTML.

import hljs from "highlight.js/lib/core"
import bash from "highlight.js/lib/languages/bash"
import css from "highlight.js/lib/languages/css"
import json from "highlight.js/lib/languages/json"
import typescript from "highlight.js/lib/languages/typescript"
import xml from "highlight.js/lib/languages/xml"
import yaml from "highlight.js/lib/languages/yaml"
import { Marked } from "marked"
import { currentLocale } from "./i18n.ts"
import { modules } from "./modules.ts"

hljs.registerLanguage("ts", typescript)
hljs.registerLanguage("bash", bash)
hljs.registerLanguage("json", json)
hljs.registerLanguage("html", xml)
hljs.registerLanguage("css", css)
hljs.registerLanguage("yaml", yaml)

export interface Lesson {
  moduleId: string
  slug: string
  /** Path inside the site, for example "/lesson/01-programming/05-functions". */
  path: string
  title: string
  summary: string
  duration: string
  /** The Markdown of the lesson, without the header. */
  body: string
}

// At build time, Vite replaces this call with an object:
// { "path/to/file.md": "content of the file" }.
const files = import.meta.glob<string>("../content/*/*/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
})

/**
 * Splits the header (the block between `---` with `key: value` lines) from
 * the rest of the Markdown.
 */
export function parseFrontmatter(source: string): {
  data: Record<string, string>
  body: string
} {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(source)
  if (!match) return { data: {}, body: source }

  const data: Record<string, string> = {}
  for (const line of (match[1] ?? "").split(/\r?\n/)) {
    const separator = line.indexOf(":")
    if (separator === -1) continue
    const key = line.slice(0, separator).trim()
    data[key] = line.slice(separator + 1).trim()
  }
  return { data, body: source.slice(match[0].length) }
}

interface LocalizedLesson extends Lesson {
  locale: string
}

function toLesson(filePath: string, source: string): LocalizedLesson | undefined {
  // "../content/en/01-programming/05-functions.md" → language, module and slug
  const match = /content\/([^/]+)\/([^/]+)\/([^/]+)\.md$/.exec(filePath)
  const locale = match?.[1]
  const moduleId = match?.[2]
  const slug = match?.[3]
  if (!locale || !moduleId || !slug) return undefined

  const { data, body } = parseFrontmatter(source)
  return {
    locale,
    moduleId,
    slug,
    path: `/lesson/${moduleId}/${slug}`,
    title: data.title ?? slug,
    summary: data.summary ?? "",
    duration: data.duration ?? "",
    body,
  }
}

const moduleOrder = modules.map((courseModule) => courseModule.id)

const everyLesson = Object.entries(files)
  .map(([filePath, source]) => toLesson(filePath, source))
  .filter((lesson) => lesson !== undefined)
  .filter((lesson) => moduleOrder.includes(lesson.moduleId))
  .sort(
    (a, b) =>
      moduleOrder.indexOf(a.moduleId) - moduleOrder.indexOf(b.moduleId) ||
      a.slug.localeCompare(b.slug)
  )

/**
 * All lessons in the current language, in the order they are studied.
 * English is the full course. A lesson that has no translation yet is shown
 * in English, so the path of a lesson is the same in every language.
 */
export function allLessons(): Lesson[] {
  const locale = currentLocale()
  const translated = new Map(
    everyLesson
      .filter((lesson) => lesson.locale === locale)
      .map((lesson) => [lesson.path, lesson])
  )
  return everyLesson
    .filter((lesson) => lesson.locale === "en")
    .map((lesson) => translated.get(lesson.path) ?? lesson)
}

export function lessonsOf(moduleId: string): Lesson[] {
  return allLessons().filter((lesson) => lesson.moduleId === moduleId)
}

export function findLesson(path: string): Lesson | undefined {
  return allLessons().find((lesson) => lesson.path === path)
}

const escapeHtml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

const markdown = new Marked({
  renderer: {
    code({ text, lang }) {
      const language = lang && hljs.getLanguage(lang) ? lang : undefined
      const html = language
        ? hljs.highlight(text, { language }).value
        : escapeHtml(text)
      return `<pre data-lang="${language ?? "text"}"><code>${html}</code></pre>`
    },
    link({ href, text }) {
      // External links open in a new tab.
      const external = /^https?:\/\//.test(href)
      const attrs = external ? ' target="_blank" rel="noreferrer"' : ""
      return `<a href="${href}"${attrs}>${text}</a>`
    },
  },
})

export function renderMarkdown(source: string): string {
  return markdown.parse(source, { async: false })
}
