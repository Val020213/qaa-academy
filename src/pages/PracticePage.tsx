// The Practice app: a small "application under test" with the patterns that
// appear most in end-to-end tests (forms, lists, filters and slow loading).
// Every interactive element has a data-testid that follows the team rule:
// "<feature>-<element>".
//
// The Practice app is NOT translated: tests check its texts, so they stay in
// English in every language.

import { PageLead, PageTitle } from "@/components/PageTitle"
import { CasesPanel } from "@/practice/CasesPanel"
import { InlineCode } from "@/practice/InlineCode"
import { LoginPanel } from "@/practice/LoginPanel"
import { ReportPanel } from "@/practice/ReportPanel"

export function PracticePage() {
  return (
    <main data-testid="main" className="mx-auto max-w-[720px]">
      <section data-testid="playground">
        <PageTitle testId="playground-title">Practice app</PageTitle>
        <PageLead>
          A small application to automate. The example specs are in{" "}
          <InlineCode>e2e/playground.spec.ts</InlineCode>. Run them with{" "}
          <InlineCode>pnpm e2e:ui</InlineCode>.
        </PageLead>

        <div className="grid gap-6">
          <LoginPanel />
          <CasesPanel />
          <ReportPanel />
        </div>
      </section>
    </main>
  )
}
