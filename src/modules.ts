// The map of the course. Each module matches one folder inside `content/en/`
// (and the same folder inside `content/es/` for the Spanish lessons).
// Lessons that already exist are read from that folder. `planned` lists the
// lessons that are not written yet, so the menu shows the full path from day one.

import type { Locale } from "./i18n.ts"

export interface CourseModule {
  /** Folder name inside `content/<language>/`, for example "01-programming". */
  id: string
  /** One text per language. */
  title: Record<Locale, string>
  description: Record<Locale, string>
  /** Titles of lessons that are not written yet. */
  planned: string[]
}

export const modules: CourseModule[] = [
  {
    id: "00-get-started",
    title: { en: "Get started", es: "Primeros pasos" },
    description: {
      en: "Install the tools on Windows, meet the terminal and run the course on your machine.",
      es: "Instala las herramientas en Windows, conoce la terminal y ejecuta el curso en tu máquina.",
    },
    planned: [],
  },
  {
    id: "01-programming",
    title: { en: "Programming basics with TypeScript", es: "Fundamentos de programación con TypeScript" },
    description: {
      en: "Learn to program from zero: values, decisions, functions, lists, objects, types and async code.",
      es: "Aprende a programar desde cero: valores, decisiones, funciones, listas, objetos, tipos y código asíncrono.",
    },
    planned: [],
  },
  {
    id: "02-git-and-the-web",
    title: { en: "Git and the web for QA", es: "Git y la web para QA" },
    description: {
      en: "Save your work with Git and learn how a web page is built: HTML, the DOM, selectors and DevTools.",
      es: "Guarda tu trabajo con Git y aprende cómo está hecha una página web: HTML, el DOM, selectores y DevTools.",
    },
    planned: [],
  },
  {
    id: "03-playwright",
    title: { en: "Playwright basics", es: "Playwright básico" },
    description: {
      en: "Your first end-to-end test: locators, actions, assertions and the tools to debug.",
      es: "Tu primer test end-to-end: locators, acciones, aserciones y las herramientas para depurar.",
    },
    planned: [],
  },
  {
    id: "04-good-practices",
    title: { en: "QAA good practices", es: "Buenas prácticas de QAA" },
    description: {
      en: "Tests that do not break on their own: isolation, data, fixtures, page objects and no fixed waits.",
      es: "Tests que no se rompen solos: aislamiento, datos, fixtures, page objects y cero esperas fijas.",
    },
    planned: [],
  },
  {
    id: "05-real-project",
    title: { en: "Real project", es: "Proyecto real" },
    description: {
      en: "Test the QA Shop back office, a Next.js app built like our real projects, and add your own specs.",
      es: "Prueba el back office de la QA Shop, una app Next.js hecha como nuestros proyectos reales, y agrega tus propios specs.",
    },
    planned: [],
  },
  {
    id: "06-references",
    title: { en: "References", es: "Referencias" },
    description: {
      en: "Documentation, articles and repositories to keep learning.",
      es: "Documentación, artículos y repositorios para seguir aprendiendo.",
    },
    planned: [],
  },
]
