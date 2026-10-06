// Shown when the address matches no page and no lesson.

import { PageTitle } from "@/components/PageTitle"
import { t } from "@/lib/i18n"

export function NotFoundPage({ path }: { path: string }) {
  // The text has a `{path}` mark where the address goes. We split the text
  // there so the address can be shown inside a <code> element.
  const [before, after] = t("notFound.text", { path: "{path}" }).split("{path}")

  return (
    <main data-testid="main" className="mx-auto max-w-[720px]">
      <section data-testid="not-found">
        <PageTitle testId="not-found-title">{t("notFound.title")}</PageTitle>
        <p className="leading-7">
          {before}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.875em]">{path}</code>
          {after}{" "}
          <a href="#/" className="text-link underline underline-offset-4">
            {t("notFound.back")}
          </a>
          .
        </p>
      </section>
    </main>
  )
}
