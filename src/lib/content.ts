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
import { iconHtml, type IconName } from "./icons.ts"
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
const files = import.meta.glob<string>("../../content/*/*/*.md", {
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

// The sections that every lesson has get an icon, in English and in Spanish.
const SECTION_ICONS: Record<string, IconName> = {
  "Start with a puzzle": "puzzle",
  "Empieza con un acertijo": "puzzle",
  Goal: "target",
  Objetivo: "target",
  "Go deeper": "layers",
  Profundiza: "layers",
  Practice: "pencil",
  "Práctica": "pencil",
  Challenge: "mountain",
  Reto: "mountain",
  "Think it through": "brain",
  "Piénsalo bien": "brain",
  "Check what you know": "circle-help",
  "Comprueba lo que sabes": "circle-help",
  "Research on your own": "search",
  "Investiga por tu cuenta": "search",
  "Next step": "arrow-right",
  "Siguiente paso": "arrow-right",
}

const CALLOUTS: Record<string, { kind: string; icon: IconName }> = {
  Note: { kind: "note", icon: "info" },
  Nota: { kind: "note", icon: "info" },
  Tip: { kind: "tip", icon: "lightbulb" },
  Consejo: { kind: "tip", icon: "lightbulb" },
  Careful: { kind: "careful", icon: "warning" },
  Cuidado: { kind: "careful", icon: "warning" },
}

// Counts the `##` headings of the lesson being rendered, to give each one an id.
let headingCount = 0

const markdown = new Marked({
  renderer: {
    heading({ tokens, depth }) {
      const html = this.parser.parseInline(tokens)
      if (depth !== 2) return `<h${depth}>${html}</h${depth}>\n`
      headingCount += 1
      const name = SECTION_ICONS[html.trim()]
      const mark = name ? `<span class="section-icon">${iconHtml(name, 18)}</span>` : ""
      return `<h2 id="section-${headingCount}">${mark}${html}</h2>\n`
    },
    blockquote({ tokens }) {
      // A quote that starts with **Note:**, **Tip:** or **Careful:** is a callout.
      const body = this.parser.parse(tokens)
      const label = /^<p><strong>([^<:]+):<\/strong>/.exec(body)?.[1] ?? ""
      const callout = CALLOUTS[label]
      if (!callout) return `<blockquote>${body}</blockquote>\n`
      return `<blockquote class="callout callout-${callout.kind}">${iconHtml(callout.icon, 18)}<div>${body}</div></blockquote>\n`
    },
    code({ text, lang }) {
      const language = lang && hljs.getLanguage(lang) ? lang : undefined
      const html = language
        ? hljs.highlight(text, { language }).value
        : escapeHtml(text)
      // tabindex="0" lets keyboard users scroll a wide code block.
      return `<pre data-lang="${language ?? "text"}" tabindex="0"><code>${html}</code></pre>`
    },
    image({ href, text }) {
      // A lesson shows a screen recording with the image syntax:
      //   ![What the clip shows](/clips/name.webm)
      // The text becomes the caption and the label for screen readers.
      if (/\.(webm|mp4)$/.test(href)) {
        return `<figure class="clip"><video controls muted loop playsinline preload="metadata" src="${href}" aria-label="${escapeHtml(text)}"></video><figcaption>${escapeHtml(text)}</figcaption></figure>`
      }
      return `<img src="${href}" alt="${escapeHtml(text)}" loading="lazy">`
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
  headingCount = 0
  const html = markdown.parse(source, { async: false })
  // A wide table scrolls sideways inside its own box. tabindex="0" lets
  // keyboard users scroll it too.
  return html
    .replaceAll("<table>", '<div class="table-wrap" tabindex="0"><table>')
    .replaceAll("</table>", "</table></div>")
}

export interface Heading {
  /** The id of the <h2> element in the rendered lesson. */
  id: string
  text: string
}

/** The `##` headings of a lesson, in order. They feed the "On this page" list. */
export function lessonHeadings(source: string): Heading[] {
  return markdown
    .lexer(source)
    .filter((token) => token.type === "heading" && token.depth === 2)
    .map((token, index) => ({
      id: `section-${index + 1}`,
      // Remove Markdown marks such as `code` and **bold** from the text.
      text: ("text" in token ? String(token.text) : "").replace(/[`*_]/g, ""),
    }))
}
