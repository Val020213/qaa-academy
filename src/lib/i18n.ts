// Languages of the site. The choice is saved in localStorage and applied as
// the `lang` attribute of the <html> element (a tiny script in index.html does
// it before the page is drawn).
//
// Two things are translated: the texts of the site itself (the `messages`
// below) and the lessons (one folder per language inside `content/`).
// The Practice app is NOT translated: tests check its texts, so they must
// stay the same in every language.

export type Locale = "en" | "es"

export const LOCALES: Locale[] = ["en", "es"]

const STORAGE_KEY = "qaa-academy:locale"

const messages = {
  en: {
    "nav.course": "Course",
    "nav.practice": "Practice app",
    "nav.main": "Main",
    "sidebar.label": "Course menu",
    "sidebar.lessons": "Lessons",
    "lesson.pager": "Previous and next lesson",
    "locale.switch": "Cambiar a español",
    "home.title": "From manual QA to QA Automation",
    "home.lead":
      "A hands-on course to learn programming with TypeScript and then write end-to-end tests with Playwright. It is made for someone who already knows how to test software and has never programmed.",
    "home.progress": "{done} of {total} lessons completed",
    "home.continue": "Continue: {title}",
    "home.module": "Module {number}",
    "home.moduleProgress": "{done} of {total} lessons",
    "home.comingSoon": "Coming soon",
    "home.open": "Open",
    "lesson.onThisPage": "On this page",
    "lesson.complete": "Mark as completed",
    "lesson.completed": "Completed",
    "notFound.title": "Page not found",
    "notFound.text": "There is nothing at {path}.",
    "notFound.back": "Back to the start",
    "theme.toLight": "Switch to light theme",
    "theme.toDark": "Switch to dark theme",
    "nav.github": "Course code on GitHub",
    "home.github": "Get the code on GitHub",
  },
  es: {
    "nav.course": "Curso",
    "nav.practice": "Practice app",
    "nav.main": "Principal",
    "sidebar.label": "Menú del curso",
    "sidebar.lessons": "Lecciones",
    "lesson.pager": "Lección anterior y siguiente",
    "locale.switch": "Switch to English",
    "home.title": "De QA manual a QA Automation",
    "home.lead":
      "Un curso práctico para aprender a programar con TypeScript y después escribir tests end-to-end con Playwright. Está hecho para quien ya sabe probar software y nunca ha programado.",
    "home.progress": "{done} de {total} lecciones completadas",
    "home.continue": "Continuar: {title}",
    "home.module": "Módulo {number}",
    "home.moduleProgress": "{done} de {total} lecciones",
    "home.comingSoon": "Próximamente",
    "home.open": "Abrir",
    "lesson.onThisPage": "En esta página",
    "lesson.complete": "Marcar como completada",
    "lesson.completed": "Completada",
    "notFound.title": "Página no encontrada",
    "notFound.text": "No hay nada en {path}.",
    "notFound.back": "Volver al inicio",
    "theme.toLight": "Cambiar a tema claro",
    "theme.toDark": "Cambiar a tema oscuro",
    "nav.github": "Código del curso en GitHub",
    "home.github": "Obtén el código en GitHub",
  },
} satisfies Record<Locale, Record<string, string>>

export type MessageKey = keyof (typeof messages)["en"]

export function currentLocale(): Locale {
  return document.documentElement.lang === "es" ? "es" : "en"
}

export function setLocale(locale: Locale): void {
  document.documentElement.lang = locale
  try {
    localStorage.setItem(STORAGE_KEY, locale)
  } catch {
    // No storage available: the language lasts until the page is reloaded.
  }
}

/**
 * The text for `key` in the current language.
 * `{name}` marks in the text are replaced with the matching value.
 */
export function t(key: MessageKey, values: Record<string, string | number> = {}): string {
  let text: string = messages[currentLocale()][key]
  for (const [name, value] of Object.entries(values)) {
    text = text.replace(`{${name}}`, String(value))
  }
  return text
}
