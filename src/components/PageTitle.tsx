// The big title and the intro text under it. Home, lessons, the Practice app
// and the not-found page share this look.

import type { ReactNode } from "react"

export function PageTitle({ children, testId }: { children: ReactNode; testId?: string }) {
  return (
    <h1
      data-testid={testId}
      className="mb-3 text-[32px] leading-10 font-semibold tracking-[-0.035em] text-balance min-[900px]:text-[40px] min-[900px]:leading-12 min-[900px]:tracking-[-0.04em]"
    >
      {children}
    </h1>
  )
}

export function PageLead({ children }: { children: ReactNode }) {
  return (
    <p className="mb-8 text-lg leading-7 tracking-[-0.012em] text-pretty text-muted-foreground min-[900px]:text-xl min-[900px]:leading-8">
      {children}
    </p>
  )
}
