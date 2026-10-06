// One lesson: title, the lesson text, the "Mark as completed" button,
// previous/next links and the "On this page" list.

import { useMemo } from "react"
import { ArrowLeft, ArrowRight, Check, Clock } from "lucide-react"
import { LessonBody } from "@/components/LessonBody"
import { LessonToc } from "@/components/LessonToc"
import { PageLead, PageTitle } from "@/components/PageTitle"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { allLessons, lessonHeadings, type Lesson } from "@/lib/content"
import { currentLocale, t } from "@/lib/i18n"
import { modules } from "@/lib/modules"

interface LessonPageProps {
  lesson: Lesson
  completed: string[]
  onToggleCompleted: (lessonPath: string) => void
}

export function LessonPage({ lesson, completed, onToggleCompleted }: LessonPageProps) {
  const courseModule = modules.find((item) => item.id === lesson.moduleId)
  const lessons = allLessons()
  const index = lessons.findIndex((item) => item.path === lesson.path)
  const previous = lessons[index - 1]
  const next = lessons[index + 1]
  const done = completed.includes(lesson.path)

  // Only compute the headings again when the lesson text changes.
  const headings = useMemo(() => lessonHeadings(lesson.body), [lesson.body])

  return (
    <div className="mx-auto grid w-full max-w-[720px] gap-16 min-[1280px]:max-w-none min-[1280px]:grid-cols-[minmax(0,720px)_208px] min-[1280px]:justify-center">
      <main data-testid="main" className="min-w-0">
        <article>
          <p
            data-testid="lesson-module"
            className="mb-3 flex items-center gap-2 font-mono text-[13px] leading-5 text-muted-foreground"
          >
            {courseModule?.title[currentLocale()] ?? ""}
            {lesson.duration && (
              <span className="inline-flex items-center gap-1.5 border-l pl-3">
                <Clock className="size-3.5" aria-hidden="true" />
                {lesson.duration}
              </span>
            )}
          </p>
          <PageTitle testId="lesson-title">{lesson.title}</PageTitle>
          {lesson.summary && <PageLead>{lesson.summary}</PageLead>}
          <Separator className="mb-8" />

          <LessonBody markdown={lesson.body} />

          <footer className="mt-16 border-t pt-8">
            <Button
              type="button"
              variant={done ? "outline" : "default"}
              aria-pressed={done}
              onClick={() => onToggleCompleted(lesson.path)}
              data-testid="lesson-complete-toggle"
              className={`h-10 px-4 ${done ? "border-ok-border bg-ok-bg text-ok hover:bg-ok-bg" : ""}`}
            >
              <Check />
              {done ? t("lesson.completed") : t("lesson.complete")}
            </Button>

            <nav aria-label={t("lesson.pager")} className="mt-6 grid gap-4 min-[900px]:grid-cols-2">
              {previous ? (
                <Button
                  asChild
                  variant="outline"
                  className="h-auto justify-start gap-2.5 px-4 py-3.5 whitespace-normal"
                >
                  <a href={`#${previous.path}`} data-testid="lesson-previous">
                    <ArrowLeft />
                    <span>{previous.title}</span>
                  </a>
                </Button>
              ) : (
                <span className="max-[899px]:hidden" />
              )}
              {next && (
                <Button
                  asChild
                  variant="outline"
                  className="h-auto justify-end gap-2.5 px-4 py-3.5 text-right whitespace-normal min-[900px]:col-start-2"
                >
                  <a href={`#${next.path}`} data-testid="lesson-next">
                    <span>{next.title}</span>
                    <ArrowRight />
                  </a>
                </Button>
              )}
            </nav>
          </footer>
        </article>
      </main>
      <LessonToc headings={headings} />
    </div>
  )
}
