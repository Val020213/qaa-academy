// The course menu: every module with its lessons. A check marks the lessons
// the learner has completed. On a big screen it stays at the left; on a small
// screen it goes below the content.

import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { lessonsOf } from "@/lib/content"
import { currentLocale, t } from "@/lib/i18n"
import { modules } from "@/lib/modules"

interface SidebarProps {
  path: string
  completed: string[]
}

export function Sidebar({ path, completed }: SidebarProps) {
  const locale = currentLocale()

  return (
    <aside
      aria-label={t("sidebar.label")}
      data-testid="sidebar"
      className="order-2 border-t px-4 pt-6 pb-12 min-[900px]:sticky min-[900px]:top-14 min-[900px]:order-1 min-[900px]:h-[calc(100vh-3.5rem)] min-[900px]:overflow-y-auto min-[900px]:border-t-0 min-[900px]:border-r"
    >
      <nav aria-label={t("sidebar.lessons")} className="flex flex-col gap-7">
        {modules.map((courseModule, index) => (
          <section key={courseModule.id} data-testid="sidebar-module">
            <h2 className="mb-2 flex items-baseline gap-2 px-3 text-sm leading-5 font-semibold">
              <span className="font-mono text-xs font-normal text-muted-foreground">
                {index}
              </span>
              {courseModule.title[locale]}
            </h2>
            <ul>
              {lessonsOf(courseModule.id).map((lesson) => {
                const active = lesson.path === path
                const done = completed.includes(lesson.path)
                return (
                  <li key={lesson.path}>
                    <Button
                      asChild
                      variant="ghost"
                      className={`h-auto min-h-8 w-full justify-between gap-2 py-1.5 text-left leading-5 whitespace-normal ${
                        active ? "bg-muted font-medium" : "font-normal text-muted-foreground"
                      }`}
                    >
                      <a
                        href={`#${lesson.path}`}
                        aria-current={active ? "page" : undefined}
                        data-testid="sidebar-lesson-link"
                      >
                        <span>{lesson.title}</span>
                        {done && (
                          <>
                            <Check className="text-ok" aria-hidden="true" />
                            <span className="sr-only">{t("lesson.completed")}</span>
                          </>
                        )}
                      </a>
                    </Button>
                  </li>
                )
              })}
              {courseModule.planned.map((title) => (
                <li key={title}>
                  <span
                    data-testid="sidebar-lesson-planned"
                    className="block px-2.5 py-1.5 text-sm leading-5 text-muted-foreground italic"
                  >
                    {title}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </nav>
    </aside>
  )
}
