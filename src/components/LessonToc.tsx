// The "On this page" list. A click scrolls to the section, and the section you
// are reading is marked (aria-current="true") while you scroll.

import { useEffect, useRef, useState } from "react"
import { List } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Heading } from "@/lib/content"
import { t } from "@/lib/i18n"

interface LessonTocProps {
  headings: Heading[]
}

export function LessonToc({ headings }: LessonTocProps) {
  const [current, setCurrent] = useState(0)
  // A section near the end of the page cannot reach the top of the screen,
  // so after a click we keep that section marked until you scroll by hand.
  const clicked = useRef<number | undefined>(undefined)

  useEffect(() => {
    clicked.current = undefined

    const markCurrent = () => {
      // The current section is the last heading that has passed the top of the screen.
      let found = 0
      headings.forEach((heading, index) => {
        const section = document.getElementById(heading.id)
        if (section && section.getBoundingClientRect().top <= 120) found = index
      })
      setCurrent(clicked.current ?? found)
    }

    // Wheel, touch and keys mean the reader is scrolling by hand.
    const scrolledByHand = () => {
      clicked.current = undefined
    }

    window.addEventListener("scroll", markCurrent, { passive: true })
    window.addEventListener("wheel", scrolledByHand, { passive: true })
    window.addEventListener("touchmove", scrolledByHand, { passive: true })
    window.addEventListener("keydown", scrolledByHand)
    markCurrent()

    // React runs this when the lesson changes or the page closes.
    return () => {
      window.removeEventListener("scroll", markCurrent)
      window.removeEventListener("wheel", scrolledByHand)
      window.removeEventListener("touchmove", scrolledByHand)
      window.removeEventListener("keydown", scrolledByHand)
    }
  }, [headings])

  function goTo(index: number, id: string) {
    clicked.current = index
    setCurrent(index)
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <aside
      aria-label={t("lesson.onThisPage")}
      data-testid="lesson-toc"
      className="sticky top-[calc(3.5rem+3rem)] hidden max-h-[calc(100vh-3.5rem-6rem)] self-start overflow-y-auto min-[1280px]:block"
    >
      <p className="mb-3 flex items-center gap-2 text-[13px] leading-5 font-medium">
        <List className="size-3.5" aria-hidden="true" />
        {t("lesson.onThisPage")}
      </p>
      <ul className="border-l">
        {headings.map((heading, index) => (
          <li key={heading.id}>
            <Button
              type="button"
              variant="ghost"
              onClick={() => goTo(index, heading.id)}
              aria-current={index === current ? "true" : undefined}
              data-testid="lesson-toc-link"
              className={`-ml-px h-auto w-full justify-start rounded-none border-0 border-l py-1 pr-0 pl-4 text-left text-[13px] leading-5 whitespace-normal hover:bg-transparent ${
                index === current
                  ? "border-l-foreground font-medium text-foreground"
                  : "border-l-transparent font-normal text-muted-foreground hover:text-foreground"
              }`}
            >
              {heading.text}
            </Button>
          </li>
        ))}
      </ul>
    </aside>
  )
}
