// The whole site. It decides which page to show, based on the part of the URL
// after `#` (for example `#/lesson/01-programming/05-functions`).
//
// App also owns the two things that many components need:
//   - the language: a button changes it, and every text is drawn again
//   - the list of completed lessons
// When App's state changes, React draws App and its children again, so every
// call to t() gives the text in the new language.

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/Sidebar"
import { TopBar } from "@/components/TopBar"
import { findLesson } from "@/lib/content"
import { currentLocale, setLocale, type Locale } from "@/lib/i18n"
import { loadCompleted, saveCompleted } from "@/lib/progress"
import { useHashPath } from "@/lib/useHashPath"
import { HomePage } from "@/pages/HomePage"
import { LessonPage } from "@/pages/LessonPage"
import { NotFoundPage } from "@/pages/NotFoundPage"
import { PracticePage } from "@/pages/PracticePage"

export function App() {
  const path = useHashPath()
  const [locale, setLocaleState] = useState<Locale>(currentLocale)
  const [completed, setCompleted] = useState<string[]>(loadCompleted)

  const lesson = findLesson(path)

  function changeLocale(next: Locale) {
    setLocale(next) // saves it and sets <html lang>
    setLocaleState(next)
  }

  function toggleCompleted(lessonPath: string) {
    const next = completed.includes(lessonPath)
      ? completed.filter((item) => item !== lessonPath)
      : [...completed, lessonPath]
    saveCompleted(next)
    setCompleted(next)
  }

  // A new page starts at the top.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [path])

  // The tab title follows the lesson and its language.
  useEffect(() => {
    document.title = lesson ? `${lesson.title} · QAA Academy` : "QAA Academy"
  }, [lesson, locale])

  return (
    <>
      <TopBar path={path} locale={locale} onChangeLocale={changeLocale} />
      <div className="flex flex-col min-[900px]:grid min-[900px]:grid-cols-[18rem_minmax(0,1fr)]">
        <Sidebar path={path} completed={completed} />
        <div className="order-1 min-w-0 px-5 pt-8 pb-16 min-[900px]:order-2 min-[900px]:px-8 min-[900px]:pt-12 min-[900px]:pb-24">
          {path === "/" ? (
            <HomePage completed={completed} />
          ) : path === "/practice" ? (
            <PracticePage />
          ) : lesson ? (
            <LessonPage
              lesson={lesson}
              completed={completed}
              onToggleCompleted={toggleCompleted}
            />
          ) : (
            <NotFoundPage path={path} />
          )}
        </div>
      </div>
    </>
  )
}
