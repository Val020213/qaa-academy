// The start page: title, progress, one card per module and the GitHub link.

import { ArrowRight } from "lucide-react"
import { PageLead, PageTitle } from "@/components/PageTitle"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { allLessons, lessonsOf } from "@/lib/content"
import { currentLocale, t } from "@/lib/i18n"
import { icons } from "@/lib/icons"
import { modules } from "@/lib/modules"
import { countCompleted } from "@/lib/progress"
import { REPO_URL } from "@/lib/site"

// Links are always underlined, so colour is not the only clue that they are links.
const linkClass = "inline-flex items-center gap-1 text-link underline underline-offset-4"

export function HomePage({ completed }: { completed: string[] }) {
  const locale = currentLocale()
  const lessons = allLessons()
  const done = countCompleted(
    lessons.map((lesson) => lesson.path),
    completed
  )
  const next = lessons.find((lesson) => !completed.includes(lesson.path))

  return (
    <main data-testid="main" className="mx-auto max-w-[720px]">
      <PageTitle testId="home-title">{t("home.title")}</PageTitle>
      <PageLead>{t("home.lead")}</PageLead>

      {/* role="status": a screen reader announces the text when it changes. */}
      <Alert role="status" data-testid="home-progress" className="px-4 py-3">
        <AlertDescription>
          {t("home.progress", { done, total: lessons.length })}
          {next && (
            <>
              {" · "}
              <a href={`#${next.path}`} data-testid="home-continue" className={linkClass}>
                {t("home.continue", { title: next.title })}
              </a>
            </>
          )}
        </AlertDescription>
      </Alert>

      <div className="mt-6 grid gap-4 min-[600px]:grid-cols-2">
        {modules.map((courseModule, index) => {
          const written = lessonsOf(courseModule.id)
          const total = written.length + courseModule.planned.length
          const first = written[0]
          const Icon = icons[courseModule.icon]
          const status =
            written.length === 0
              ? t("home.comingSoon")
              : t("home.moduleProgress", {
                  done: countCompleted(
                    written.map((lesson) => lesson.path),
                    completed
                  ),
                  total,
                })

          return (
            <Card key={courseModule.id} data-testid="home-module-card" className="gap-4 py-5">
              <CardHeader className="gap-2">
                <Badge variant="outline" className="font-mono">
                  <Icon aria-hidden="true" />
                  {t("home.module", { number: index })}
                </Badge>
                {/* CardTitle is a <div>, so the real heading goes inside it. */}
                <CardTitle>
                  <h2 className="text-base font-semibold">{courseModule.title[locale]}</h2>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 text-sm leading-[22px] text-muted-foreground">
                {courseModule.description[locale]}
              </CardContent>
              <CardFooter className="justify-between border-t-0 bg-transparent pt-0 text-[13px]">
                <span data-testid="home-module-status" className="text-muted-foreground">
                  {status}
                </span>
                {first && (
                  <a href={`#${first.path}`} className={linkClass}>
                    {t("home.open")}
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </a>
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>

      <p className="mt-8 text-sm">
        <a
          href={REPO_URL}
          target="_blank"
          rel="noreferrer"
          data-testid="home-github"
          className={linkClass}
        >
          {t("home.github")}
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </a>
      </p>
    </main>
  )
}
