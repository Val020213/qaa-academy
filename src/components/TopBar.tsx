// The bar at the top of every page: brand, main links, GitHub, language and theme.

import { LanguageToggle } from "@/components/LanguageToggle"
import { GithubMark } from "@/components/GithubMark"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Button } from "@/components/ui/button"
import { t, type Locale } from "@/lib/i18n"
import { REPO_URL } from "@/lib/site"

interface TopBarProps {
  path: string
  locale: Locale
  onChangeLocale: (locale: Locale) => void
}

export function TopBar({ path, locale, onChangeLocale }: TopBarProps) {
  const onPractice = path === "/practice"

  return (
    <header
      data-testid="topbar"
      className="sticky top-0 z-10 flex min-h-14 flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b bg-background/85 px-4 py-2 backdrop-blur sm:px-6"
    >
      <a
        href="#/"
        data-testid="topbar-home"
        className="rounded-md text-[15px] font-semibold tracking-tight"
      >
        QAA Academy
      </a>
      <nav aria-label={t("nav.main")} className="flex items-center gap-1">
        <Button asChild variant="ghost">
          <a
            href="#/"
            data-testid="topbar-course"
            aria-current={onPractice ? undefined : "page"}
            className={onPractice ? "text-muted-foreground" : ""}
          >
            {t("nav.course")}
          </a>
        </Button>
        <Button asChild variant="ghost">
          <a
            href="#/practice"
            data-testid="topbar-playground"
            aria-current={onPractice ? "page" : undefined}
            className={onPractice ? "" : "text-muted-foreground"}
          >
            {t("nav.practice")}
          </a>
        </Button>
        <Button asChild variant="outline" size="icon">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            aria-label={t("nav.github")}
            title={t("nav.github")}
            data-testid="topbar-github"
          >
            <GithubMark />
          </a>
        </Button>
        <LanguageToggle locale={locale} onChange={onChangeLocale} />
        <ThemeToggle />
      </nav>
    </header>
  )
}
